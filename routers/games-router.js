const router = require('express').Router();
const Games = require('../models/games-model.js')
const { validateGameId, checkForGameData } = require('../middleware/index.js');

//*************** GET ALL GAMES *****************//
router.get('/', (req, res) => {
  Games.findGames()
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
router.get('/:gameId', validateGameId, (req, res) => {
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

//*************** ADD NEW GAME TO THE DATABASE *****************//
router.post('/', checkForGameData, (req, res) => {
  let game = req.body;

  Games.addGame(game)
    .then(response => {
      res.status(201).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error adding this game to the database'
      });
    });
});

//*************** REMOVE GAME FROM THE DATABASE  *****************//
router.delete('/:gameId', validateGameId, (req, res) => {
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
router.put('/:gameId', validateGameId, (req, res) => {
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