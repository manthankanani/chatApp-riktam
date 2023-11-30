const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/user');
const { removeFromRevokedTokens } = require('../middleware/auth');
const { JWT_SECRET } = require('../config/auth.config');



exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Your logic to check if the user is an admin
    const adminUser = await UserModel.findOneByUsername(username);
    if (!adminUser || !adminUser.is_admin) {
      return res.status(401).json({ message: 'Invalid credentials or not an admin' });
    }

    // Validate password
    const passwordMatch = await bcrypt.compare(password, adminUser.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token for admin
    const token = jwt.sign({ userId: adminUser.user_id, is_admin: 1 }, JWT_SECRET, { expiresIn: '2h' });

    res.status(200).json({ message: 'Admin logged in successfully', token });
  } catch (err) {
    console.error('Error during admin login:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Retrieve user by username
    const user = await UserModel.findOneByUsername(username);
    
    // admin can also login to this application
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token for user
    const token = jwt.sign({ userId: user.user_id, is_admin: user.is_admin }, JWT_SECRET, { expiresIn: '2h' });

    res.status(200).json({ message: 'User logged in successfully', token });
  } catch (err) {
    console.error('Error during user login:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.userLogout = async (req, res) => {
  try {
    // Assuming the token is sent in the Authorization header
    const token = req.headers.authorization;

    if (!token) {
      return res.status(400).json({ message: 'Token not provided' });
    }

    // Add the token to the revoked tokens list
    removeFromRevokedTokens(token);

    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Error during user logout:', err);
    res.status(500).json({ message: 'Logout failed' });
  }
};