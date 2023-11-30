const db = require('../config/db.config');
const GroupModel = require('../models/group');

exports.createGroup = async (req, res) => {
  try {
    const { group_name } = req.body;
    const createdBy = req.user.userId; // Assuming you have userId in the token payload

    // Your logic to create a group in the database
    const newGroup = await GroupModel.createGroup(group_name, createdBy);
    const addedMember = GroupModel.addMember(newGroup.group_id, createdBy);
    res.status(201).json({ message: 'Group created successfully', group: newGroup });
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ message: 'Failed to create group' });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    // Your logic to delete the group from the database
    const deletedLikeCount = await GroupModel.removeLikesFromGroup(groupId);
    const deletedMemberCount = await GroupModel.removeAllGroupMembers(groupId);
    const deletedAllMessages = await GroupModel.removeAllGroupMessages(groupId);
    const deletedGroup = await GroupModel.deleteGroupById(groupId);
    
    if (!deletedGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (err) {
    console.error('Error deleting group:', err);
    res.status(500).json({ message: 'Failed to delete group' });
  }
};

exports.removeAllGroupMembers = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    // Your logic to remove all group members from the group
    const deletedMemberCount = await GroupModel.removeAllGroupMembers(groupId);

    res.status(200).json({ deletedMemberCount });
  } catch (err) {
    console.error('Error removing all group members from the group:', err);
    res.status(500).json({ message: 'Failed to remove all group members from the group' });
  }
};


exports.removeAllGroupMessages = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    // Your logic to remove all messages from the group
    const deletedMessageCount = await GroupModel.removeAllGroupMessages(groupId);

    res.status(200).json({ deletedMessageCount });
  } catch (err) {
    console.error('Error removing all messages from the group:', err);
    res.status(500).json({ message: 'Failed to remove all messages from the group' });
  }
};

exports.removeLikesFromGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    // Your logic to remove all likes from messages in the group
    const deletedLikeCount = await GroupModel.removeLikesFromGroup(groupId);

    res.status(200).json({ deletedLikeCount });
  } catch (err) {
    console.error('Error removing likes from messages in the group:', err);
    res.status(500).json({ message: 'Failed to remove likes from messages in the group' });
  }
};

exports.getGroupMembers = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    // Your logic to retrieve members of a group from the database
    const members = await GroupModel.getMembers(groupId);

    if (!members) {
      return res.status(404).json({ message: 'Members not found for this group' });
    }

    res.status(200).json({ members });
  } catch (err) {
    console.error('Error fetching group members:', err);
    res.status(500).json({ message: 'Failed to fetch group members' });
  }
};

exports.addMemberToGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userIdToAdd = req.body.userId; // Assuming userId to add is provided in the request body
    
    // Your logic to add a user to a group in the database
    const addedMember = await GroupModel.addMember(groupId, userIdToAdd);

    if (!addedMember) {
      return res.status(404).json({ message: 'Failed to add user to the group' });
    }

    res.status(201).json({ message: addedMember?.message || 'User added to the group successfully' });
  } catch (err) {
    console.error('Error adding user to group:', err);
    res.status(500).json({ message: 'Failed to add user to the group' });
  }
};


exports.deleteMemberFromGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userIdToDelete = req.params.userId;

    // Check if the user is the group admin (creator)
    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.created_by == userIdToDelete) {
      return res.status(403).json({ message: 'Group admin cannot be deleted' });
    }

    // Your logic to delete a member from the group in the database
    const deletedMember = await GroupModel.deleteMember(groupId, userIdToDelete);

    if (!deletedMember) {
      return res.status(404).json({ message: 'Failed to delete member from the group' });
    }

    res.status(200).json({ message: 'Member deleted from the group successfully' });
  } catch (err) {
    console.error('Error deleting member from group:', err);
    res.status(500).json({ message: 'Failed to delete member from the group' });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.userId;
    const cursor = req.query.cursor || null; // Get cursor from query parameters, if provided

    // Your logic to fetch messages in a group with cursor-based pagination
    const messages = await GroupModel.getGroupMessages(groupId, cursor, userId);

    res.status(200).json({ messages });
  } catch (err) {
    console.error('Error fetching group messages with cursor pagination:', err);
    res.status(500).json({ message: 'Failed to fetch group messages' });
  }
};

exports.sendMessageToGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.userId; // Assuming userId is stored in req.user after authentication
    const { messageContent } = req.body; // Assuming userId and messageContent are provided in the request body

    // Your logic to send a message to a group in the database
    const sentMessage = await GroupModel.sendMessageToGroup(groupId, userId, messageContent);

    if (!sentMessage) {
      return res.status(400).json({ message: 'Failed to send message to the group' });
    }

    res.status(201).json({ message: 'Message sent to the group successfully' });
  } catch (err) {
    console.error('Error sending message to group:', err);
    res.status(500).json({ message: 'Failed to send message to the group' });
  }
};

exports.removeGroupMessage = async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const userId = req.user.userId; // Assuming userId is stored in req.user after authentication

    // Check if the user is the creator of the message
    const isCreator = await GroupModel.isMessageCreator(groupId, messageId, userId);

    if (!isCreator) {
      return res.status(403).json({ message: 'You are not allowed to delete this message' });
    }

    // Your logic to remove the message from the group
    await GroupModel.removeLikesOfMessageId(messageId);
    const deletedCount = await GroupModel.removeMessageFromGroup(groupId, messageId);

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Message not found or you do not have permission to delete' });
    }

    res.status(200).json({ message: 'Message removed successfully' });
  } catch (err) {
    console.error('Error removing message from the group:', err);
    res.status(500).json({ message: 'Failed to remove message from the group' });
  }
};


exports.likeMessage = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const messageId = req.params.messageId;
    const userId = req.user.userId; // Assuming userId is stored in req.user after authentication

    // Your logic to like a specific message in a group in the database
    const liked = await GroupModel.toggleLikeMessage(groupId, messageId, userId);

    if (!liked) {
      return res.status(400).json({ message: 'Failed to like the message' });
    }

    res.status(200).json({ message: 'Message liked successfully' });
  } catch (err) {
    console.error('Error liking the message:', err);
    res.status(500).json({ message: 'Failed to like the message' });
  }
};
