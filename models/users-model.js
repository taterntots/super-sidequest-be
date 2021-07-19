const db = require('../data/dbConfig.js');

//FIND ALL USERS
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

//FIND ALL OF A USER'S FOLLOWERS
function findAllUserFollowers(userId) {
  return db('userFollowers as uf')
    .leftOuterJoin('users as u', 'uf.follower_id', 'u.id')
    .where('uf.user_id', userId)
    .select('u.*')
    .orderBy('u.username', 'asc')
    .then(userFollowers => {
      // Map through user followers, finding total experience points and total number of created challenges for each user
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

module.exports = {
  findUsers,
  findUserById,
  findUserByUsername,
  findUserAdminStatus,
  findAllUserFollowers,
  findUsersBy,
  addUser,
  removeUserById,
  followUser,
  unfollowUser,
  checkIfFollowingUser,
  updateUserById,
  findIfUserEmailExists,
  findIfUserNameExists,
  findUserEXPForAllGames,
  findUserEXPForGameById
};