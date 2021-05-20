const db = require('../data/dbConfig.js');

//FIND ALL DIFFICULTIES
function findDifficulties() {
  return db('difficulty')
}

//FIND DIFFICULTY BY ID
function findDifficultyById(difficultyId) {
  return db('difficulty as d')
    .where('d.id', difficultyId)
    .first()
}

//FIND DIFFICULTIES BY A SPECIFIC FILTER (NEEDED FOR VALIDATION MIDDLEWARE)
function findDifficultiesBy(filter) {
  return db('difficulty')
    .where(filter);
}

//ADD A DIFFICULTY TO THE DATABASE
function addDifficulty(difficulty) {
  return db('difficulty')
    .insert(difficulty, 'id')
    .then(([id]) => {
      return findDifficultyById(id);
    });
}

//DELETE A DIFFICULTY FROM THE DATABASE
function removeDifficultyById(difficultyId) {
  return db('difficulty')
    .where('id', difficultyId)
    .del()
}

//UPDATE A GAME
function updateDifficultyById(difficultyId, changes) {
  return db('difficulty')
    .where('id', difficultyId)
    .update(changes)
    .then(difficulty => {
      return findDifficultyById(difficultyId);
    })
}

module.exports = {
  findDifficulties,
  findDifficultyById,
  findDifficultiesBy,
  addDifficulty,
  removeDifficultyById,
  updateDifficultyById
};