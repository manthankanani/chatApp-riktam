const db = require('../config/db.config');

const GroupModel = {};

GroupModel.createGroup = async (groupName, createdBy) => {
  try {
    const query = 'INSERT INTO Groups (group_name, created_by) VALUES (?, ?)';
    const values = [groupName, createdBy];

    const [result] = await db.promise().query(query, values);
    const insertedGroupId = result.insertId;

    const [group] = await db.promise().query('SELECT * FROM Groups WHERE group_id = ?', [insertedGroupId]);

    if (group.length === 0) {
      throw new Error('Group not found after insertion');
    }

    return group[0];
  } catch (err) {
    throw new Error(`Error creating group: ${err.message}`);
  }
};

GroupModel.getGroups = async (userId) => {
  try {
    const [groups] = await db.promise().query('SELECT g.* FROM `groups` g LEFT JOIN group_members gm ON gm.group_id = g.group_id where gm.user_id= ?', [userId]);
    return groups;
  } catch (err) {
    throw new Error(`Error finding group: ${err.message}`);
  }
};

GroupModel.deleteGroupById = async (groupId) => {
  try {
    const [result] = await db.promise().query('DELETE FROM groups WHERE group_id = ?', [groupId]);
    if (result.affectedRows === 0) {
      return null;
    }
    return result;
  } catch (err) {
    throw new Error(`Error deleting group: ${err.message}`);
  }
};

GroupModel.removeLikesFromGroup = async (groupId) => {
  try {
    const [result] = await db.promise().query('DELETE ml FROM message_likes ml JOIN group_messages gm ON ml.message_id = gm.message_id WHERE gm.group_id = ?', [groupId]);

    return result.affectedRows; // Returns the number of affected rows (deleted likes)
  } catch (err) {
    throw new Error(`Error removing likes from messages in the group: ${err.message}`);
  }
};

GroupModel.removeLikesOfMessageId = async (messageId) => {
  try {
    const [result] = await db.promise().query('DELETE FROM message_likes ml WHERE message_id = ?', [messageId]);

    return result.affectedRows; // Returns the number of affected rows (deleted likes)
  } catch (err) {
    throw new Error(`Error removing likes from messages in the group: ${err.message}`);
  }
};


GroupModel.removeAllGroupMessages = async (groupId) => {
  try {
    const [result] = await db.promise().query('DELETE FROM group_messages WHERE group_id = ?', [groupId]);

    return result.affectedRows; // Returns the number of affected rows (deleted messages)
  } catch (err) {
    throw new Error(`Error removing all messages from the group: ${err.message}`);
  }
};

GroupModel.removeAllGroupMembers = async (groupId) => {
  try {
    const [result] = await db.promise().query('DELETE FROM group_members WHERE group_id = ?', [groupId]);

    return result.affectedRows; // Returns the number of affected rows (deleted members)
  } catch (err) {
    throw new Error(`Error removing all group members from the group: ${err.message}`);
  }
};


GroupModel.isMessageCreator = async (groupId, messageId, userId) => {
  try {
    const [result] = await db.promise().query(
      'SELECT user_id FROM group_messages WHERE group_id = ? AND message_id = ?',
      [groupId, messageId]
    );

    if (result.length === 0 || result[0].user_id !== userId) {
      return false;
    }

    return true;
  } catch (err) {
    throw new Error(`Error checking message creator: ${err.message}`);
  }
};

GroupModel.removeMessageFromGroup = async (groupId, messageId) => {
  try {
    const [result] = await db.promise().query('DELETE FROM group_messages WHERE group_id = ? AND message_id = ?', [
      groupId,
      messageId,
    ]);

    return result.affectedRows;
  } catch (err) {
    throw new Error(`Error removing message from the group: ${err.message}`);
  }
};

GroupModel.findById = async (groupId) => {
  try {
    const [groups] = await db.promise().query('SELECT * FROM Groups WHERE group_id = ?', [groupId]);
    return groups[0];
  } catch (err) {
    throw new Error(`Error finding group: ${err.message}`);
  }
};

GroupModel.getMembers = async (groupId) => {
  try {
    const [members] = await db.promise().query('SELECT * FROM group_members WHERE group_id = ?', [groupId]);
    return members;
  } catch (err) {
    throw new Error(`Error fetching group members: ${err.message}`);
  }
};

GroupModel.addMember = async (groupId, userId) => {
  try {
    // Check if the user is already a member of the group
    const [existingMember] = await db.promise().query('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?', [groupId, userId]);

    if (existingMember.length > 0) {
      return { message: 'User is already a member of the group' };
    }

    // Add the user to the group
    const [result] = await db.promise().query('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [groupId, userId]);

    if (result.affectedRows === 0) {
      return null;
    }

    return result;
  } catch (err) {
    throw new Error(`Error adding user to group: ${err.message}`);
  }

};

GroupModel.deleteMember = async (groupId, userId) => {
  try {
    // Check if the user is the group admin (creator)
    const [group] = await db.promise().query('SELECT created_by FROM groups WHERE group_id = ?', [groupId]);

    if (group.length === 0) {
      return null; // Group not found
    }

    if (group[0].created_by === userId) {
      return { message: 'Group admin cannot be deleted' };
    }

    // Delete the member from the group
    const [result] = await db.promise().query('DELETE FROM group_members WHERE group_id = ? AND user_id = ?', [groupId, userId]);

    if (result.affectedRows === 0) {
      return null;
    }

    return result;
  } catch (err) {
    throw new Error(`Error deleting member from group: ${err.message}`);
  }
};

GroupModel.getGroupMessages = async (groupId, cursor, userId) => {
  try {
    let query = `SELECT 
      gm.*, COUNT(ml.like_id) AS like_count, CASE WHEN EXISTS ( SELECT 1 FROM message_likes WHERE message_id = gm.message_id AND user_id = ? ) THEN true ELSE false END AS liked 
      FROM group_messages gm 
      LEFT JOIN message_likes ml ON gm.message_id = ml.message_id 
      WHERE gm.group_id = ?`;
    const params = [userId, groupId];

    if (cursor) {
      query += ' AND gm.message_id < ?'; // Assuming message_id is the cursor for pagination
      params.push(cursor);
    }

    query += ' GROUP BY gm.message_id ORDER BY gm.message_id DESC LIMIT 50'; // Fetch 50 messages per page

    // Fetch messages with cursor-based pagination from the database
    const [messages] = await db.promise().query(query, params);
    
    return messages;
  } catch (err) {
    throw new Error(`Error fetching group messages with cursor pagination: ${err.message}`);
  }
};

GroupModel.sendMessageToGroup = async (groupId, userId, messageContent) => {
  try {
    // Your logic to send a message to a group in the database
    const [result] = await db.promise().query(
      'INSERT INTO group_messages (group_id, user_id, message_content, timestamp) VALUES (?, ?, ?, NOW())',
      [groupId, userId, messageContent]
    );
    const insertedMessageId = result.insertId;

    const [message] = await db.promise().query('SELECT * FROM group_messages WHERE message_id = ?', [insertedMessageId]);

    if (message.length === 0) {
      throw new Error('Message not found after insertion');
    }

    return message[0];
  } catch (err) {
    throw new Error(`Error sending message to group: ${err.message}`);
  }
};

GroupModel.toggleLikeMessage = async (groupId, messageId, userId) => {
  try {
    // Check if the user has already liked the message
    const [existingLike] = await db.promise().query(
      'SELECT * FROM message_likes WHERE group_id = ? AND message_id = ? AND user_id = ?',
      [groupId, messageId, userId]
    );

    if (existingLike.length > 0) {
      // If like exists, remove the like (dislike)
      const [result] = await db.promise().query(
        'DELETE FROM message_likes WHERE group_id = ? AND message_id = ? AND user_id = ?',
        [groupId, messageId, userId]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return { liked: false };
    } else {
      // If like doesn't exist, add the like
      const [result] = await db.promise().query(
        'INSERT INTO message_likes (group_id, message_id, user_id) VALUES (?, ?, ?)',
        [groupId, messageId, userId]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return { liked: true };
    }
  } catch (err) {
    throw new Error(`Error toggling like for the message: ${err.message}`);
  }
};


module.exports = GroupModel;
