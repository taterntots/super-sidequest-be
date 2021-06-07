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
      'u.username',
      'c.user_id'
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
      'u.username',
      'c.user_id'
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

//ADD A CHALLENGE TO THE DATABASE
function addChallenge(challenge) {
  return db('challenges')
    .insert(challenge, 'id')
    .then(([id]) => {
      return findChallengeById(id);
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
      .update({ featured: false, updated_at: new Date() })
      .then(res => {
        return findChallengeById(challengeId);
      })
  } else {
    return db('challenges as c')
      // REMOVE FEATURE STATUS FROM PREVIOUSLY FEATURED CHALLENGE. USER ONLY GETS ONE AT A TIME
      .where('c.featured', true)
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
      return gameStats
    })
}

module.exports = {
  findChallenges,
  findChallengeById,
  findChallengesBy,
  findUserCreatedChallenges,
  findUserAcceptedChallenges,
  findAllChallengeHighScores,
  findAllChallengeSpeedruns,
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