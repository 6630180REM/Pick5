const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendPushNotification = functions.https.onCall(async (data, context) => {
  const { message, tokens } = data;

  if (!message || !tokens || !Array.isArray(tokens) || tokens.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid data provided.');
  }

  const payload = {
    notification: {
      title: "Joe's Pick 5",
      body: message,
    },
  };

  try {
    const response = await admin.messaging().sendToDevice(tokens, payload);
    console.log('Successfully sent message:', response);
    return { success: true, response: response };
  } catch (error) {
    console.error('Error sending message:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send message.');
  }
});
