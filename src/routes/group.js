const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group');
const authMiddleware = require('../middleware/auth');

router.post('/groups', authMiddleware.isAuthenticated, groupController.createGroup);
router.get('/groups', authMiddleware.isAuthenticated, groupController.getGroups);
router.delete('/groups/:groupId', authMiddleware.isGroupOwnerOrAdmin, groupController.deleteGroup);
router.get('/groups/:groupId/members', authMiddleware.isAuthenticated, groupController.getGroupMembers);
router.post('/groups/:groupId/members', authMiddleware.isAuthenticated, groupController.addMemberToGroup);
router.delete('/groups/:groupId/members/:userId', authMiddleware.isAuthenticated, groupController.deleteMemberFromGroup);

router.get('/groups/:groupId/messages', authMiddleware.isAuthenticated, groupController.getGroupMessages);
router.post('/groups/:groupId/messages', authMiddleware.isAuthenticated, groupController.sendMessageToGroup);
router.post('/groups/:groupId/messages/:messageId/like', authMiddleware.isAuthenticated, groupController.likeMessage);
router.delete('/groups/:groupId/messages/:messageId', authMiddleware.isAuthenticated, groupController.removeGroupMessage);

module.exports = router;
