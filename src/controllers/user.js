const UserModel = require('../models/user');
const validator = require('validator');

exports.createUser = async (req, res) => {
  try {
    // Extract user details from the request body
    const { username, password, email, is_admin } = req.body;

    // Your logic to create a user in the database
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // For example, using a User model and inserting into the Users table
    const newUser = await UserModel.create({
      username,
      password,
      email,
      is_admin,
      // Other necessary fields
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

exports.editUserByAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { username, password, email, is_admin } = req.body;

    // Check if the user exists
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user details
    const updatedUser = await UserModel.updateUser(userId, { username, password, email, is_admin });

    res.status(200).json({ message: 'User details updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating user details:', err);
    res.status(500).json({ message: 'Failed to update user details' });
  }
};

