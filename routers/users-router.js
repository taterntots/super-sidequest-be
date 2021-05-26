const router = require('express').Router();
const Users = require('../models/users-model.js')
const Challenges = require('../models/challenges-model.js')
const { validateUserId, checkForUserData } = require('../middleware/index.js');

//*************** GET ALL USERS *****************//
router.get('/', (req, res) => {
  Users.findUsers()
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting all users to display'
      });
    });
});

//*************** GET USER BY ID *****************//
router.get('/:userId', validateUserId, (req, res) => {
  const { userId } = req.params;

  Users.findUserById(userId)
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting this user'
      });
    });
});

//*************** GET ALL OF A USER'S CREATED CHALLENGES *****************//
router.get('/:userId/created-challenges', validateUserId, (req, res) => {
  const { userId } = req.params;

  Challenges.findUserCreatedChallenges(userId)
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error getting this user's challenges`
      });
    });
});

//*************** ADD NEW USER TO THE DATABASE *****************//
router.post('/', checkForUserData, (req, res) => {
  let user = req.body;

  Users.addUser(user)
    .then(response => {
      res.status(201).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error adding this user to the database'
      });
    });
});

//*************** REMOVE USER FROM THE DATABASE  *****************//
router.delete('/:userId', validateUserId, (req, res) => {
  const userId = req.params.userId;

  Users.removeUserById(userId)
    .then(response => {
      res.status(200).json({
        success: `The user was successfully deleted`,
        id: userId
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error deleting this user`
      });
    });
});

//*************** UPDATE USER *****************//
router.put('/:userId', validateUserId, (req, res) => {
  const userId = req.params.userId;
  var changes = req.body;
  changes.updated_at = new Date() // rewrites updated_at timestamp to current time of update

  Users.updateUserById(userId, changes)
    .then(response => {
      res.status(200).json({ updatedUser: response });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error updating this user`
      });
    });
});

module.exports = router;