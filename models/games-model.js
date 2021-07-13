const db = require('../data/dbConfig.js');

//FIND ALL PUBLIC GAMES
function findPublicGames() {
  return db('games as g')
    .where('g.public', true)
    .orderBy('g.name', 'asc')
    .then(publicGames => {
      // Find total number of challenges for each game
      return Promise.all(publicGames.map(publicGame => {
        return db('challenges as c')
          .where('c.game_id', publicGame.id)
          .then(challenges => {
            return {
              ...publicGame,
              challenge_total: challenges.length
            }
          })
      }))
    })
}

//FIND ALL PRIVATE GAMES
function findPrivateGames() {
  return db('games as g')
    .where('g.public', false)
    .orderBy('g.name', 'asc')
    .then(privateGames => {
      // Find total number of challenges for each game
      return Promise.all(privateGames.map(privateGame => {
        return db('challenges as c')
          .where('c.game_id', privateGame.id)
          .then(challenges => {
            return {
              ...privateGame,
              challenge_total: challenges.length
            }
          })
      }))
    })
}

//FIND ONLY GAMES A USER HAS ACCEPTED CHALLANGES FOR
function findUserAcceptedGames(userId) {
  gameHash = []
  userAcceptedGames = []

  return db('userChallenges as uc')
    .leftOuterJoin('challenges as c', 'uc.challenge_id', 'c.id')
    .where('uc.user_id', userId)
    .select([
      'uc.*',
      'c.game_id'
    ])
    .groupBy('c.id', 'uc.id')
    .then(userAcceptedChallenges => {
      // Map through user accepted/completed challenges, storing unique games in a hash
      Promise.all(userAcceptedChallenges.map(userAcceptedChallenge => {
        if (!gameHash.includes(userAcceptedChallenge.game_id)) {
          gameHash.push(userAcceptedChallenge.game_id)
        }
      }))
      return db('challenges as c')
        .where('c.user_id', userId)
        .then(userCreatedChallenges => {
          // Map through user created challenges, storing unique games in a hash
          Promise.all(userCreatedChallenges.map(userCreatedChallenge => {
            if (!gameHash.includes(userCreatedChallenge.game_id)) {
              gameHash.push(userCreatedChallenge.game_id)
            }
          }))
          return db('games as g')
            .where('g.public', true)
            .orderBy('g.name', 'asc')
            .then(publicGames => {
              // Map through public games, comparing game ids in hash table
              Promise.all(publicGames.map(publicGame => {
                if (gameHash.includes(publicGame.id)) {
                  userAcceptedGames.push(publicGame)
                }
              }))
              return userAcceptedGames
            })
        })
    })
}

//FIND GAME BY ID
function findGameById(gameId) {
  return db('games as g')
    .where('g.id', gameId)
    .first()
}

//FIND ALL OF A GAME'S CHALLENGES
function findGameChallenges(gameId, userId) {
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
      // Map through the gameChallenges and find number of users who accepted each one
      return Promise.all(gameChallenges.map(gameChallenge => {
        return db('userChallenges as uc')
          .where('uc.challenge_id', gameChallenge.challenge_id)
          .then(challenges => {
            // Map through the current users challenges to see which ones they completed, only if user is signed in
            if (userId !== 'no-user') {
              return db('userChallenges as uc')
                .where('uc.challenge_id', gameChallenge.challenge_id)
                .where('uc.user_id', userId)
                .first()
                .then(userChallenge => {
                  if (userChallenge) {
                    // Append completed bool is userChallenge exists (true or false)
                    return {
                      ...gameChallenge,
                      active_users: challenges.length,
                      is_active: userChallenge.is_active,
                      completed: userChallenge.completed
                    }
                  } else {
                    // Otherwise, don't worry about the completed bool
                    return {
                      ...gameChallenge,
                      active_users: challenges.length
                    }
                  }
                })
            } else {
              // If user is not signed in, simply return without accounting for completion
              return {
                ...gameChallenge,
                active_users: challenges.length
              }
            }
          })
      }))
    })
}

//FIND ALL OF A GAME'S CHALLENGES SORTED BY POPULARITY
function findGameChallengesByPopularity(gameId, userId) {
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
      // Map through the gameChallenges and find number of users who accepted each one
      return Promise.all(gameChallenges.map(gameChallenge => {
        return db('userChallenges as uc')
          .where('uc.challenge_id', gameChallenge.challenge_id)
          .then(challenges => {
            // Map through the current users challenges to see which ones they completed, only if user is signed in
            if (userId !== 'no-user') {
              return db('userChallenges as uc')
                .where('uc.challenge_id', gameChallenge.challenge_id)
                .where('uc.user_id', userId)
                .first()
                .then(userChallenge => {
                  if (userChallenge) {
                    // Append completed bool is userChallenge exists (true or false)
                    return {
                      ...gameChallenge,
                      active_users: challenges.length,
                      is_active: userChallenge.is_active,
                      completed: userChallenge.completed
                    }
                  } else {
                    // Otherwise, don't worry about the completed bool
                    return {
                      ...gameChallenge,
                      active_users: challenges.length
                    }
                  }
                })
            } else {
              // If user is not signed in, simply return without accounting for completion
              return {
                ...gameChallenge,
                active_users: challenges.length
              }
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
  findPublicGames,
  findPrivateGames,
  findUserAcceptedGames,
  findGameById,
  findGameChallenges,
  findGameChallengesByPopularity,
  findGamesBy,
  addGame,
  removeGameById,
  updateGameById,
  findIfGameExists
};