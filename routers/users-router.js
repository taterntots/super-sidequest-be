const router = require('express').Router();
const Users = require('../models/users-model.js')
const Challenges = require('../models/challenges-model.js')
const { validateUserId, validateFollowerId, validateUsername, validateEmail, checkForUserData, restrictedUser, restrictedAdmin } = require('../middleware/index.js');

//*************** GET ALL USERS WITH TOTAL EXPERIENCE POINTS *****************//
router.get('/', restrictedAdmin, (req, res) => {
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


//*************** GET ALL USERS WITH SPECIFIC GAME TOTAL EXPERIENCE POINTS *****************//
router.get('/games/:gameId', restrictedAdmin, (req, res) => {
  const { gameId } = req.params;

  Users.findUsersWithTotalGameEXP(gameId)
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting all users with game experience points to display'
      });
    });
});

//*************** GET USER BY ID *****************//
router.get('/:userId', validateUserId, restrictedAdmin, (req, res) => {
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
router.get('/username/:username', validateUsername, restrictedAdmin, (req, res) => {
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

//*************** GET USER BY EMAIL *****************//
router.get('/email/:email', validateEmail, restrictedAdmin, (req, res) => {
  const { email } = req.params;

  Users.findUserByEmail(email)
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

//*************** FIND IF USER IS AN ADMIN *****************//
router.get('/:userId/is-admin', validateUserId, restrictedAdmin, (req, res) => {
  const { userId } = req.params;

  Users.findUserAdminStatus(userId)
    .then(userStatus => {
      res.json(userStatus);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error validating admin status for this user'
      });
    });
});

//*************** GET ALL OF A USER'S FOLLOWINGS *****************//
router.get('/:userId/followings', validateUserId, restrictedAdmin, (req, res) => {
  const { userId } = req.params;

  Users.findAllUserFollowings(userId)
    .then(userFollowings => {
      res.json(userFollowings);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting all the users that this specified user is following'
      });
    });
});

//*************** GET ALL OF A USER'S FOLLOWERS *****************//
router.get('/:userId/followers', validateUserId, restrictedAdmin, (req, res) => {
  const { userId } = req.params;

  Users.findAllUserFollowers(userId)
    .then(userFollowers => {
      res.json(userFollowers);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error getting all the user's followers`
      });
    });
});

//*************** GET ALL OF A USER'S CREATED CHALLENGES *****************//
router.get('/:userId/created-challenges/:sortOption', validateUserId, restrictedAdmin, (req, res) => {
  const { userId } = req.params;
  const { sortOption } = req.params;

  Challenges.findUserCreatedChallenges(userId, sortOption)
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
router.get('/:userId/accepted-challenges/:sortOption', validateUserId, restrictedAdmin, (req, res) => {
  const { userId } = req.params;
  const { sortOption } = req.params;

  Challenges.findUserAcceptedChallenges(userId, sortOption)
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
router.get('/:userId/completed-challenges/:sortOption', validateUserId, restrictedAdmin, (req, res) => {
  const { userId } = req.params;
  const { sortOption } = req.params;

  Challenges.findUserCompletedChallenges(userId, sortOption)
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
router.get('/:userId/games/stats', validateUserId, restrictedAdmin, (req, res) => {
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
router.get('/:userId/challenges/featured', validateUserId, restrictedAdmin, (req, res) => {
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
router.post('/', checkForUserData, restrictedAdmin, (req, res) => {
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

//*************** REMOVE USER FROM THE DATABASE *****************//
router.delete('/:userId', validateUserId, restrictedAdmin, (req, res) => {
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

//*************** FOLLOW A USER *****************//
router.post('/:userId/followers/:followerId', restrictedAdmin, validateUserId, validateFollowerId, (req, res) => {
  let { userId } = req.params;
  let { followerId } = req.params

  Users.followUser(userId, followerId)
    .then(response => {
      res.status(201).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error following this user'
      });
    });
});

//*************** UNFOLLOW A USER *****************//
router.delete('/:userId/followers/:followerId', validateUserId, validateFollowerId, restrictedAdmin, (req, res) => {
  let { userId } = req.params;
  let { followerId } = req.params

  Users.unfollowUser(userId, followerId)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error unfollowing this user`
      });
    });
});

//*************** CHECK IF A USER IS FOLLOWING SOMEONE *****************//
router.get('/:userId/followers/:followerId', validateUserId, validateFollowerId, restrictedAdmin, (req, res) => {
  let { userId } = req.params;
  let { followerId } = req.params

  Users.checkIfFollowingUser(userId, followerId)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error unfollowing this user`
      });
    });
});

//*************** UPDATE USER *****************//
router.put('/:userId', validateUserId, restrictedUser, (req, res) => {
  const userId = req.params.userId;
  var changes = req.body;
  changes.updated_at = new Date() // rewrites updated_at timestamp to current time of update

  Users.updateUserById(userId, changes)
    .then(response => {
      setTimeout(function () { // Give it some loading time
        res.status(200).json({ updatedUser: response });
      }, 2000)
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error updating this user`
      });
    });
});

//*************** GET A USER'S LEVEL FOR ALL GAMES *****************//
router.get('/:userId/exp', validateUserId, restrictedAdmin, (req, res) => {
  let { userId } = req.params;

  Users.findUserEXPForAllGames(userId)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error getting this user's experience points for all games`
      });
    });
});

//*************** GET A USER'S LEVEL FOR A SPECIFIC GAME *****************//
router.get('/:userId/games/:gameId/exp', validateUserId, restrictedAdmin, (req, res) => {
  let { userId } = req.params;
  let { gameId } = req.params;

  Users.findUserEXPForGameById(userId, gameId)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error getting this user's experience points for this specific game`
      });
    });
});

module.exports = router;