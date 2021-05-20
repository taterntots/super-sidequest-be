const Users = require('../models/users-model.js')
const Games = require('../models/games-model.js')

//*************** RESTRICTION (AUTHORIZATION) *****************//

function restricted(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    res
      .status(401)
      .json({ errorMessage: 'Token is missing. Must be an authorized user' });
  }
  else if (token == process.env.AUTHORIZATION_KEY) {
    next();
  } else {
    res
      .status(401)
      .json({ errorMessage: 'Token is incorrect. Must be an authorized user' });
  }
}

//*************** USERS ROUTER *****************//

function validateUserId(req, res, next) {
  const { userId } = req.params;
  id = userId

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
}

function checkForUserData(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({
      errorMessage: 'body is empty / missing user data'
    });
  } else if (
    !req.body.username ||
    !req.body.email
  ) {
    res.status(400).json({
      errorMessage: 'username and email are required fields'
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

module.exports = {
  restricted,
  validateUserId,
  checkForUserData,
  validateGameId,
  checkForGameData
};