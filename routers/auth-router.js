const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/secret.js');
const sgMail = require('@sendgrid/mail');
const Users = require('../models/users-model.js')
const { checkForUserData } = require('../middleware/index.js');

const sendGridKey = process.env.SENDGRID_KEY;
const resetSecret = process.env.JWT_SECRET;

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

//*************** RESET PASSWORD *****************//

router.patch('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Look for email in database
    const [user] = await Users.findUsersBy({ email });
    // If there is no user send back an error
    if (!user) {
      res.status(404).json({ error: "Invalid email" });
    } else {
      // Otherwise we need to create a temporary token that expires in 10 mins
      const reset_link = jwt.sign({ user: user.email },
        resetSecret, { expiresIn: '10m' });
      // Update reset_link property to be the temporary token and then send email
      await Users.updateUserById(user.id, { reset_link });
      // We'll define this function below
      sendEmail(user, reset_link);
      res.status(200).json({ message: "Check your email" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

//************************* UPDATE NEW PASSWORD *****************************//

router.patch('/reset-password/:token', async (req, res) => {
  // Get the token from params
  const reset_link = req.params.token;
  const newPassword = req.body;

  // If there is a token we need to decode it and check for no errors
  if (reset_link) {
    jwt.verify(reset_link, resetSecret, (error, decodedToken) => {
      if (error) {
        res.status(401).json({ message: 'Incorrect token or expired' })
      }
    })
  }

  try {
    // Find user by the temporary token we stored earlier
    const [user] = await Users.findUsersBy({ reset_link });
    // If there is no user, send back an error
    if (!user) {
      res.status(400).json({ message: 'We could not find a match for this link' });
    }
    // Otherwise we need to hash the new password  before saving it in the database
    const hashPassword = bcrypt.hashSync(newPassword.password, 8);
    newPassword.password = hashPassword;
    // Update user credentials and remove the temporary link from database before saving
    const updatedCredentials = {
      password: newPassword.password,
      reset_link: null
    }
    await Users.updateUserById(user.id, updatedCredentials);
    res.status(200).json({ message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

//************************* SEND EMAIL FUNCTION *****************************//

function sendEmail(user, token) {
  sgMail.setApiKey(sendGridKey);
  const msg = {
    to: user.email,
    from: "taterntots.twitch@gmail.com",
    subject: "Reset password requested",
    html: `
     <a href="${process.env.SITE_URL}/reset-password/${token}">${token}</a>
   `
  };
  sgMail.send(msg)
    .then(() => {
      console.log("Email sent");
    }).catch((error) => {
      console.error(error);
    })
}

//************************* CREATE TOKEN *****************************//

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

module.exports = router;