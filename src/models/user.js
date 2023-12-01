const db = require('../config/db.config');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const UserModel = {};

UserModel.create = async ({ username, password, email, is_admin }) => {
  try {
    password = await bcrypt.hash(password, 10); // 10 is the salt round

    // Check if the email or user_id already exists
    const [existingUser1] = await db.promise().query('SELECT * FROM Users WHERE email = ? OR user_id = ?', [email, email]);
    const [existingUser2] = await db.promise().query('SELECT * FROM Users WHERE email = ? OR user_id = ?', [username, username]);

    if (existingUser1.length > 0 || existingUser2.length > 0) {
      throw new Error('Email or user already exists. Please use a different email or user ID.');
    }

    const query = 'INSERT INTO Users (username, password, email, is_admin) VALUES (?, ?, ?, ?)';
    const values = [username, password, email, is_admin];

    const [result] = await db.promise().query(query, values);
    const insertedUserId = result.insertId;

    const [user] = await db.promise().query('SELECT * FROM Users WHERE user_id = ?', [insertedUserId]);

    if (user.length === 0) {
      throw new Error('User not found after insertion');
    }
    delete user[0].password;
    return user[0];
  } catch (err) {
    throw new Error(`Error creating user: ${err.message}`);
  }
};

UserModel.findOneByUsername = async (username) => {
    try {
      const [users] = await db.promise().query('SELECT * FROM Users WHERE username = ?', [username]);
      return users[0];
    } catch (err) {
      throw new Error(`Error finding user: ${err.message}`);
    }
};

UserModel.findById = async (userId) => {
  try {
    const [users] = await db.promise().query('SELECT * FROM Users WHERE user_id = ?', [userId]);
    return users[0];
  } catch (err) {
    throw new Error(`Error finding user: ${err.message}`);
  }
};

UserModel.updateUser = async (userId, updatedFields) => {
  try {
    let { username, password, email, is_admin } = updatedFields;

    // Build the update query based on provided fields
    let updateQuery = 'UPDATE Users SET ';
    const updateValues = [];

    if (username !== undefined) {
      updateQuery += 'username = ?, ';
      updateValues.push(username);
    }
    if (password !== undefined) {
      password = await bcrypt.hash(password, 10); // 10 is the salt round
      updateQuery += 'password = ?, ';
      updateValues.push(password);
    }
    if (email !== undefined) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      updateQuery += 'email = ?, ';
      updateValues.push(email);
    }
    if (is_admin !== undefined) {
      updateQuery += 'is_admin = ?, ';
      updateValues.push(is_admin);
    }

    // Remove the trailing comma and space
    updateQuery = updateQuery.slice(0, -2);

    updateQuery += ' WHERE user_id = ?';
    updateValues.push(userId);

    // Execute the update query
    await db.promise().query(updateQuery, updateValues);

    // Fetch and return the updated user
    const [updatedUser] = await db.promise().query('SELECT * FROM Users WHERE user_id = ?', [userId]);
    delete updatedUser[0].password;
    return updatedUser[0];
  } catch (err) {
    throw new Error(`Error updating user: ${err.message}`);
  }
};

UserModel.deleteUserById = async (userId) => {
  try {
    const [result] = await db.promise().query('DELETE FROM users WHERE user_id = ?', [userId]);
    if (result.affectedRows === 0) {
      return null;
    }
    return result;
  } catch (err) {
    throw new Error(`Error deleting user: ${err.message}`);
  }
};


  

// Add other methods for user-related operations if needed (update, delete, get user by ID, etc.)

module.exports = UserModel;
