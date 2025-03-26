const admin = require('firebase-admin');
const serviceAccount = require('./tasks-46f58-firebase-adminsdk-fbsvc-dc9b41431f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;