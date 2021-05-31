const e = require('express');
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
    .leftOuterJoin('users as u', 'uc.user_id', 'u.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .leftOuterJoin('systems as s', 'c.system_id', 's.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .where('uc.user_id', userId)
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
    .orderBy('uc.speedrun_hours', 'asc')
    .then(response => {
      console.log(response)
      if (response.length > 0) {
        return response
      } else {
        return false
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

module.exports = {
  findChallenges,
  findChallengeById,
  findChallengesBy,
  findUserCreatedChallenges,
  findUserAcceptedChallenges,
  findAllChallengeHighScores,
  findAllChallengeSpeedruns,
  addChallenge,
  acceptChallenge,
  abandonChallenge,
  removeChallengeById,
  updateChallengeById,
  updateUserChallengeProgress,
  findIfChallengeAlreadyAccepted
};