const db = require('../data/dbConfig.js');

//FIND ALL USERS
function findUsers() {
  return db('users')
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

module.exports = {
  findUsers,
  findUserById,
  findUserByUsername,
  findUserAdminStatus,
  findUsersBy,
  addUser,
  removeUserById,
  updateUserById,
  findIfUserEmailExists,
  findIfUserNameExists
};