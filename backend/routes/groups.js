const express = require('express');
const router = express.Router();
const { ensureLoggedIn } = require('../middleware/auth');
const { UnauthorizedError, BadRequestError, NotFoundError } = require('../helpers/expressError');
const Group = require('../models/groupModel');

/**
 * GET /groups
 * Retrieves all discussion groups.
 *
 * Authorization required: Any logged-in user.
 * @example Response:
 * [
 *   {
 *     "id": 1,
 *     "group_name": "Fantasy Readers",
 *     "description": "A group for fantasy book lovers.",
 *     "created_by": 2,
 *     "created_by_username": "booklover",
 *     "created_at": "2024-02-06T12:00:00.000Z"
 *   }
 * ]
 */
router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const groups = await Group.getAllGroups();
        res.json(groups);
    } catch (err) {
        return next(err);
    }
});

router.get("/search", ensureLoggedIn, async (req, res, next) => {
    try {
        const { author, title, topic, groupTitle, groupDescription } = req.query;
        
        const groups = await Group.searchGroups(author, title, topic, groupTitle, groupDescription);
        res.json(groups);
    } catch (err) {
        return next(err);
    }
});


/**
 * GET /groups/:id
 * Retrieves a specific discussion group.
 *
 * Authorization required: Any logged-in user.
 */
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const group = await Group.getGroupById(req.params.id);
        if (!group) throw new NotFoundError("Discussion group not found.");
        res.json(group);
    } catch (err) {
        return next(err);
    }
});

/**
 * POST /groups
 * Creates a new discussion group.
 *
 * Authorization required: Any logged-in user.
 */
router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const { groupName, description } = req.body;
        if (!groupName) throw new BadRequestError("Group name is required.");

        const newGroup = await Group.createGroup(groupName, description, res.locals.user.userId);
        res.status(201).json(newGroup);
    } catch (err) {
        return next(err);
    }
});

/**
 * PATCH /groups/:id
 * Updates a discussion group's name or description.
 *
 * Authorization required: Only the creator or an admin.
 */
router.patch('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const groupId = req.params.id;
        const userId = res.locals.user.userId;
        const isAdmin = res.locals.user.isAdmin;
        const { groupName, description } = req.body;

        if (!groupName && !description) {
            throw new BadRequestError("At least one field (groupName or description) must be provided.");
        }

        const isOwner = await Group.isGroupOwner(groupId, userId);
        if (!isAdmin && !isOwner) {
            throw new UnauthorizedError("You do not have permission to update this group.");
        }

        const updatedGroup = await Group.updateGroup(groupId, groupName, description);
        if (!updatedGroup) throw new NotFoundError("Group not found.");

        res.json(updatedGroup);
    } catch (err) {
        return next(err);
    }
});

/**
 * DELETE /groups/:id
 * Deletes a discussion group.
 *
 * Authorization required: Only the creator or an admin.
 */
router.delete('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const groupId = req.params.id;
        const userId = res.locals.user.userId;
        const isAdmin = res.locals.user.isAdmin;

        const isOwner = await Group.isGroupOwner(groupId, userId);
        if (!isAdmin && !isOwner) {
            throw new UnauthorizedError("You do not have permission to delete this group.");
        }

        await Group.deleteGroup(groupId);
        res.json({ message: "Group deleted." });
    } catch (err) {
        return next(err);
    }
});

/**
 * POST /groups/:id/join
 * Adds the logged-in user to a discussion group.
 *
 * Authorization required: Logged-in user.
 */
router.post('/:id/join', ensureLoggedIn, async (req, res, next) => {
    try {
        const groupId = req.params.id;
        const userId = res.locals.user.userId;

        // Ensure user is not already in the group
        const isMember = await Group.isUserInGroup(groupId, userId);
        if (isMember) throw new BadRequestError("User is already in the group.");

        const result = await Group.addUserToGroup(groupId, userId);
        res.json({ message: "User added to group.", group_id: result.group_id, user_id: result.user_id });

    } catch (err) {
        return next(err);
    }
});

/**
 * DELETE /groups/:id/leave
 * Removes the logged-in user from a discussion group.
 *
 * Authorization required: Logged-in user.
 */
router.delete('/:id/leave', ensureLoggedIn, async (req, res, next) => {
    try {
        const groupId = req.params.id;
        const userId = res.locals.user.userId;

        // Ensure user is in the group before removing
        const isMember = await Group.isUserInGroup(groupId, userId);
        if (!isMember) throw new BadRequestError("User is not a member of this group.");

        await Group.removeUserFromGroup(groupId, userId);
        res.json({ message: "User removed from group." });

    } catch (err) {
        return next(err);
    }
});

/**
 * GET /groups/:id/members
 * Retrieves all members of a discussion group.
 *
 * Authorization required: Admin or group member.
 */
router.get('/:id/members', ensureLoggedIn, async (req, res, next) => {
    try {
        const groupId = req.params.id;
        const members = await Group.getGroupMembers(groupId);
        res.json(members);
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /groups/:id/is-member
 * Checks if the logged-in user is a member of the group.
 *
 * Authorization required: Logged-in user.
 * @returns {Object} { isMember: true/false }
 */
router.get('/:id/is-member', ensureLoggedIn, async (req, res, next) => {
    try {
        const groupId = req.params.id;
        const userId = res.locals.user.userId;
        const isAdmin = res.locals.user.isAdmin;

        // Admins are always considered members
        if (isAdmin) {
            return res.json({ isMember: true });
        }

        const isMember = await Group.isUserInGroup(groupId, userId);
        res.json({ isMember });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
