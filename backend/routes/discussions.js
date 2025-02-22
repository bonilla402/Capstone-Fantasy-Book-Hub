const express = require('express');
const router = express.Router();
const { ensureLoggedIn } = require('../middleware/auth');
const { UnauthorizedError, BadRequestError, NotFoundError } = require('../helpers/expressError');
const Group = require('../models/groupModel');
const Discussion = require('../models/discussionModel');

/**
 * discussions.js
 *
 * Provides routes under the /discussion endpoint for managing discussion threads.
 * This includes:
 *  - Retrieving discussions within a group
 *  - Creating new discussions
 *  - Updating and deleting existing discussions
 *  - Viewing a single discussion by ID
 *
 * Authorization Notes:
 *  - Most routes require the user to be logged in.
 *  - Checking membership or ownership is handled within the route logic.
 */

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
        const isGroupCreator = await Group.isGroupCreator(groupId, userId);

        if (!isMember && !isGroupCreator && !isAdmin) {
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
 * Authorization required: Any logged-in group member or group creator.
 *
 * @param {number} groupId - The ID of the group in which to create the discussion.
 * @body {number} bookId - The ID of the book being discussed.
 * @body {string} title - The title of the new discussion.
 * @body {string} content - The main text content of the discussion.
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
        const isGroupCreator = await Group.isGroupCreator(groupId, userId);

        if (!isMember && !isGroupCreator) {
            throw new UnauthorizedError("You must be a group member or the group creator to create discussions.");
        }

        const newDiscussion = await Discussion.createDiscussion(groupId, userId, bookId, title, content);
        res.status(201).json(newDiscussion);
    } catch (err) {
        return next(err);
    }
});

/**
 * PATCH /discussion/:id
 * Updates a discussion's title or content.
 *
 * Authorization required: Discussion creator, group creator, or admin.
 *
 * @param {number} id - The discussion's ID.
 * @body {string} [title] - Optional updated discussion title.
 * @body {string} [content] - Optional updated discussion content.
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
 * Deletes a discussion by its ID.
 *
 * Authorization required: Discussion creator, group creator, or admin.
 *
 * @param {number} id - The discussion's ID.
 * @returns {Object} 200 - A confirmation message.
 * @example Response:
 * {
 *   "message": "Discussion deleted."
 * }
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

/**
 * GET /discussions/detail/:discussionId
 * Retrieves a single discussion by ID.
 *
 * Authorization required: Must be a member of the group or group creator/admin.
 *
 * @param {number} discussionId - The discussion's ID.
 * @returns {Object} 200 - The discussion details.
 */
router.get('/detail/:discussionId', ensureLoggedIn, async (req, res, next) => {
    try {
        const { discussionId } = req.params;
        const userId = res.locals.user.userId;
        const isAdmin = res.locals.user.isAdmin;

        // Fetch discussion details
        const discussion = await Discussion.getDiscussionById(discussionId);
        if (!discussion) throw new NotFoundError("Discussion not found.");

        // Check if user is a member of the discussion's group
        const isMember = await Group.isUserInGroup(discussion.group_id, userId);
        const isGroupCreator = await Group.isGroupCreator(discussion.group_id, userId);

        if (!isMember && !isGroupCreator && !isAdmin) {
            throw new UnauthorizedError("You must be a group member to view this discussion.");
        }

        res.json(discussion);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
