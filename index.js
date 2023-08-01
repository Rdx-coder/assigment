// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const cron = require('node-cron');

// Configure Twilio
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const twilioClient = twilio(accountSid, authToken);
const twilioPhoneNumber = 'YOUR_TWILIO_PHONE_NUMBER'; // Twilio phone number from which SMS will be sent

// Create Express app
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Subscription data (In a real-world scenario, this should be stored in a database)
const subscribers = new Set();

// Endpoint for subscribing to the service
app.post('/subscribe', (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  if (!subscribers.has(phoneNumber)) {
    subscribers.add(phoneNumber);
    res.status(200).send('Subscribed successfully!');
  } else {
    res.status(200).send('You are already subscribed!');
  }
});

// Function to send daily health tips to all subscribers
function sendDailyHealthTips() {
  const healthTips = [
    'Remember to drink enough water throughout the day!',
    'Take a short walk or do some stretching exercises.',
    'Include colorful fruits and vegetables in your diet.',
    'Practice deep breathing for relaxation and stress reduction.',
    'Get enough sleep for a well-rested body and mind.',
  ];

  subscribers.forEach((phoneNumber) => {
    const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
    twilioClient.messages
      .create({
        body: randomTip,
        from: twilioPhoneNumber,
        to: phoneNumber,
      })
      .then((message) => console.log(`Health tip sent to ${message.to}: ${message.body}`))
      .catch((err) => console.error('Error sending SMS:', err));
  });
}

// Schedule the daily health tips at 10:00 AM every day
cron.schedule('0 10 * * *', sendDailyHealthTips);

// Start the server
const port = 3000; // You can change the port if needed
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
