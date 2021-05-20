const router = require('express').Router();
const Difficulty = require('../models/difficulty-model.js')
const { validateDifficultyId, checkForDifficultyData } = require('../middleware/index.js');

//*************** GET ALL DIFFICULTIES *****************//
router.get('/', (req, res) => {
  Difficulty.findDifficulties()
    .then(difficulties => {
      res.json(difficulties);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting all difficulties to display'
      });
    });
});

//*************** GET DIFFICULTY BY ID *****************//
router.get('/:difficultyId', validateDifficultyId, (req, res) => {
  const { difficultyId } = req.params;

  Difficulty.findDifficultyById(difficultyId)
    .then(difficulty => {
      res.json(difficulty);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting this difficulty'
      });
    });
});

//*************** ADD NEW DIFFICULTY TO THE DATABASE *****************//
router.post('/', checkForDifficultyData, (req, res) => {
  let difficulty = req.body;

  Difficulty.addDifficulty(difficulty)
    .then(response => {
      res.status(201).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error adding this difficulty to the database'
      });
    });
});

//*************** REMOVE DIFFICULTY FROM THE DATABASE  *****************//
router.delete('/:difficultyId', validateDifficultyId, (req, res) => {
  const difficultyId = req.params.difficultyId;

  Difficulty.removeDifficultyById(difficultyId)
    .then(response => {
      res.status(200).json({
        success: `The difficulty was successfully deleted`,
        id: difficultyId
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error deleting this difficulty`
      });
    });
});

//*************** UPDATE DIFFICULTY *****************//
router.put('/:difficultyId', validateDifficultyId, (req, res) => {
  const difficultyId = req.params.difficultyId;
  var changes = req.body;
  changes.updated_at = new Date() // rewrites updated_at timestamp to current time of update

  Difficulty.updateDifficultyById(difficultyId, changes)
    .then(response => {
      res.status(200).json({ updatedDifficulty: response });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error updating this difficulty`
      });
    });
});

module.exports = router;