const express = require('express');
const router = express.Router();
const { ensureLoggedIn } = require('../middleware/auth');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../helpers/expressError');
const Message = require('../models/messageModel');
const Discussion = require('../models/discussionModel');
const Group = require('../models/groupModel'); // Needed for membership checks

/**
 * messages.js
 *
 * Provides routes under the /messages endpoint for creating and retrieving
 * messages within a discussion. Users must typically belong to the relevant group
 * or be an admin to view or post messages.
 */

/**
 * GET /messages/:discussionId
 * Retrieves all messages in a discussion.
 *
 * Authorization required: Group members, group creator, or admin.
 */
router.get('/:discussionId', ensureLoggedIn, async (req, res, next) => {
    try {
        const discussionId = req.params.discussionId;
        const userId = res.locals.user.userId;
        const isAdmin = res.locals.user.isAdmin;

        // Ensure the discussion exists
        const discussion = await Discussion.getDiscussionById(discussionId);
        if (!discussion) throw new NotFoundError("Discussion not found.");

        // Check if user is a group member or the group creator
        const isMember = await Group.isUserInGroup(discussion.group_id, userId);
        const isGroupCreator = await Group.isGroupCreator(discussion.group_id, userId);

        if (!isAdmin && !isMember && !isGroupCreator) {
            throw new UnauthorizedError("You must be a group member, the group creator, or an admin to view messages.");
        }

        const messages = await Message.getMessagesByDiscussion(discussionId);
        res.json(messages);
    } catch (err) {
        return next(err);
    }
});

/**
 * POST /messages/:discussionId
 * Adds a message to a discussion.
 *
 * Authorization required: Group members or the group creator.
 */
router.post('/:discussionId', ensureLoggedIn, async (req, res, next) => {
    try {
        const discussionId = req.params.discussionId;
        const userId = res.locals.user.userId;
        const { content } = req.body;

        if (!content) throw new BadRequestError("Message content is required.");

        // Ensure the discussion exists
        const discussion = await Discussion.getDiscussionById(discussionId);
        if (!discussion) throw new NotFoundError("Discussion not found.");

        // Check if user is a group member or the group creator
        const isMember = await Group.isUserInGroup(discussion.group_id, userId);
        const isGroupCreator = await Group.isGroupCreator(discussion.group_id, userId);

        if (!isMember && !isGroupCreator) {
            throw new UnauthorizedError("Only group members or the group creator can add messages.");
        }

        const newMessage = await Message.addMessage(discussionId, userId, content);
        res.status(201).json(newMessage);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
