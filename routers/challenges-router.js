const router = require('express').Router();
const Challenges = require('../models/challenges-model.js')
const {
  restrictedAdmin,
  restrictedUser,
  validateChallengeId,
  checkForChallengeData,
  checkForChallengeAcceptedData,
  checkForChallengeAbandonedData
} = require('../middleware/index.js');

//*************** GET ALL CHALLENGES *****************//
router.get('/', restrictedAdmin, (req, res) => {
  Challenges.findChallenges()
    .then(challenges => {
      res.json(challenges);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting all challenges to display'
      });
    });
});

//*************** GET CHALLENGE BY ID *****************//
router.get('/:challengeId', restrictedAdmin, validateChallengeId, (req, res) => {
  const { challengeId } = req.params;

  Challenges.findChallengeById(challengeId)
    .then(challenge => {
      res.json(challenge);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting this challenge'
      });
    });
});

//*************** ADD NEW CHALLENGE TO THE DATABASE *****************//
router.post('/', restrictedUser, checkForChallengeData, (req, res) => {
  let challenge = req.body;

  Challenges.addChallenge(challenge)
    .then(response => {
      res.status(201).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error adding this challenge to the database'
      });
    });
});

//*************** ACCEPT A CHALLENGE *****************//
router.post('/:challengeId/accept', restrictedUser, checkForChallengeAcceptedData, (req, res) => {
  let { user_id } = req.body;
  const { challengeId } = req.params;

  Challenges.acceptChallenge(user_id, challengeId)
    .then(response => {
      res.status(201).json({
        message: `The challenge was successfully accepted`,
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        errorMessage: 'There was an error accepting this user challenge'
      });
    });
});

//*************** FIND IF CHALLENGE IS ALREADY ACCEPTED BY A USER *****************//
router.get('/:challengeId/user/:userId/accepted', restrictedAdmin, validateChallengeId, (req, res) => {
  const { challengeId } = req.params;
  const { userId } = req.params;

  Challenges.findIfChallengeAlreadyAccepted(userId, challengeId)
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting this challenge'
      });
    });
});

//*************** ABANDON A CHALLENGE *****************//
router.delete('/:challengeId/abandon', restrictedUser, checkForChallengeAbandonedData, (req, res) => {
  let { user_id } = req.body;
  const { challengeId } = req.params;

  Challenges.abandonChallenge(user_id, challengeId)
    .then(response => {
      res.status(201).json({
        message: `The challenge was successfully abandoned`,
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        errorMessage: 'There was an error abandoning this user challenge'
      });
    });
});

//*************** FIND ALL CHALLENGE HIGH SCORES *****************//
router.get('/:challengeId/highscores', restrictedAdmin, validateChallengeId, (req, res) => {
  const { challengeId } = req.params;

  Challenges.findAllChallengeHighScores(challengeId)
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting the high scores for this challenge'
      });
    });
});

//*************** REMOVE CHALLENGE FROM THE DATABASE  *****************//
router.delete('/:challengeId', restrictedAdmin, validateChallengeId, (req, res) => {
  const challengeId = req.params.challengeId;

  Challenges.removeChallengeById(challengeId)
    .then(response => {
      res.status(200).json({
        success: `The challenge was successfully deleted`,
        id: challengeId
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error deleting this challenge`
      });
    });
});

//*************** UPDATE CHALLENGE *****************//
router.put('/:challengeId', restrictedAdmin, validateChallengeId, (req, res) => {
  const challengeId = req.params.challengeId;
  var changes = req.body;
  changes.updated_at = new Date() // rewrites updated_at timestamp to current time of update

  Challenges.updateChallengeById(challengeId, changes)
    .then(response => {
      res.status(200).json({ updatedChallenge: response });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error updating this challenge`
      });
    });
});

module.exports = router;