const db = require('../data/dbConfig.js');
const moment = require('moment')

//FIND ALL CHALLENGES
function findChallenges(userId) {
  return db('challenges as c')
    .leftOuterJoin('users as u', 'c.user_id', 'u.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .leftOuterJoin('systems as s', 'c.system_id', 's.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .where('u.is_banned', false)
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
    .then(challenges => {
      // Loop through challenges, finding active users and attaching a completed bool if a user has accepted a challenge
      return Promise.all(challenges.map(challenge => {
        return db('userChallenges as uc')
          .leftOuterJoin('users as u', 'uc.user_id', 'u.id')
          .where('uc.challenge_id', challenge.challenge_id)
          .where('u.is_banned', false)
          .select('uc.*')
          .then(userChallenges => {
            if (userId !== 'no-user') {
              return db('userChallenges as uc')
                .where('uc.challenge_id', challenge.challenge_id)
                .where('uc.user_id', userId)
                .first()
                .then(userChallenge => {
                  if (userChallenge) {
                    // Append completed bool is userChallenge exists (true or false)
                    return {
                      ...challenge,
                      active_users: userChallenges.length,
                      is_active: userChallenge.is_active,
                      completed: userChallenge.completed
                    }
                  } else {
                    // Otherwise, don't worry about the completed bool
                    return {
                      ...challenge,
                      active_users: userChallenges.length
                    }
                  }
                })
            } else {
              // If user is not signed in, simply return without accounting for completion
              return {
                ...challenge,
                active_users: userChallenges.length
              }
            }
          })
      }))
    })
}

//FIND ALL RECENT CHALLENGES (LIMITED TO SIX FOR HOMEPAGE)
function findRecentChallenges(userId) {
  return db('challenges as c')
    .leftOuterJoin('users as u', 'c.user_id', 'u.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .leftOuterJoin('systems as s', 'c.system_id', 's.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .where('u.is_banned', false)
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
          .leftOuterJoin('users as u', 'uc.user_id', 'u.id')
          .where('uc.challenge_id', recentChallenge.challenge_id)
          .where('u.is_banned', false)
          .select('uc.*')
          .then(userChallenges => {
            if (userId !== 'no-user') {
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
                      is_active: userChallenge.is_active,
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

//FIND ALL CHALLENGES SORTED BY POPULARITY
function findAllChallengesByPopularity(userId) {
  return db('challenges as c')
    .leftOuterJoin('users as u', 'c.user_id', 'u.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .leftOuterJoin('systems as s', 'c.system_id', 's.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .where('u.is_banned', false)
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
    .then(challenges => {
      // Map through the challenges and find number of users who accepted each one
      return Promise.all(challenges.map(challenge => {
        return db('userChallenges as uc')
          .where('uc.challenge_id', challenge.challenge_id)
          .then(challenges => {
            // Map through the current users challenges to see which ones they completed, only if user is signed in
            if (userId !== 'no-user') {
              return db('userChallenges as uc')
                .where('uc.challenge_id', challenge.challenge_id)
                .where('uc.user_id', userId)
                .first()
                .then(userChallenge => {
                  if (userChallenge) {
                    // Append completed bool is userChallenge exists (true or false)
                    return {
                      ...challenge,
                      active_users: challenges.length,
                      is_active: userChallenge.is_active,
                      completed: userChallenge.completed
                    }
                  } else {
                    // Otherwise, don't worry about the completed bool
                    return {
                      ...challenge,
                      active_users: challenges.length
                    }
                  }
                })
            } else {
              // If user is not signed in, simply return without accounting for completion
              return {
                ...challenge,
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

//FIND ALL CHALLENGES SORTED BY EXPIRATION DATE
function findAllChallengesByExpiration(userId) {
  return db('challenges as c')
    .leftOuterJoin('users as u', 'c.user_id', 'u.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .leftOuterJoin('systems as s', 'c.system_id', 's.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .where('u.is_banned', false)
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
    .orderBy('c.end_date', 'asc')
    .groupBy('c.id', 'u.id', 'g.id', 's.id', 'd.id')
    .then(challenges => {
      // Map through the challenges and find number of users who accepted each one
      return Promise.all(challenges.map(challenge => {
        return db('userChallenges as uc')
          .where('uc.challenge_id', challenge.challenge_id)
          .then(challenges => {
            // Map through the current users challenges to see which ones they completed, only if user is signed in
            if (userId !== 'no-user') {
              return db('userChallenges as uc')
                .where('uc.challenge_id', challenge.challenge_id)
                .where('uc.user_id', userId)
                .first()
                .then(userChallenge => {
                  if (userChallenge) {
                    // Append completed bool is userChallenge exists (true or false)
                    return {
                      ...challenge,
                      active_users: challenges.length,
                      is_active: userChallenge.is_active,
                      completed: userChallenge.completed
                    }
                  } else {
                    // Otherwise, don't worry about the completed bool
                    return {
                      ...challenge,
                      active_users: challenges.length
                    }
                  }
                })
            } else {
              // If user is not signed in, simply return without accounting for completion
              return {
                ...challenge,
                active_users: challenges.length
              }
            }
          })
      }))
        .then(activeUserChallenges => {
          // Sort by quest that's closest to expiring
          let sortedByExpiringSoonArray = activeUserChallenges.sort((a, b) => a.end_date - b.end_date)
          return sortedByExpiringSoonArray.filter(fc => moment(fc.end_date).isAfter())
        })
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
      'g.id as game_id',
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
function findUserCreatedChallenges(userId, sortOption) {
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
          .leftOuterJoin('users as u', 'uc.user_id', 'u.id')
          .where('uc.challenge_id', createdChallenge.challenge_id)
          .where('u.is_banned', false)
          .select('uc.*').then(userChallenges => {
            return db('userChallenges as uc')
              .where('uc.challenge_id', createdChallenge.challenge_id)
              .where('uc.user_id', createdChallenge.user_id)
              .first()
              .then(userChallenge => {
                if (userChallenge) {
                  return {
                    ...createdChallenge,
                    active_users: userChallenges.length,
                    is_active: userChallenge.is_active,
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
        .then(createdUserChallenges => {
          // If sortOption exists, sort by given parameter
          if (sortOption === 'popular') {
            let sortedByActiveUsersArray = createdUserChallenges.sort((a, b) => b.active_users - a.active_users)
            return sortedByActiveUsersArray
          } else if (sortOption === 'expire') {
            let sortedByExpiringSoonArray = createdUserChallenges.sort((a, b) => a.end_date - b.end_date)
            return sortedByExpiringSoonArray.filter(fc => moment(fc.end_date).isAfter())
            //Otherwise, simply return all created challenges in order of most recent creation
          } else {
            return createdUserChallenges
          }
        })
    })
}

//FIND ALL OF A USER'S ACCEPTED CHALLENGES
function findUserAcceptedChallenges(userId, sortOption) {
  return db('userChallenges as uc')
    .leftOuterJoin('challenges as c', 'uc.challenge_id', 'c.id')
    .leftOuterJoin('users as u', 'c.user_id', 'u.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .leftOuterJoin('systems as s', 'c.system_id', 's.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .where('uc.user_id', userId)
    .where('completed', false)
    .where('u.is_banned', false)
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
      // Loop through accepted challenges, finding active users
      return Promise.all(acceptedChallenges.map(acceptedChallenge => {
        return db('userChallenges as uc')
          .leftOuterJoin('users as u', 'uc.user_id', 'u.id')
          .where('uc.challenge_id', acceptedChallenge.challenge_id)
          .where('u.is_banned', false)
          .select('uc.*')
          .then(userChallenges => {
            return {
              ...acceptedChallenge,
              active_users: userChallenges.length
            }
          })
      }))
        .then(acceptedUserChallenges => {
          // If sortOption exists, sort by given parameter
          if (sortOption === 'popular') {
            let sortedByActiveUsersArray = acceptedUserChallenges.sort((a, b) => b.active_users - a.active_users)
            return sortedByActiveUsersArray
          } else if (sortOption === 'expire') {
            let sortedByExpiringSoonArray = acceptedUserChallenges.sort((a, b) => a.end_date - b.end_date)
            return sortedByExpiringSoonArray.filter(fc => moment(fc.end_date).isAfter())
            //Otherwise, simply return all accepted challenges in order of most recent creation
          } else {
            return acceptedUserChallenges
          }
        })
    })
}

//FIND ALL OF A USER'S COMPLETED CHALLENGES
function findUserCompletedChallenges(userId, sortOption) {
  return db('userChallenges as uc')
    .leftOuterJoin('challenges as c', 'uc.challenge_id', 'c.id')
    .leftOuterJoin('users as u', 'c.user_id', 'u.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .leftOuterJoin('systems as s', 'c.system_id', 's.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .where('uc.user_id', userId)
    .where('completed', true)
    .where('u.is_banned', false)
    .select([
      'c.id as challenge_id',
      'c.name',
      'c.description',
      'u.username',
      'c.user_id',
      'g.name as game_title',
      'g.id as game_id',
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
      // Loop through completed challenges, finding active users
      return Promise.all(completedChallenges.map(completedChallenge => {
        return db('userChallenges as uc')
          .leftOuterJoin('users as u', 'uc.user_id', 'u.id')
          .where('uc.challenge_id', completedChallenge.challenge_id)
          .where('u.is_banned', false)
          .select('uc.*')
          .then(userChallenges => {
            return {
              ...completedChallenge,
              active_users: userChallenges.length
            }
          })
      }))
        .then(completedUserChallenges => {
          // If sortOption exists, sort by given parameter
          if (sortOption === 'popular') {
            let sortedByActiveUsersArray = completedUserChallenges.sort((a, b) => b.active_users - a.active_users)
            return sortedByActiveUsersArray
          } else if (sortOption === 'expire') {
            let sortedByExpiringSoonArray = completedUserChallenges.sort((a, b) => a.end_date - b.end_date)
            return sortedByExpiringSoonArray.filter(fc => moment(fc.end_date).isAfter())
            //Otherwise, simply return all completed challenges in order of most recent creation
          } else {
            return completedUserChallenges
          }
        })
    })
}

//FIND HIGH SCORE LEADERBOARD FOR A GIVEN CHALLENGE
function findAllChallengeHighScores(challengeId) {
  return db('userChallenges as uc')
    .leftOuterJoin('challenges as c', 'uc.challenge_id', 'c.id')
    .leftOuterJoin('users as u', 'uc.user_id', 'u.id')
    .where('uc.challenge_id', challengeId)
    .where('c.is_high_score', true)
    .whereNot('uc.high_score', null)
    .where('u.is_banned', false)
    .select([
      'uc.*',
      'u.username'
    ])
    .groupBy('c.id', 'uc.id', 'u.id')
    .orderBy('uc.high_score', 'desc')
    .then(highscoreUsers => {
      return db('userChallenges as uc')
        .leftOuterJoin('challenges as c', 'uc.challenge_id', 'c.id')
        .leftOuterJoin('users as u', 'uc.user_id', 'u.id')
        .where('uc.challenge_id', challengeId)
        .where('uc.high_score', null)
        .where('u.is_banned', false)
        .select([
          'uc.*',
          'u.username'
        ])
        .groupBy('c.id', 'uc.id', 'u.id')
        .orderBy('uc.created_at', 'asc')
        .then(noScoreUsers => {
          // Map through users without scores, pushing them at the bottom of the leaderboard with no scores attached
          return Promise.all(noScoreUsers.map(noScoreUser => {
            highscoreUsers.push(noScoreUser)
          }))
            .then(combinedUsers => {
              if (highscoreUsers.length > 0) {
                return highscoreUsers
              } else {
                return false
              }
            })
        })
    })
}

//FIND SPEEDRUN LEADERBOARD FOR A GIVEN CHALLENGE
function findAllChallengeSpeedruns(challengeId) {
  return db('userChallenges as uc')
    .leftOuterJoin('challenges as c', 'uc.challenge_id', 'c.id')
    .leftOuterJoin('users as u', 'uc.user_id', 'u.id')
    .where('uc.challenge_id', challengeId)
    .where('c.is_speedrun', true)
    .where('u.is_banned', false)
    .whereNot('uc.total_milliseconds', null)
    .select([
      'uc.*',
      'u.username'
    ])
    .groupBy('c.id', 'uc.id', 'u.id')
    .orderBy('uc.total_milliseconds', 'asc')
    .then(speedrunUsers => {
      return db('userChallenges as uc')
        .leftOuterJoin('challenges as c', 'uc.challenge_id', 'c.id')
        .leftOuterJoin('users as u', 'uc.user_id', 'u.id')
        .where('uc.challenge_id', challengeId)
        .where('uc.total_milliseconds', null)
        .where('u.is_banned', false)
        .select([
          'uc.*',
          'u.username'
        ])
        .groupBy('c.id', 'uc.id', 'u.id')
        .orderBy('uc.created_at', 'asc')
        .then(noScoreUsers => {
          // Map through users without scores, pushing them at the bottom of the leaderboard with no scores attached
          return Promise.all(noScoreUsers.map(noScoreUser => {
            speedrunUsers.push(noScoreUser)
          }))
            .then(combinedUsers => {
              if (speedrunUsers.length > 0) {
                return speedrunUsers
              } else {
                return false
              }
            })
        })
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
    .where('u.is_banned', false)
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
        .where('u.is_banned', false)
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

//RESET USER CHALLENGE PROGRESS
function resetUserChallengeProgress(challengeId, userId) {
  return db('userChallenges as uc')
    .where('uc.challenge_id', challengeId)
    .where('uc.user_id', userId)
    .update(
      {
        high_score: null,
        speedrun_hours: null,
        speedrun_minutes: null,
        speedrun_seconds: null,
        speedrun_milliseconds: null,
        total_milliseconds: null,
        completed: false,
        is_active: false,
        updated_at: new Date()
      })
    .then(userChallenge => {
      return db('userChallenges as uc')
        .where('uc.challenge_id', challengeId)
        .where('uc.user_id', userId)
        .first()
    })
}

//UPDATE USER'S FEATURED CHALLENGE
function updateUserFeaturedChallenge(challengeId, userId, changes) {
  if (!changes.featured) {
    return db('challenges as c')
      // REMOVE FEATURE STATUS
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
      .where('c.user_id', userId)
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
    .leftOuterJoin('users as u', 'c.user_id', 'u.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .where('uc.user_id', userId)
    .where('uc.completed', true)
    .where('g.public', true)
    .where('u.is_banned', false)
    .select([
      'g.name',
      'd.points'
    ])
    .orderBy('g.name', 'asc')
    .then(userChallenges => {
      gameCompleteTotalHash = {}
      gameLevelHash = {}
      gameStats = []

      // Map through user challenges, counting the number of completed challenges and adding them as key/values
      userChallenges.map(userChallenge => {
        if (gameCompleteTotalHash.hasOwnProperty(userChallenge.name)) {
          gameCompleteTotalHash[userChallenge.name] += 1
        } else {
          gameCompleteTotalHash[userChallenge.name] = 1
        }

        // Map through user challegnes, finding total number of experience points for each game
        if (gameLevelHash.hasOwnProperty(userChallenge.name)) {
          gameLevelHash[userChallenge.name] += userChallenge.points
        } else {
          gameLevelHash[userChallenge.name] = userChallenge.points
        }
      })

      // Sort our stats object by highest experience level first
      const sortable = Object.fromEntries(
        Object.entries(gameLevelHash).sort(([, a], [, b]) => b - a)
      );

      // Turn object into an array of objects, each holding a single game and its stats
      for (const [key, value] of Object.entries(sortable)) {
        gameStats.push({
          game: key,
          total_challenges_completed: gameCompleteTotalHash[key],
          total_points: value
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
  findAllChallengesByPopularity,
  findAllChallengesByExpiration,
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
  resetUserChallengeProgress,
  findIfChallengeAlreadyAccepted,
  findUserCompletedChallengeTotal
};