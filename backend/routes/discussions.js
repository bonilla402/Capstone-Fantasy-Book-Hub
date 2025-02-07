const express = require('express');
const router = express.Router();
const { ensureLoggedIn } = require('../middleware/auth');
const { UnauthorizedError, BadRequestError, NotFoundError } = require('../helpers/expressError');
const Group = require('../models/groupModel');
const Discussion = require('../models/discussionModel');

/**
 * GET /discussion/:groupId
 * Retrieves all discussions within a group.
 *
 * Authorization required: Admin, group member, or group creator.
 * @example Response:
 * [
 *   {
 *     "id": 1,
 *     "group_id": 2,
 *     "book": {
 *       "id": 10,
 *       "title": "The Hobbit",
 *       "cover_image": "https://example.com/hobbit.jpg"
 *     },
 *     "title": "Exploring Fantasy Worlds",
 *     "content": "Let's discuss the best fantasy books.",
 *     "created_by": "booklover",
 *     "created_at": "2024-02-06T12:00:00.000Z"
 *   }
 * ]
 */
router.get('/:groupId', ensureLoggedIn, async (req, res, next) => {
    try {
        const groupId = req.params.groupId;
        const userId = res.locals.user.userId;
        const isAdmin = res.locals.user.isAdmin;

        const isMember = await Group.isUserInGroup(groupId, userId);
        if (!isAdmin && !isMember) {
            throw new UnauthorizedError("You must be a group member or an admin to view discussions.");
        }

        const discussions = await Discussion.getDiscussionsByGroup(groupId);
        res.json(discussions);
    } catch (err) {
        return next(err);
    }
});

/**
 * POST /discussion/:groupId
 * Creates a new discussion in a group.
 *
 * Authorization required: Any logged-in group member.
 */
router.post('/:groupId', ensureLoggedIn, async (req, res, next) => {
    try {
        const { bookId, title, content } = req.body;
        const groupId = req.params.groupId;
        const userId = res.locals.user.userId;

        if (!title || !content || !bookId) {
            throw new BadRequestError("Title, content, and bookId are required.");
        }

        const isMember = await Group.isUserInGroup(groupId, userId);
        if (!isMember) {
            throw new UnauthorizedError("You must be a group member to create discussions.");
        }

        const newDiscussion = await Discussion.createDiscussion(groupId, userId, bookId, title, content);
        res.status(201).json(newDiscussion);
    } catch (err) {
        return next(err);
    }
});

/**
 * PATCH /discussion/:id
 * Updates a discussion title or content.
 *
 * Authorization required: Discussion creator or group creator.
 */
router.patch('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const discussionId = req.params.id;
        const userId = res.locals.user.userId;
        const isAdmin = res.locals.user.isAdmin;
        const { title, content } = req.body;

        if (!title && !content) {
            throw new BadRequestError("At least one field (title or content) must be provided.");
        }

        const isCreator = await Discussion.isDiscussionCreator(discussionId, userId);
        const groupCreatorId = await Discussion.getGroupCreatorByDiscussion(discussionId);

        if (!isCreator && userId !== groupCreatorId && !isAdmin) {
            throw new UnauthorizedError("You do not have permission to update this discussion.");
        }

        const updatedDiscussion = await Discussion.updateDiscussion(discussionId, title, content);
        if (!updatedDiscussion) throw new NotFoundError("Discussion not found.");

        res.json(updatedDiscussion);
    } catch (err) {
        return next(err);
    }
});

/**
 * DELETE /discussion/:id
 * Deletes a discussion.
 *
 * Authorization required: Discussion creator, group creator, or admin.
 */
router.delete('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const discussionId = req.params.id;
        const userId = res.locals.user.userId;
        const isAdmin = res.locals.user.isAdmin;

        const isCreator = await Discussion.isDiscussionCreator(discussionId, userId);
        const groupCreatorId = await Discussion.getGroupCreatorByDiscussion(discussionId);

        if (!isCreator && userId !== groupCreatorId && !isAdmin) {
            throw new UnauthorizedError("You do not have permission to delete this discussion.");
        }

        await Discussion.deleteDiscussion(discussionId);
        res.json({ message: "Discussion deleted." });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
