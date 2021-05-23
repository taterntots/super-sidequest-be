const db = require('../data/dbConfig.js');

//FIND ALL GAMES
function findGames() {
  return db('games')
}

//FIND GAME BY ID
function findGameById(gameId) {
  return db('games as g')
    .where('g.id', gameId)
    .first()
}

//FIND ALL OF A GAME'S CHALLENGES
function findGameChallenges(gameId) {
  return db('challenges as c')
    .where('c.game_id', gameId)
}

//FIND GAMES BY A SPECIFIC FILTER (NEEDED FOR VALIDATION MIDDLEWARE)
function findGamesBy(filter) {
  return db('games')
    .where(filter);
}

//ADD A GAME TO THE DATABASE
function addGame(game) {
  return db('games')
    .insert(game, 'id')
    .then(([id]) => {
      return findGameById(id);
    });
}

//DELETE A GAME FROM THE DATABASE
function removeGameById(gameId) {
  return db('games')
    .where('id', gameId)
    .del()
}

//UPDATE A GAME
function updateGameById(gameId, changes) {
  return db('games')
    .where('id', gameId)
    .update(changes)
    .then(game => {
      return findGameById(gameId);
    })
}

//FIND IF A GAME EXISTS IN OUR DB AND RETURN TRUE OR FALSE
function findIfGameExists(gameName) {
  return db('games as g')
    .where('g.name', gameName)
    .first()
    .then(game => {
      if (game) {
        return true
      } else {
        return false
      }
    })
}

module.exports = {
  findGames,
  findGameById,
  findGameChallenges,
  findGamesBy,
  addGame,
  removeGameById,
  updateGameById,
  findIfGameExists
};