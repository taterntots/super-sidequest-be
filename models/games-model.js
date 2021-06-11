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
    .leftOuterJoin('users as u', 'c.user_id', 'u.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .leftOuterJoin('systems as s', 'c.system_id', 's.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .where('c.game_id', gameId)
    .select([
      'c.id as challenge_id',
      'c.name',
      'c.description',
      'u.username',
      'g.name as game_title',
      'g.banner_pic_URL',
      's.name as system',
      'd.name as difficulty',
      'd.points',
      'c.rules',
      'c.is_high_score',
      'c.is_speedrun',
      'c.featured',
      'c.prize',
      'c.start_date',
      'c.end_date',
      'c.created_at',
      'c.updated_at'
    ])
    .groupBy('c.id', 'u.id', 'g.id', 's.id', 'd.id')
    .orderBy('c.created_at', 'desc')
    .then(gameChallenges => {
      // Map through the gameChallegnes and find number of users who accepted each one
      return Promise.all(gameChallenges.map(gameChallenge => {
        return db('userChallenges as uc')
          .where('uc.challenge_id', gameChallenge.challenge_id)
          .then(challenges => {
            return {
              ...gameChallenge,
              active_users: challenges.length
            }
          })
      }))
    })
}

//FIND ALL OF A GAME'S CHALLENGES SORTED BY POPULARITY
function findGameChallengesByPopularity(gameId) {
  return db('challenges as c')
    .leftOuterJoin('users as u', 'c.user_id', 'u.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .leftOuterJoin('systems as s', 'c.system_id', 's.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .where('c.game_id', gameId)
    .select([
      'c.id as challenge_id',
      'c.name',
      'c.description',
      'u.username',
      'g.name as game_title',
      'g.banner_pic_URL',
      's.name as system',
      'd.name as difficulty',
      'd.points',
      'c.rules',
      'c.is_high_score',
      'c.is_speedrun',
      'c.featured',
      'c.prize',
      'c.start_date',
      'c.end_date',
      'c.created_at',
      'c.updated_at'
    ])
    .groupBy('c.id', 'u.id', 'g.id', 's.id', 'd.id')
    .then(gameChallenges => {
      // Map through the gameChallegnes and find number of users who accepted each one
      return Promise.all(gameChallenges.map(gameChallenge => {
        return db('userChallenges as uc')
          .where('uc.challenge_id', gameChallenge.challenge_id)
          .then(challenges => {
            return {
              ...gameChallenge,
              active_users: challenges.length
            }
          })
      }))
        .then(activeUserChallenges => {
          // Sort by number of users who accepted the challenge
          let sortedByActiveUsersArray = activeUserChallenges.sort((a, b) => b.active_users - a.active_users)
          return sortedByActiveUsersArray
        })
    })
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
  findGameChallengesByPopularity,
  findGamesBy,
  addGame,
  removeGameById,
  updateGameById,
  findIfGameExists
};