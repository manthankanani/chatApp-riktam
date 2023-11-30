const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const groupRoutes = require('./src/routes/group');


const app = express();
const server = http.createServer(app);

// Middleware
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


