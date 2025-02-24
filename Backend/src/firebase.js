const admin = require('firebase-admin');
const serviceAccount = require('./tasks-46f58-firebase-adminsdk-fbsvc-5da18491ee.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;