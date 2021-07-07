const db = require('../data/dbConfig.js');

//FIND ALL SYSTEMS
function findSystems() {
  return db('systems')
    .whereNot('name', 'Any')
    .orderBy('name', 'asc')
    .then(systems => {
      return findSystemByName('Any').then(anySystem => {
        if (anySystem) {
          systems.unshift(anySystem)
        }
        return systems
      })
    })
}

//FIND SYSTEM BY ID
function findSystemById(systemId) {
  return db('systems as s')
    .where('s.id', systemId)
    .first()
}

//FIND SYSTEM BY NAME
function findSystemByName(systemName) {
  return db('systems as s')
    .where('s.name', systemName)
    .first()
}

//FIND SYSTEMS BY A SPECIFIC FILTER (NEEDED FOR VALIDATION MIDDLEWARE)
function findSystemsBy(filter) {
  return db('systems')
    .where(filter);
}

//ADD A SYSTEM TO THE DATABASE
function addSystem(system) {
  return db('systems')
    .insert(system, 'id')
    .then(([id]) => {
      return findSystemById(id);
    });
}

//DELETE A SYSTEM FROM THE DATABASE
function removeSystemById(systemId) {
  return db('systems')
    .where('id', systemId)
    .del()
}

//UPDATE A SYSTEM
function updateSystemById(systemId, changes) {
  return db('systems')
    .where('id', systemId)
    .update(changes)
    .then(system => {
      return findSystemById(systemId);
    })
}

//FIND IF A SYSTEM EXISTS IN OUR DB AND RETURN TRUE OR FALSE
function findIfSystemExists(systemName) {
  return db('systems as g')
    .where('g.name', systemName)
    .first()
    .then(system => {
      if (system) {
        return true
      } else {
        return false
      }
    })
}

module.exports = {
  findSystems,
  findSystemById,
  findSystemsBy,
  addSystem,
  removeSystemById,
  updateSystemById,
  findIfSystemExists
};