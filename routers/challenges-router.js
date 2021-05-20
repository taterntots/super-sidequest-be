const router = require('express').Router();
const Challenges = require('../models/challenges-model.js')
const { validateChallengeId, checkForChallengeData } = require('../middleware/index.js');

//*************** GET ALL CHALLENGES *****************//
router.get('/', (req, res) => {
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
router.get('/:challengeId', validateChallengeId, (req, res) => {
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
router.post('/', checkForChallengeData, (req, res) => {
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

//*************** REMOVE CHALLENGE FROM THE DATABASE  *****************//
router.delete('/:challengeId', validateChallengeId, (req, res) => {
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
router.put('/:challengeId', validateChallengeId, (req, res) => {
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