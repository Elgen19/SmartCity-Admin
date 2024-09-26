// controllers/signupController.js
const firebase = require('firebase-admin');
const db = firebase.database();

exports.verifySignupInvite = async (req, res) => {
  console.log('Verify Signup Invite called with token:', req.query.token);
  const { token } = req.query;

  try {
      const invitationRef = await db.ref('invitations').orderByChild('token').equalTo(token).once('value');
      const invitation = invitationRef.val();

      if (!invitation) {
          return res.status(400).json({ message: 'Invalid or expired token' });
      }

      const inviteData = Object.values(invitation)[0]; // Extract the first item

      if (inviteData.expiration < Date.now()) {
          return res.status(400).json({ message: 'Token has expired' });
      }

      // Token is valid
      res.status(200).json({ message: 'Token is valid', email: inviteData.email });
  } catch (error) {
      res.status(500).json({ message: 'Error verifying invitation token', error: error.message });
  }
};

exports.signup = async (req, res) => {
  console.log('Sign Up called with data:', req.body);
  const { token, name, password } = req.body;

  try {
      // Find the invitation in the Firebase Realtime Database
      const invitationRef = await db.ref('invitations').orderByChild('token').equalTo(token).once('value');
      const invitation = invitationRef.val();

      if (!invitation) {
          return res.status(400).json({ message: 'Invalid or expired token' });
      }

      const inviteData = Object.values(invitation)[0]; // Get the first matching invitation
      const { email, expiration } = inviteData;

      if (expiration < Date.now()) {
          return res.status(400).json({ message: 'Token has expired' });
      }

      // Check if the email is already in use
      const userRecord = await firebase.auth().getUserByEmail(email).catch(error => {
          // If user doesn't exist, this error is expected
          if (error.code !== 'auth/user-not-found') {
              throw error; // Rethrow unexpected errors
          }
          return null; // Return null if user does not exist
      });

      if (userRecord) {
          return res.status(400).json({ message: 'Email is already in use' });
      }

      // Create the user in Firebase Authentication
      const newUserRecord = await firebase.auth().createUser({
          email,
          password,
          displayName: name
      });

      // Save extra admin data in the Firebase Realtime Database
      await db.ref(`admins/${newUserRecord.uid}`).set({
          name,
          email,
          invitedBy: inviteData.invitedBy,
          createdAt: Date.now()
      });

      // Delete the invitation once it's used
      await db.ref(`invitations/${Object.keys(invitation)[0]}`).remove();

      res.status(200).json({ message: 'Admin account created successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error creating account', error: error.message });
  }
};
