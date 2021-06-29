const router = require('express').Router();
const Games = require('../models/games-model.js')
const { validateGameId, validateUserId, checkForGameData, restrictedUser, restrictedAdmin } = require('../middleware/index.js');

//*************** GET ALL PUBLIC GAMES *****************//
router.get('/public', restrictedAdmin, (req, res) => {
  Games.findPublicGames()
    .then(games => {
      res.json(games);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting all games to display'
      });
    });
});

//*************** GET ALL PRIVATE GAMES *****************//
router.get('/private', restrictedAdmin, (req, res) => {
  Games.findPrivateGames()
    .then(games => {
      res.json(games);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting all games to display'
      });
    });
});

//*************** GET GAME BY ID *****************//
router.get('/:gameId', validateGameId, restrictedAdmin, (req, res) => {
  const { gameId } = req.params;

  Games.findGameById(gameId)
    .then(game => {
      res.json(game);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting this game'
      });
    });
});

//*************** GET ALL OF A GAME'S CHALLENGES *****************//
router.get('/:gameId/challenges', validateGameId, restrictedAdmin, (req, res) => {
  const { gameId } = req.params;

  Games.findGameChallenges(gameId)
    .then(challenges => {
      res.json(challenges);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting all game challenges for this user to display'
      });
    });
});

//*************** GET ALL OF A GAME'S CHALLENGES WITH COMPLETION FOR USER *****************//
router.get('/:gameId/users/:userId/challenges', validateGameId, validateUserId, restrictedAdmin, (req, res) => {
  const { gameId } = req.params;
  const { userId } = req.params;

  Games.findGameChallenges(gameId, userId)
    .then(challenges => {
      res.json(challenges);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting all game challenges for this user to display'
      });
    });
});

//*************** GET ALL OF A GAME'S CHALLENGES SORTED BY POPULARITY *****************//
router.get('/:gameId/challenges/popular', validateGameId, restrictedAdmin, (req, res) => {
  const { gameId } = req.params;

  Games.findGameChallengesByPopularity(gameId)
    .then(challenges => {
      res.json(challenges);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting all game challenges sorted by popularity to display'
      });
    });
});

//*************** GET ALL OF A GAME'S CHALLENGES SORTED BY POPULARITY WITH COMPLETION FOR USER *****************//
router.get('/:gameId/users/:userId/challenges/popular', validateGameId, validateUserId, restrictedAdmin, (req, res) => {
  const { gameId } = req.params;
  const { userId } = req.params;

  Games.findGameChallengesByPopularity(gameId, userId)
    .then(challenges => {
      res.json(challenges);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting all game challenges sorted by popularity to display'
      });
    });
});

//*************** ADD NEW GAME TO THE DATABASE *****************//
router.post('/', checkForGameData, restrictedUser, (req, res) => {
  let game = req.body;

  Games.addGame(game)
    .then(response => {
      setTimeout(function () { // Give it some loading time
        res.status(201).json(response);
      }, 2000)
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error adding this game to the database'
      });
    });
});

//*************** REMOVE GAME FROM THE DATABASE  *****************//
router.delete('/:gameId', validateGameId, restrictedAdmin, (req, res) => {
  const gameId = req.params.gameId;

  Games.removeGameById(gameId)
    .then(response => {
      res.status(200).json({
        success: `The game was successfully deleted`,
        id: gameId
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error deleting this game`
      });
    });
});

//*************** UPDATE GAME *****************//
router.put('/:gameId', validateGameId, restrictedAdmin, (req, res) => {
  const gameId = req.params.gameId;
  var changes = req.body;
  changes.updated_at = new Date() // rewrites updated_at timestamp to current time of update

  Games.updateGameById(gameId, changes)
    .then(response => {
      res.status(200).json({ updatedGame: response });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error updating this game`
      });
    });
});

module.exports = router;