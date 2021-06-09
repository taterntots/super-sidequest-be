const router = require('express').Router();
const Users = require('../models/users-model.js')
const Challenges = require('../models/challenges-model.js')
const { validateUserId, validateUsername, checkForUserData } = require('../middleware/index.js');

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

//*************** GET USER BY USERNAME *****************//
router.get('/username/:username', validateUsername, (req, res) => {
  const { username } = req.params;

  Users.findUserByUsername(username)
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
        error: `There was an error getting this user's created challenges`
      });
    });
});

//*************** GET ALL OF A USER'S ACCEPTED CHALLENGES *****************//
router.get('/:userId/accepted-challenges', validateUserId, (req, res) => {
  const { userId } = req.params;

  Challenges.findUserAcceptedChallenges(userId)
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error getting this user's accepted challenges`
      });
    });
});

//*************** GET ALL OF A USER'S COMPLETED CHALLENGES *****************//
router.get('/:userId/completed-challenges', validateUserId, (req, res) => {
  const { userId } = req.params;

  Challenges.findUserCompletedChallenges(userId)
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error getting this user's completed challenges`
      });
    });
});

//*************** GET A USER'S COMPLETED CHALLENGE TOTAL FOR ALL GAMES *****************//
router.get('/:userId/games/stats', validateUserId, (req, res) => {
  const { userId } = req.params;

  Challenges.findUserCompletedChallengeTotal(userId)
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error getting stats for this user's games`
      });
    });
});

//*************** FIND A USER'S FEATURED CHALLENGE *****************//
router.get('/:userId/challenges/featured', validateUserId, (req, res) => {
  const { userId } = req.params;

  Challenges.findUserFeaturedChallenge(userId)
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        errorMessage: `There was an error getting the user's featured challenge`
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