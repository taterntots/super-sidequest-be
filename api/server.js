const express = require('express'); //importing a CommonJS module
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan'); //for logging middleware
const server = express(); //creates the server
require('dotenv').config(); //Lets us use environmental variables

// Global Middleware
server.use(express.json()); //middleware needed to parse JSON
server.use(helmet()); //middleware that adds a layer of security to the server
server.use(cors()); //middleware that allows cross domain communication from the browser
server.use(morgan('tiny')); //logger middleware

// Authorization Middleware
const { restrictedAdmin } = require('../middleware/index.js');

// Router Imports
const authRouter = require('../routers/auth-router.js');
const usersRouter = require('../routers/users-router.js');
const gamesRouter = require('../routers/games-router.js');
const systemsRouter = require('../routers/systems-router.js');
const difficultyRouter = require('../routers/difficulty-router.js');
const challengesRouter = require('../routers/challenges-router.js');

// Endpoints
server.get('/', (req, res) => {
  res.status(200).json({
    welcome: `to the danger zone!`,
    environment: process.env.NODE_ENV
  });
});

// Routes
server.use('/api/auth', authRouter);
server.use('/api/users', restrictedAdmin, usersRouter);
server.use('/api/games', restrictedAdmin, gamesRouter);
server.use('/api/systems', restrictedAdmin, systemsRouter);
server.use('/api/difficulty', restrictedAdmin, difficultyRouter);
server.use('/api/challenges', challengesRouter);

module.exports = server;