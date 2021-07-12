const Users = require('../models/users-model.js')
const Games = require('../models/games-model.js')
const Systems = require('../models/systems-model.js')
const Difficulty = require('../models/difficulty-model.js')
const Challenges = require('../models/challenges-model.js')
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/secret.js');

//*************** RESTRICTION (AUTHORIZATION) *****************//

function restrictedAdmin(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    res
      .status(401)
      .json({ errorMessage: 'Token is missing. Must be an authorized admin' });
  }
  else if (token == process.env.AUTHORIZATION_KEY) {
    next();
  } else {
    res
      .status(401)
      .json({ errorMessage: 'Token is incorrect. Must be an authorized admin' });
  }
}

function restrictedUser(req, res, next) {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        //i.e: the token is not valid
        res.status(401).json({ errorMessage: 'Session has expired. Please login again.' })
      } else {
        req.user = { id: decodedToken.id };
        next();
      }
    });
  } else {
    res.status(401).json({ errorMessage: 'Must be an authorized user / token is missing' });
  }
}

//*************** USERS ROUTER *****************//

function validateUserId(req, res, next) {
  const { userId } = req.params;
  id = userId

  // Some endpoints do not require a user ID if specifically set to no-user, but I still want form validation for the rest
  if (userId !== 'no-user') {
    Users.findUsersBy({ id })
      .then(user => {
        if (user.length > 0) {
          next();
        } else {
          res.status(404).json({
            errorMessage: 'The user with the specified ID does not exist'
          });
        }
      })
      .catch(error => {
        res.status(500).json({
          errorMessage:
            'Could not validate user information for the specified ID'
        });
      });
  } else {
    next();
  }
}

function validateUsername(req, res, next) {
  const { username } = req.params;

  Users.findUsersBy({ username })
    .then(user => {
      if (user.length > 0) {
        next();
      } else {
        res.status(404).json({
          errorMessage: 'The user with the specified username does not exist'
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        errorMessage:
          'Could not validate user information for the specified ID'
      });
    });
}

function checkForUserData(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({
      errorMessage: 'body is empty / missing user data'
    });
  } else if (
    !req.body.username ||
    !req.body.email ||
    !req.body.password
  ) {
    res.status(400).json({
      errorMessage: 'username, email, and password are required fields'
    });
  } else {
    Users.findIfUserNameExists(req.body.username)
      .then(username => {
        Users.findIfUserEmailExists(req.body.email)
          .then(user_email => {
            if (username) {
              res.status(400).json({
                errorMessage: 'username already exists. Please pick a different username.'
              });
            } else if (user_email) {
              res.status(400).json({
                errorMessage: 'email address already exists. Please pick a different email address.'
              });
            } else {
              next();
            }
          })
      })
      .catch(error => {
        res.status(500).json({
          errorMessage:
            'could not check user data'
        });
      });
  }
}

//*************** GAMES ROUTER *****************//

function validateGameId(req, res, next) {
  const { gameId } = req.params;
  id = gameId

  Games.findGamesBy({ id })
    .then(game => {
      if (game.length > 0) {
        next();
      } else {
        res.status(404).json({
          errorMessage: 'The game with the specified ID does not exist'
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        errorMessage:
          'Could not validate game information for the specified ID'
      });
    });
}

function checkForGameData(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({
      errorMessage: 'body is empty / missing game data'
    });
  } else if (
    !req.body.name
  ) {
    res.status(400).json({
      errorMessage: 'name is a required field'
    });
  } else {
    Games.findIfGameExists(req.body.name)
      .then(gamename => {
        if (gamename) {
          res.status(400).json({
            errorMessage: 'game already exists. Please pick a different game.'
          });
        } else {
          next();
        }
      })
      .catch(error => {
        res.status(500).json({
          errorMessage:
            'could not check game data'
        });
      });
  }
}

//*************** SYSTEMS ROUTER *****************//

function validateSystemId(req, res, next) {
  const { systemId } = req.params;
  id = systemId

  Systems.findSystemsBy({ id })
    .then(system => {
      if (system.length > 0) {
        next();
      } else {
        res.status(404).json({
          errorMessage: 'The system with the specified ID does not exist'
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        errorMessage:
          'Could not validate system information for the specified ID'
      });
    });
}

function checkForSystemData(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({
      errorMessage: 'body is empty / missing system data'
    });
  } else if (
    !req.body.name
  ) {
    res.status(400).json({
      errorMessage: 'name is a required field'
    });
  } else {
    Systems.findIfSystemExists(req.body.name)
      .then(systemname => {
        if (systemname) {
          res.status(400).json({
            errorMessage: 'system already exists. Please pick a different system.'
          });
        } else {
          next();
        }
      })
      .catch(error => {
        res.status(500).json({
          errorMessage:
            'could not check system data'
        });
      });
  }
}

//*************** DIFFICULTY ROUTER *****************//

function validateDifficultyId(req, res, next) {
  const { difficultyId } = req.params;
  id = difficultyId

  Difficulty.findDifficultiesBy({ id })
    .then(difficulty => {
      if (difficulty.length > 0) {
        next();
      } else {
        res.status(404).json({
          errorMessage: 'The difficulty with the specified ID does not exist'
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        errorMessage:
          'Could not validate difficulty information for the specified ID'
      });
    });
}

function checkForDifficultyData(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({
      errorMessage: 'body is empty / missing difficulty data'
    });
  } else if (
    !req.body.name ||
    !req.body.points
  ) {
    res.status(400).json({
      errorMessage: 'name and points are required fields'
    });
  } else {
    next();
  }
}

//*************** CHALLENGES ROUTER *****************//

function validateChallengeId(req, res, next) {
  const { challengeId } = req.params;
  id = challengeId

  Challenges.findChallengesBy({ id })
    .then(challenge => {
      if (challenge.length > 0) {
        next();
      } else {
        res.status(404).json({
          errorMessage: 'The challenge with the specified ID does not exist'
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        errorMessage:
          'Could not validate challenge information for the specified ID'
      });
    });
}

function checkForChallengeData(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({
      errorMessage: 'body is empty / missing challenge data'
    });
  } else if (
    !req.body.name ||
    !req.body.game_id ||
    !req.body.user_id ||
    !req.body.system_id ||
    !req.body.difficulty_id
  ) {
    res.status(400).json({
      errorMessage: 'name, game_id, user_id, system_id, and difficulty_id are required fields'
    });
  } else {
    next();
  }
}

function checkForChallengeAcceptedData(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({
      errorMessage: 'body is empty / missing user challenge data'
    });
  } else if (
    !req.body.user_id
  ) {
    res.status(400).json({
      errorMessage: 'user_id is a required field'
    });
  } else {
    Challenges.findIfChallengeAlreadyAccepted(req.body.user_id, req.params.challengeId)
      .then(userChallenge => {
        if (userChallenge) {
          res.status(400).json({
            errorMessage: 'user has already accepted this challenge.'
          });
        } else {
          next();
        }
      })
      .catch(error => {
        res.status(500).json({
          errorMessage:
            'could not check user challenge data'
        });
      });
  }
}

function checkForChallengeAbandonedData(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({
      errorMessage: 'body is empty / missing user challenge data'
    });
  } else if (
    !req.body.user_id
  ) {
    res.status(400).json({
      errorMessage: 'user_id is a required field'
    });
  } else {
    Challenges.findIfChallengeAlreadyAccepted(req.body.user_id, req.params.challengeId)
      .then(userChallenge => {
        if (!userChallenge) {
          res.status(400).json({
            errorMessage: 'user has not accepted this challenge'
          });
        } else {
          next();
        }
      })
      .catch(error => {
        res.status(500).json({
          errorMessage:
            'could not check user challenge data'
        });
      });
  }
}

module.exports = {
  restrictedAdmin,
  restrictedUser,
  validateUserId,
  validateUsername,
  checkForUserData,
  validateGameId,
  checkForGameData,
  validateSystemId,
  checkForSystemData,
  validateDifficultyId,
  checkForDifficultyData,
  validateChallengeId,
  checkForChallengeData,
  checkForChallengeAcceptedData,
  checkForChallengeAbandonedData
};