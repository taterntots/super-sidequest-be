const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/secret.js');
const sgMail = require('@sendgrid/mail');
const Verifier = require('email-verifier');
const Users = require('../models/users-model.js')
const { checkForUserData, checkVerificationCodeValidity } = require('../middleware/index.js');

const sendGridKey = process.env.SENDGRID_KEY;
const resetSecret = process.env.JWT_SECRET;
const emailVerificationKey = process.env.EMAIL_VERIFICATION_KEY;

//*************** SIGNUP *****************//

router.post('/signup', checkForUserData, (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 3);
  let verifier = new Verifier(emailVerificationKey);
  user.password = hash;
  user.verification_code = Math.floor(100000 + Math.random() * 900000) // random six digit number

  // Check that the email is real before adding to the database
  verifier.verify(user.email, (err, data) => {
    if (err) {
      res.status(500).json('Could not verify if email address is real');
    } else if (data.formatCheck === 'true' && data.smtpCheck === 'true' && data.dnsCheck === 'true' && data.disposableCheck === 'false') {

      // If the user email address is real, add them to the database
      Users.addUser(user)
        .then(newUser => {
          const token = signToken(newUser);
          const { id, username, email } = newUser;
          setTimeout(function () { // Give it some loading time
            res.status(201).json({ id, username, email, token });
          }, 2000)
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            error: 'There was an error signing up this user to the database'
          });
        });
    } else {
      res.status(404).json('Email address is not real');
    }
  });

});

//*************** LOGIN *****************//

router.post('/login', (req, res) => {
  let { email, password } = req.body;

  Users.findUsersBy({ email })
    .first()
    .then(user => {
      // If the user exists, passwords match, and has verified their email, log 'em in!
      if (user && bcrypt.compareSync(password, user.password) && user.is_verified) {
        setTimeout(function () { // Give it some loading time
          const token = signToken(user);
          const { id, username, email } = user;
          res.status(200).json({ id, username, email, token });
        }, 2000)
        // Otherwise, if the user exists, passwords match, and has NOT verified their email, 
      } else if (user && bcrypt.compareSync(password, user.password) && !user.is_verified) {
        res.status(401).json({ message: 'Please verify your account' });
        // Otherwise, email and password don't match, or the user does not exist
      } else {
        res.status(401).json({ message: 'Email address does not exist or password does not match' });
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
      res.status(404).json({ error: "Email not in our database" });
    } else {
      // Otherwise we need to create a temporary token that expires in 10 mins
      const reset_link = jwt.sign({ user: user.email },
        resetSecret, { expiresIn: '10m' });
      // Update reset_link property to be the temporary token and then send email
      await Users.updateUserById(user.id, { reset_link });
      // We'll define this function below
      sendPasswordEmail(user, reset_link);
      setTimeout(function () { // Give it some loading time
        res.status(200).json({ message: "Request sent! Please check your email" });
      }, 2000)
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
      res.status(400).json({ message: 'Could not find a user match for this link. Link is expired.' });
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
    setTimeout(function () { // Give it some loading time
      res.status(200).json({ message: 'Password updated' });
    }, 2000)

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

//*************** VERIFY *****************//

router.post('/verify/:email/:code', checkVerificationCodeValidity, (req, res) => {
  let { email } = req.params;

  Users.verifyUser(email)
    .then(newUser => {
      const token = signToken(newUser);
      const { id, username, email } = newUser;
      setTimeout(function () { // Give it some loading time
        res.status(201).json({ id, username, email, token });
      }, 2000)
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'There was an error verifying this user'
      });
    });
});

//*************** SEND CONTACT EMAIL *****************//

router.patch('/contact-email', async (req, res) => {
  const { email, subject, message } = req.body;

  try {
    // Send email to my account
    sgMail.setApiKey(sendGridKey);
    const msg = {
      to: "taterntots.twitch@gmail.com",
      from: "matthew.a.weidner@gmail.com",
      subject: subject,
      html: `
      <h1>${email}</h1>
       <p>${message}</p>
     `
    };
    await sgMail.send(msg)
      .then(() => {
        setTimeout(function () { // Give it some loading time
          res.status(200).json({ message: 'Message sent! We will get back to you as soon as we can.' });
        }, 2000)
      }).catch(() => {
        res.status(500).json({ message: 'There was a problem sending your message.' });
      })
  } catch (error) {
    res.status(500).json({ message: 'Bad news bears. Something is wrong with this endpoint.' });
  }
})

//************************* SEND EMAIL FUNCTIONS *****************************//

function sendPasswordEmail(user, token) {
  sgMail.setApiKey(sendGridKey);
  const msg = {
    to: user.email,
    from: "taterntots.twitch@gmail.com",
    subject: "Reset password requested",
    html: `
     <a href="${process.env.SITE_URL}reset-password/?key=${token}">Click here to enter new password</a>
   `
  };
  sgMail.send(msg)
    .then(() => {
      console.log("Email sent");
    }).catch((error) => {
      console.error("Email failed to send");
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
    expiresIn: '72h'
  };
  return jwt.sign(payload, jwtSecret, options);
}

module.exports = router;