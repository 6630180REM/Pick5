const webPush = require('web-push');
const express = require('express');
const app = express();

app.use(express.json());

// Replace with your VAPID keys
const vapidKeys = {
  publicKey: 'BLy94-OE_jowdq1VzI9Ni58qZPduEiHUGDcuKgNSPwEfVQ40v3xwbsIxrVFhb-H-hWnb74ZvDgpquqOanSy7v3s',
  privateKey: '1MxpQVW9wkp9O4U0m2JiQ2WasTHt8APLdgHqR0lHt-c',
};

webPush.setVapidDetails(
  'mailto:your-email@example.com', // Your contact email
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Store subscriptions (in-memory for this example; use a database in production)
const subscriptions = [];

// Endpoint to receive subscriptions from the client
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ message: 'Subscription received' });
});

// Endpoint to send a test notification
app.post('/send-notification', (req, res) => {
  const notificationPayload = {
    title: "Joe's Pick 5",
    body: 'Check out the latest picks!',
    url: '/',
  };

  const promises = subscriptions.map((subscription) =>
    webPush.sendNotification(subscription, JSON.stringify(notificationPayload))
  );

  Promise.all(promises)
    .then(() => res.status(200).json({ message: 'Notification sent' }))
    .catch((error) => {
      console.error('Error sending notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
