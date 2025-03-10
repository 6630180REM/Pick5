const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// VAPID keys should be generated using web-push command line
const vapidKeys = {
  publicKey: 'YOUR_VAPID_PUBLIC_KEY',
  privateKey: 'YOUR_VAPID_PRIVATE_KEY'
};

webpush.setVapidDetails(
  'mailto:kevin.swenson@hotmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Store subscriptions (in-memory for demo purposes)
// In production, use a database
const subscriptions = [];

// Endpoint to save new subscription
app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  
  // Store the subscription
  subscriptions.push(subscription);
  
  // Send a welcome notification
  const payload = JSON.stringify({
    title: 'Welcome to Joe\'s Pick 5!',
    body: 'You will now receive updates and notifications.'
  });
  
  webpush.sendNotification(subscription, payload)
    .catch(err => console.error(err));
  
  res.status(201).json({ success: true });
});

// Endpoint to trigger push notification to all subscribers
app.post('/api/notify', (req, res) => {
  const { title, body } = req.body;
  const payload = JSON.stringify({ title, body });
  
  const sendPromises = subscriptions.map(subscription => {
    return webpush.sendNotification(subscription, payload)
      .catch(err => {
        console.error('Error sending notification:', err);
        // If subscription is no longer valid, remove it
        if (err.statusCode === 410) {
          const index = subscriptions.indexOf(subscription);
          if (index !== -1) {
            subscriptions.splice(index, 1);
          }
        }
      });
  });
  
  Promise.all(sendPromises)
    .then(() => res.status(200).json({ success: true }))
    .catch(err => {
      console.error('Error sending notifications:', err);
      res.status(500).json({ success: false, error: err.message });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
