const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/secret.js');
const Users = require('../models/users-model.js')
const { checkForUserData } = require('../middleware/index.js');

//*************** SIGNUP *****************//

router.post('/signup', checkForUserData, (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 3);
  user.password = hash;

  Users.addUser(user)
    .then(newUser => {
      const token = signToken(newUser);
      const { id, username, email } = newUser;
      res.status(201).json({ id, username, email, token });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error signing up this user to the database'
      });
    });
});

//*************** LOGIN *****************//

router.post('/login', (req, res) => {
  let { email, password } = req.body;

  Users.findUsersBy({ email })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = signToken(user);
        const { id, username, email } = user;

        res.status(200).json({ id, username, email, token });
      } else {
        res.status(401).json({ message: 'Email address and password do not match' });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error signing in with this user'
      });
    });
});

/************************* CREATE TOKEN *****************************/

//Create TOKEN
function signToken(user) {
  const payload = {
    id: user.id,
    username: user.username
  };

  const options = {
    expiresIn: '24h'
  };
  return jwt.sign(payload, jwtSecret, options);
}

/************************* END CREATE TOKEN *****************************/

module.exports = router;