const Users = require('../models/users-model.js')

//*************** USERS ROUTER *****************//

function validateUserId(req, res, next) {
  const { userId } = req.params;
  id = userId

  Users.findUsersBy({ id })
    .then(user => {
      console.log('USER', user)
      if (user.length > 0) {
        next();
      } else {
        res.status(404).json({
          errorMessage: 'The user with the specified ID does not exist'
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        errorMessage:
          'Could not validate user information for the specified ID'
      });
    });
}

function checkForUserData(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({
      errorMessage: 'body is empty / missing user data'
    });
  } else if (
    !req.body.username ||
    !req.body.email
  ) {
    res.status(400).json({
      errorMessage: 'username and email are required fields'
    });
  } else {
    next();
  }
}

module.exports = {
  validateUserId,
  checkForUserData
};