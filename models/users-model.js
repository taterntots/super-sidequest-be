const db = require('../data/dbConfig.js');
const moment = require('moment')
var schedule = require('node-schedule');
const { patreon } = require('patreon');

//FIND ALL USERS WITH TOTAL EXPERIENCE POINTS
function findUsers() {
  return db('users')
    .orderBy('username', 'asc')
    .then(users => {
      // Map through users, finding total experience points and total number of created challenges for each user
      return Promise.all(users.map(user => {
        return findUserEXPForAllGames(user.id).then(userEXP => {
          return db('challenges as c')
            .leftOuterJoin('games as g', 'c.game_id', 'g.id')
            .where('c.user_id', user.id)
            .where('g.public', true)
            .then(userCreatedChallenges => {
              return {
                ...user,
                total_experience_points: userEXP,
                total_created_challenges: userCreatedChallenges.length
              }
            })
        })
      }))
    })
}

//FIND ALL USERS WITH SPECIFIC GAME TOTAL EXPERIENCE POINTS
function findUsersWithTotalGameEXP(gameId) {
  return db('users as u')
    .orderBy('username', 'asc')
    .then(users => {
      // Map through users, finding total experience points and total number of created challenges for each user for a specific game
      return Promise.all(users.map(user => {
        return findUserEXPForGameById(user.id, gameId).then(userGameEXP => {
          return db('challenges as c')
            .leftOuterJoin('games as g', 'c.game_id', 'g.id')
            .where('c.user_id', user.id)
            .where('c.game_id', gameId)
            .where('g.public', true)
            .then(userCreatedGameChallenges => {
              return {
                ...user,
                total_experience_points: userGameEXP,
                total_created_challenges: userCreatedGameChallenges.length
              }
            })
        })
      }))
        // Filter the list to get rid of users with zero EXP
        .then(allUsersWithEXP => {
          return allUsersWithEXP.filter(filteredUser => filteredUser.total_experience_points > 0)
        })
    })
}

//FIND USER BY ID
function findUserById(userId) {
  return db('users as u')
    .where('u.id', userId)
    .first()
}

//FIND USER BY USERNAME
function findUserByUsername(username) {
  return db('users as u')
    .where('u.username', username)
    .first()
}

//FIND USER BY EMAIL
function findUserByEmail(email) {
  return db('users as u')
    .where('u.email', email)
    .first()
}

//FIND ALL OF A USER'S FOLLOWINGS
function findAllUserFollowings(userId) {
  return db('userFollowers as uf')
    .leftOuterJoin('users as u', 'uf.follower_id', 'u.id')
    .where('uf.user_id', userId)
    .select('u.*')
    .orderBy('u.username', 'asc')
    .then(userFollowings => {
      // Map through user followings (people the user follows), finding total experience points and total number of created challenges for each user
      return Promise.all(userFollowings.map(user => {
        return findUserEXPForAllGames(user.id).then(userEXP => {
          return db('challenges as c')
            .leftOuterJoin('games as g', 'c.game_id', 'g.id')
            .where('c.user_id', user.id)
            .where('g.public', true)
            .then(userCreatedChallenges => {
              return {
                ...user,
                total_experience_points: userEXP,
                total_created_challenges: userCreatedChallenges.length
              }
            })
        })
      }))
    })
}

//FIND ALL OF A USER'S FOLLOWERS
function findAllUserFollowers(userId) {
  return db('userFollowers as uf')
    .leftOuterJoin('users as u', 'uf.user_id', 'u.id')
    .where('uf.follower_id', userId)
    .select('u.*')
    .orderBy('u.username', 'asc')
    .then(userFollowers => {
      // Map through user followers (people who follow the user), finding total experience points and total number of created challenges for each user
      return Promise.all(userFollowers.map(user => {
        return findUserEXPForAllGames(user.id).then(userEXP => {
          return db('challenges as c')
            .leftOuterJoin('games as g', 'c.game_id', 'g.id')
            .where('c.user_id', user.id)
            .where('g.public', true)
            .then(userCreatedChallenges => {
              return {
                ...user,
                total_experience_points: userEXP,
                total_created_challenges: userCreatedChallenges.length
              }
            })
        })
      }))
    })
}

//FIND IF USER IS AN ADMIN
function findUserAdminStatus(userId) {
  return db('users as u')
    .where('u.id', userId)
    .first()
    .then(user => {
      if (user.is_admin) {
        return true
      } else {
        return false
      }
    })
}

//FIND USERS BY A SPECIFIC FILTER (NEEDED FOR VALIDATION MIDDLEWARE)
function findUsersBy(filter) {
  return db('users')
    .where(filter);
}

//ADD A USER TO THE DATABASE
function addUser(user) {
  return db('users')
    .insert(user, 'id')
    .then(([id]) => {
      return findUserById(id);
    });
}

//VERIFY A USER
function verifyUser(email) {
  return db('users as u')
    .where('u.email', email)
    .first()
    .then(user => {
      // Only update the user if the code is still valid (not past the expiration date)
      if (moment(user.verification_code_last_issued).add(1, 'hours').isAfter()) {
        return db('users as u')
          .where('u.email', email)
          .first()
          .update({ is_verified: true })
          .then(updatedUser => {
            return findUserByEmail(email)
          })
      } else {
        return null
      }
    })
}

//RESEND ACCOUNT VERIFICATION CODE FOR A USER
function updateUserAccountVerificationCode(email, code) {
  return db('users as u')
    .where('u.email', email)
    .first()
    .then(user => {
      // To prevent spamming, only allow a code to be sent once every set amount of time
      if (moment(user.verification_code_last_issued).add(5, 'minutes').isBefore()) {
        return db('users as u')
          .where('u.email', email)
          .first()
          .update({ verification_code: code, verification_code_last_issued: new Date() })
          .then(updatedUser => {
            return findUserByEmail(email)
          })
      } else {
        return null
      }
    })
}

//DELETE A USER FROM THE DATABASE
function removeUserById(userId) {
  return db('users')
    .where('id', userId)
    .del()
}

//FOLLOW A USER
function followUser(userId, followerId) {
  return db('userFollowers as uf')
    .leftOuterJoin('users as u', 'uf.follower_id', 'u.id')
    .where('uf.user_id', userId)
    .where('uf.follower_id', followerId)
    .first()
    .select('u.*')
    .then(follower => {
      if (userId === followerId) {
        return { errorMessage: `You cannot follow yourself` }
      } else if (follower) {
        return { errorMessage: `You are already following ${follower.username}` }
      } else {
        return db('userFollowers')
          .insert({
            user_id: userId,
            follower_id: followerId
          })
          .then(newFollower => {
            return {
              success: `The user was successfully followed`,
              user_id: userId,
              followre_id: followerId
            }
          })
      }
    })
}

//UNFOLLOW A USER
function unfollowUser(userId, followerId) {
  return db('userFollowers as uf')
    .leftOuterJoin('users as u', 'uf.follower_id', 'u.id')
    .where('uf.user_id', userId)
    .where('uf.follower_id', followerId)
    .first()
    .select('u.*')
    .then(follower => {
      if (userId === followerId) {
        return { errorMessage: `You cannot unfollow yourself` }
      } else if (follower) {
        return db('userFollowers as uf')
          .where('uf.user_id', userId)
          .where('uf.follower_id', followerId)
          .del()
          .then(unfollowed => {
            return {
              success: `The user was successfully unfollowed`,
              user_id: userId,
              followre_id: followerId
            }
          })
      } else {
        return { errorMessage: `You are not currently following this user` }
      }
    })
}

//CHECK IF A USER IS FOLLOWING SOMEONE
function checkIfFollowingUser(userId, followerId) {
  return db('userFollowers as uf')
    .leftOuterJoin('users as u', 'uf.follower_id', 'u.id')
    .where('uf.user_id', userId)
    .where('uf.follower_id', followerId)
    .first()
    .select('u.*')
    .then(follower => {
      if (follower) {
        return true
      } else {
        return false
      }
    })
}

//UPDATE A USER
function updateUserById(userId, changes) {
  return db('users')
    .where('id', userId)
    .update(changes)
    .then(user => {
      return findUserById(userId);
    })
}

//FIND IF A USER EMAIL EXISTS IN OUR DB AND RETURN TRUE OR FALSE
function findIfUserEmailExists(userEmail) {
  return db('users as u')
    .where('u.email', userEmail)
    .first()
    .then(user => {
      if (user) {
        return true
      } else {
        return false
      }
    })
}

//FIND IF A USERNAME EXISTS IN OUR DB AND RETURN TRUE OR FALSE
function findIfUserNameExists(username) {
  return db('users as u')
    .where('u.username', username)
    .first()
    .then(user => {
      if (user) {
        return true
      } else {
        return false
      }
    })
}

//FIND A USER'S TOTAL EXPERIENCE POINTS FOR ALL GAMES
function findUserEXPForAllGames(userId) {
  return db('userChallenges as uc')
    .leftOuterJoin('users as u', 'uc.user_id', 'u.id')
    .leftOuterJoin('challenges as c', 'uc.challenge_id', 'c.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .where('uc.user_id', userId)
    .where('uc.completed', true)
    .where('g.public', true)
    .select([
      'c.id as challenge_id',
      'c.name as challenge_name',
      'd.points'
    ])
    .then(completedChallenges => {
      let totalExperiencePoints = 0

      completedChallenges.map(completedChallenge => {
        totalExperiencePoints += completedChallenge.points
      })
      return totalExperiencePoints
    })
}

//FIND A USER'S TOTAL EXPERIENCE POINTS FOR A SPECIFIC GAME
function findUserEXPForGameById(userId, gameId) {
  return db('userChallenges as uc')
    .leftOuterJoin('users as u', 'uc.user_id', 'u.id')
    .leftOuterJoin('challenges as c', 'uc.challenge_id', 'c.id')
    .leftOuterJoin('difficulty as d', 'c.difficulty_id', 'd.id')
    .leftOuterJoin('games as g', 'c.game_id', 'g.id')
    .where('uc.user_id', userId)
    .where('uc.completed', true)
    .where('c.game_id', gameId)
    .where('g.public', true)
    .select([
      'c.id as challenge_id',
      'c.name as challenge_name',
      'd.points'
    ])
    .then(completedChallenges => {
      let totalExperiencePoints = 0

      completedChallenges.map(completedChallenge => {
        totalExperiencePoints += completedChallenge.points
      })
      return totalExperiencePoints
    })
}

//AUTOMATICALLY CHECKS AND UPDATES USER PATREON STATUS AT MIDNIGHT UTC EVERY DAY
var rule = new schedule.RecurrenceRule();
rule.hour = 23
rule.minute = 59
rule.second = 58
rule.tz = 'Etc/UTC';

schedule.scheduleJob(rule, function () {
  // Remove patreon status from all users (needs to happen to uncheck anyone who may have stopped paying)
  return db('users')
    .update('is_patreon', false)
    .then(allUsers => {
      // Get a list of all current patreon member emails
      return getPatreonEmails().then(pledgeEmails => {
        // Map through the patreon emails, updating user patreon status if true
        return pledgeEmails.map(pledgeEmail => {
          return findUserByEmail(pledgeEmail).then(userWithPledge => {
            if (userWithPledge && userWithPledge.is_patreon === false) {
              console.log(`${pledgeEmail} is a patron!`)
              return db('users')
                .where('id', userWithPledge.id)
                .update('is_patreon', true)
            } else if (!userWithPledge) {
              console.log(`${pledgeEmail} is not in our database`)
            }
          })
        })
      })
    })
})

//GET PATRON EMAILS FOR USERS ABOVE A DOLLAR TIER
const getPatreonEmails = async (data) => {
  const api_client = patreon(process.env.PATREON_CREATOR_ACCESS_TOKEN)

  return api_client(`/campaigns/${process.env.PATREON_CAMPAIGN_ID}/pledges?include=patron.null`)
    .then(({ store }) => {
      // Find all pledges over a dollar (any tier above base tier) and then return just the emails
      let pledgesOverOneDollar = store.findAll('pledge').filter(fp => fp.serialize().data.attributes.amount_cents > 100)
      let pledgeEmails = pledgesOverOneDollar.map(pledge_emails => pledge_emails.patron.email)

      return pledgeEmails
    })
    .catch(err => {
      res.status(500).json({
        errorMessage: 'There was an error hitting the Patreon API'
      });
    })
};

module.exports = {
  findUsers,
  findUsersWithTotalGameEXP,
  findUserById,
  findUserByUsername,
  findUserByEmail,
  findUserAdminStatus,
  findAllUserFollowings,
  findAllUserFollowers,
  findUsersBy,
  addUser,
  verifyUser,
  updateUserAccountVerificationCode,
  removeUserById,
  followUser,
  unfollowUser,
  checkIfFollowingUser,
  updateUserById,
  findIfUserEmailExists,
  findIfUserNameExists,
  findUserEXPForAllGames,
  findUserEXPForGameById,
  getPatreonEmails
};