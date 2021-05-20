const router = require('express').Router();
const Systems = require('../models/systems-model.js')
const { validateSystemId, checkForSystemData } = require('../middleware/index.js');

//*************** GET ALL SYSTEMS *****************//
router.get('/', (req, res) => {
  Systems.findSystems()
    .then(systems => {
      res.json(systems);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting all systems to display'
      });
    });
});

//*************** GET SYSTEM BY ID *****************//
router.get('/:systemId', validateSystemId, (req, res) => {
  const { systemId } = req.params;

  Systems.findSystemById(systemId)
    .then(system => {
      res.json(system);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error getting this system'
      });
    });
});

//*************** ADD NEW SYSTEM TO THE DATABASE *****************//
router.post('/', checkForSystemData, (req, res) => {
  let system = req.body;

  Systems.addSystem(system)
    .then(response => {
      res.status(201).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error adding this system to the database'
      });
    });
});

//*************** REMOVE SYSTEM FROM THE DATABASE  *****************//
router.delete('/:systemId', validateSystemId, (req, res) => {
  const systemId = req.params.systemId;

  Systems.removeSystemById(systemId)
    .then(response => {
      res.status(200).json({
        success: `The system was successfully deleted`,
        id: systemId
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error deleting this system`
      });
    });
});

//*************** UPDATE SYSTEM *****************//
router.put('/:systemId', validateSystemId, (req, res) => {
  const systemId = req.params.systemId;
  var changes = req.body;
  changes.updated_at = new Date() // rewrites updated_at timestamp to current time of update

  Systems.updateSystemById(systemId, changes)
    .then(response => {
      res.status(200).json({ updatedSystem: response });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: `There was an error updating this system`
      });
    });
});

module.exports = router;