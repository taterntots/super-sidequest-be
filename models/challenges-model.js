const db = require('../data/dbConfig.js');

//FIND ALL CHALLENGES
function findChallenges() {
  return db('challenges as c')
    .leftOuterJoin('users as u', 'c.user_id', 'u.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .leftOuterJoin('systems as s', 'c.system_id', 's.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .select([
      'c.id as challenge_id',
      'c.name',
      'c.description',
      'u.username',
      'c.user_id',
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
}

//FIND ALL RECENT CHALLENGES (LIMITED TO SIX FOR HOMEPAGE)
function findRecentChallenges(userId) {
  return db('challenges as c')
    .leftOuterJoin('users as u', 'c.user_id', 'u.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .leftOuterJoin('systems as s', 'c.system_id', 's.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .select([
      'c.id as challenge_id',
      'c.name',
      'c.description',
      'u.username',
      'c.user_id',
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
    .limit(6)
    .orderBy('c.created_at', 'desc')
    .then(recentChallenges => {
      // Loop through recent challenges, finding active users and attaching a completed bool if a user has accepted a challenge
      return Promise.all(recentChallenges.map(recentChallenge => {
        return db('userChallenges as uc')
          .where('uc.challenge_id', recentChallenge.challenge_id)
          .then(userChallenges => {
            if (userId) {
              return db('userChallenges as uc')
                .where('uc.challenge_id', recentChallenge.challenge_id)
                .where('uc.user_id', userId)
                .first()
                .then(userChallenge => {
                  if (userChallenge) {
                    // Append completed bool is userChallenge exists (true or false)
                    return {
                      ...recentChallenge,
                      active_users: userChallenges.length,
                      completed: userChallenge.completed
                    }
                  } else {
                    // Otherwise, don't worry about the completed bool
                    return {
                      ...recentChallenge,
                      active_users: userChallenges.length
                    }
                  }
                })
            } else {
              // If user is not signed in, simply return without accounting for completion
              return {
                ...recentChallenge,
                active_users: userChallenges.length
              }
            }
          })
      }))
    })
}

//FIND CHALLENGE BY ID
function findChallengeById(challengeId) {
  return db('challenges as c')
    .leftOuterJoin('users as u', 'c.user_id', 'u.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .leftOuterJoin('systems as s', 'c.system_id', 's.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .where('c.id', challengeId)
    .first()
    .select([
      'c.id as challenge_id',
      'c.name',
      'c.description',
      'u.username',
      'c.user_id',
      'u.profile_color_one',
      'u.profile_color_two',
      'g.name as game_title',
      'g.banner_pic_URL',
      's.name as system',
      's.id as system_id',
      'd.name as difficulty',
      'd.id as difficulty_id',
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
}

//FIND CHALLENGES BY A SPECIFIC FILTER (NEEDED FOR VALIDATION MIDDLEWARE)
function findChallengesBy(filter) {
  return db('challenges')
    .where(filter);
}

//FIND ALL OF A USER'S CREATED CHALLENGES
function findUserCreatedChallenges(userId) {
  return db('challenges as c')
    .leftOuterJoin('users as u', 'c.user_id', 'u.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .leftOuterJoin('systems as s', 'c.system_id', 's.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .where('c.user_id', userId)
    .select([
      'c.id as challenge_id',
      'c.name',
      'c.description',
      'u.username',
      'c.user_id',
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
    .then(createdChallenges => {
      // Loop through created challenges, finding active users and attaching a completed bool if a user has accepted a challenge
      return Promise.all(createdChallenges.map(createdChallenge => {
        return db('userChallenges as uc')
          .where('uc.challenge_id', createdChallenge.challenge_id)
          .then(userChallenges => {
            return db('userChallenges as uc')
              .where('uc.challenge_id', createdChallenge.challenge_id)
              .where('uc.user_id', createdChallenge.user_id)
              .first()
              .then(userChallenge => {
                if (userChallenge) {
                  return {
                    ...createdChallenge,
                    active_users: userChallenges.length,
                    completed: userChallenge.completed
                  }
                } else {
                  return {
                    ...createdChallenge,
                    active_users: userChallenges.length
                  }
                }
              })
          })
      }))
    })
}

//FIND ALL OF A USER'S ACCEPTED CHALLENGES
function findUserAcceptedChallenges(userId) {
  return db('userChallenges as uc')
    .leftOuterJoin('challenges as c', 'uc.challenge_id', 'c.id')
    .leftOuterJoin('users as u', 'c.user_id', 'u.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .leftOuterJoin('systems as s', 'c.system_id', 's.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .where('uc.user_id', userId)
    .where('completed', false)
    .select([
      'c.id as challenge_id',
      'c.name',
      'c.description',
      'u.username',
      'c.user_id',
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
      'uc.completed',
      'uc.is_active',
      'c.created_at',
      'c.updated_at'
    ])
    .groupBy('c.id', 'u.id', 'g.id', 's.id', 'd.id', 'uc.id')
    .orderBy('uc.updated_at', 'desc')
    .then(acceptedChallenges => {
      // Loop through accepted challenges, finding active users and attaching a completed bool if a user has accepted a challenge
      return Promise.all(acceptedChallenges.map(acceptedChallenge => {
        return db('userChallenges as uc')
          .where('uc.challenge_id', acceptedChallenge.challenge_id)
          .then(userChallenges => {
            return {
              ...acceptedChallenge,
              active_users: userChallenges.length
            }
          })
      }))
    })
}

//FIND ALL OF A USER'S COMPLETED CHALLENGES
function findUserCompletedChallenges(userId) {
  return db('userChallenges as uc')
    .leftOuterJoin('challenges as c', 'uc.challenge_id', 'c.id')
    .leftOuterJoin('users as u', 'c.user_id', 'u.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .leftOuterJoin('systems as s', 'c.system_id', 's.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .where('uc.user_id', userId)
    .where('completed', true)
    .select([
      'c.id as challenge_id',
      'c.name',
      'c.description',
      'u.username',
      'c.user_id',
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
      'uc.completed',
      'uc.is_active',
      'c.created_at',
      'c.updated_at'
    ])
    .groupBy('c.id', 'u.id', 'g.id', 's.id', 'd.id', 'uc.id')
    .orderBy('uc.updated_at', 'desc')
    .then(completedChallenges => {
      // Loop through completed challenges, finding active users and attaching a completed bool if a user has accepted a challenge
      return Promise.all(completedChallenges.map(completedChallenge => {
        return db('userChallenges as uc')
          .where('uc.challenge_id', completedChallenge.challenge_id)
          .then(userChallenges => {
            return {
              ...completedChallenge,
              active_users: userChallenges.length
            }
          })
      }))
    })
}

//FIND HIGH SCORE LEADERBOARD FOR A GIVEN CHALLENGE
function findAllChallengeHighScores(challengeId) {
  return db('userChallenges as uc')
    .leftOuterJoin('challenges as c', 'uc.challenge_id', 'c.id')
    .leftOuterJoin('users as u', 'uc.user_id', 'u.id')
    .where('uc.challenge_id', challengeId)
    .where('c.is_high_score', true)
    .select([
      'uc.*',
      'u.username'
    ])
    .groupBy('c.id', 'uc.id', 'u.id')
    .orderBy('uc.high_score', 'desc')
    .then(response => {
      if (response.length > 0) {
        return response
      } else {
        return false
      }
    })
}

//FIND SPEEDRUN LEADERBOARD FOR A GIVEN CHALLENGE
function findAllChallengeSpeedruns(challengeId) {
  return db('userChallenges as uc')
    .leftOuterJoin('challenges as c', 'uc.challenge_id', 'c.id')
    .leftOuterJoin('users as u', 'uc.user_id', 'u.id')
    .where('uc.challenge_id', challengeId)
    .where('c.is_speedrun', true)
    .select([
      'uc.*',
      'u.username'
    ])
    .groupBy('c.id', 'uc.id', 'u.id')
    .orderBy('uc.total_milliseconds', 'asc')
    .then(response => {
      if (response.length > 0) {
        return response
      } else {
        return false
      }
    })
}

//FIND FOR GLORY LEADERBOARD FOR A GIVEN CHALLENGE
function findAllChallengeForGlorys(challengeId) {
  return db('userChallenges as uc')
    .leftOuterJoin('challenges as c', 'uc.challenge_id', 'c.id')
    .leftOuterJoin('users as u', 'uc.user_id', 'u.id')
    .where('uc.challenge_id', challengeId)
    .where('c.is_speedrun', false)
    .where('c.is_high_score', false)
    .where('uc.completed', true)
    .select([
      'uc.*',
      'u.username'
    ])
    .groupBy('c.id', 'uc.id', 'u.id')
    .orderBy('uc.updated_at', 'asc')
    .then(glorysComplete => {
      return db('userChallenges as uc')
        .leftOuterJoin('challenges as c', 'uc.challenge_id', 'c.id')
        .leftOuterJoin('users as u', 'uc.user_id', 'u.id')
        .where('uc.challenge_id', challengeId)
        .where('c.is_speedrun', false)
        .where('c.is_high_score', false)
        .where('uc.completed', false)
        .select([
          'uc.*',
          'u.username'
        ])
        .groupBy('c.id', 'uc.id', 'u.id')
        .orderBy('uc.updated_at', 'asc')
        .then(glorysIncomplete => {
          Promise.all(glorysIncomplete.map(gloryIncomplete => {
            glorysComplete.push(gloryIncomplete)
          }))
          return glorysComplete
        })
    })
}

//FIND A USER'S FEATURED CHALLENGE
function findUserFeaturedChallenge(userId) {
  return db('challenges as c')
    .where('c.user_id', userId)
    .where('c.featured', true)
    .first()
    .then(res => {
      if (res) {
        return findChallengeById(res.id)
      } else {
        return {}
      }
    })
}

//ADD A CHALLENGE TO THE DATABASE AND ALSO ACCEPT IT
function addChallenge(challenge) {
  return db('challenges')
    .insert(challenge, 'id')
    .then(([id]) => {
      return findChallengeById(id)
        .then(challenge => {
          return acceptChallenge(challenge.user_id, challenge.challenge_id)
            .then(acceptedChallenge => {
              return findChallengeById(id)
            })
        })
    });
}

//ACCEPT A CHALLENGE
function acceptChallenge(userId, challengeId) {
  return db('userChallenges')
    .insert({ user_id: userId, challenge_id: challengeId })
}

//ABANDON A CHALLENGE
function abandonChallenge(userId, challengeId) {
  return db('userChallenges')
    .where('user_id', userId)
    .where('challenge_id', challengeId)
    .del()
}

//DELETE A CHALLENGE FROM THE DATABASE
function removeChallengeById(challengeId) {
  return db('challenges')
    .where('id', challengeId)
    .del()
}

//UPDATE A CHALLENGE
function updateChallengeById(challengeId, changes) {
  return db('challenges')
    .where('id', challengeId)
    .update(changes)
    .then(challenge => {
      return findChallengeById(challengeId);
    })
}

//UPDATE USER CHALLENGE PROGRESS
function updateUserChallengeProgress(challengeId, userId, changes) {
  return db('userChallenges as uc')
    .where('uc.challenge_id', challengeId)
    .where('uc.user_id', userId)
    .update(changes)
    .then(userChallenge => {
      return db('userChallenges as uc')
        .where('uc.challenge_id', challengeId)
        .where('uc.user_id', userId)
        .first()
    })
}

//UPDATE USER'S FEATURED CHALLENGE
function updateUserFeaturedChallenge(challengeId, changes) {
  if (!changes.featured) {
    return db('challenges as c')
      // REMOVE FEATURE STATUS FROM PREVIOUSLY FEATURED CHALLENGE. USER ONLY GETS ONE AT A TIME
      .where('c.featured', true)
      .where('c.id', challengeId)
      .update({ featured: false, updated_at: new Date() })
      .then(res => {
        return findChallengeById(challengeId);
      })
  } else {
    return db('challenges as c')
      // REMOVE FEATURE STATUS FROM PREVIOUSLY FEATURED CHALLENGE. USER ONLY GETS ONE AT A TIME
      .where('c.featured', true)
      .where('c.id', challengeId)
      .update({ featured: false, updated_at: new Date() })
      .then(res => {
        // UPDATE NEW CHALLENGE WITH FEATURED STATUS
        return db('challenges as c')
          .where('c.id', challengeId)
          .update({ featured: true, updated_at: new Date() })
          .then(res => {
            return findChallengeById(challengeId);
          })
      })
  }
}

//FIND IF A USER HAS ALREADY ACCEPTED A CHALLENGE IN OUR DB AND RETURN TRUE OR FALSE
function findIfChallengeAlreadyAccepted(userId, challengeId) {
  return db('userChallenges as uc')
    .where('uc.user_id', userId)
    .where('uc.challenge_id', challengeId)
    .first()
    .then(userChallenge => {
      if (userChallenge) {
        return userChallenge
      } else {
        return false
      }
    })
}

//FIND A USER'S COMPLETED CHALLENGE TOTAL FOR ALL GAMES
function findUserCompletedChallengeTotal(userId) {
  return db('userChallenges as uc')
    .leftOuterJoin('challenges as c', 'uc.challenge_id', 'c.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .where('uc.user_id', userId)
    .where('uc.completed', true)
    .select('g.name')
    .orderBy('g.name', 'asc')
    .then(userChallenges => {
      gameStatsHash = {}
      gameStats = []

      // Map through user challenges, counting the number of completed challenges and adding them as key/values
      userChallenges.map(userChallenge => {
        if (gameStatsHash.hasOwnProperty(userChallenge.name)) {
          gameStatsHash[userChallenge.name] += 1

        } else {
          gameStatsHash[userChallenge.name] = 1
        }
      })

      // Sort our stats object by highest value first
      const sortable = Object.fromEntries(
        Object.entries(gameStatsHash).sort(([, a], [, b]) => b - a)
      );

      // Turn object into an array of objects, each holding a single game and its stats
      for (const [key, value] of Object.entries(sortable)) {
        gameStats.push({
          game: key,
          total_challenges_completed: value
        })
      }

      // Return objects with game IDs attached
      return Promise.all(gameStats.map(gameStat => {
        return db('games as g')
          .where('g.name', gameStat.game)
          .first()
          .then(game => {
            return {
              ...gameStat,
              game_id: game.id
            }
          })
      }))
    })
}

module.exports = {
  findChallenges,
  findRecentChallenges,
  findChallengeById,
  findChallengesBy,
  findUserCreatedChallenges,
  findUserAcceptedChallenges,
  findUserCompletedChallenges,
  findAllChallengeHighScores,
  findAllChallengeSpeedruns,
  findAllChallengeForGlorys,
  findUserFeaturedChallenge,
  addChallenge,
  acceptChallenge,
  abandonChallenge,
  removeChallengeById,
  updateChallengeById,
  updateUserChallengeProgress,
  updateUserFeaturedChallenge,
  findIfChallengeAlreadyAccepted,
  findUserCompletedChallengeTotal
};