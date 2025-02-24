const OneSignal = require('onesignal-node');
require('dotenv').config();

const oneSignalClient = new OneSignal.Client({
  app: {
    appAuthKey: process.env.ONESIGNAL_REST_API_KEY,
    appId: process.env.ONESIGNAL_APP_ID,
  },
});

module.exports = oneSignalClient;