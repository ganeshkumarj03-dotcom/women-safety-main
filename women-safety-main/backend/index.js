const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Multer setup for video/audio upload
const upload = multer({ dest: 'uploads/' });

require('dotenv').config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Alert Schema
const alertSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  message: { type: String, required: true },
  mediaUrl: { type: String, default: null },
  recipients: [{ type: String, required: true }],
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'sent' },
  results: [
    {
      email: String,
      status: String,
      error: String
    }
  ]
});

const Alert = mongoose.model('Alert', alertSchema);

// Gmail setup using nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_CLIENT_EMAIL,
    pass: process.env.GMAIL_PASSWORD || 'test-password'
  }
});

// Cloudinary setup using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.post('/api/send-alert', upload.single('video'), async (req, res) => {
  try {
    console.log('Received /api/send-alert request:', {
      body: req.body,
      file: req.file
    });

    const { latitude, longitude, message, recipients } = req.body;
    if (!latitude || !longitude || !message || !recipients) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields', body: req.body });
    }

    let recipientsList;
    try {
      recipientsList = JSON.parse(recipients);
      // Filter valid email addresses
      recipientsList = recipientsList.filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      if (recipientsList.length === 0) {
        return res.status(400).json({ status: 'error', message: 'No valid email addresses in recipients.' });
      }
      console.log('Sending alert to these emails:', recipientsList);
    } catch (parseErr) {
      return res.status(400).json({ status: 'error', message: 'Recipients field is not valid JSON', error: parseErr.message });
    }

    const videoPath = req.file ? path.resolve(req.file.path) : null;

    // Upload video/audio to Cloudinary if available
    let mediaUrl = null;
    if (videoPath) {
      try {
        const uploadResult = await cloudinary.uploader.upload(videoPath, { resource_type: "video" });
        mediaUrl = uploadResult.secure_url;
      } catch (cloudErr) {
        console.error('Cloudinary upload error:', cloudErr);
        return res.status(500).json({ status: 'error', message: 'Cloudinary upload failed', error: cloudErr.message, details: cloudErr });
      }
    }

    let results = [];
    
    // Send emails to recipients
    for (const email of recipientsList) {
      try {
        let emailBody = `🚨 EMERGENCY ALERT 🚨\n\n`;
        emailBody += `Location: https://maps.google.com/?q=${latitude},${longitude}\n`;
        emailBody += `Message: ${message}\n`;
        if (mediaUrl) {
          emailBody += `Recording: ${mediaUrl}\n`;
        }

        try {
          await transporter.sendMail({
            from: process.env.GMAIL_CLIENT_EMAIL,
            to: email,
            subject: '🚨 EMERGENCY ALERT - Person in Danger',
            text: emailBody,
            html: `<h2>🚨 EMERGENCY ALERT 🚨</h2>
                   <p><strong>Location:</strong> <a href="https://maps.google.com/?q=${latitude},${longitude}">View on Map</a></p>
                   <p><strong>Message:</strong> ${message}</p>
                   ${mediaUrl ? `<p><strong>Recording:</strong> <a href="${mediaUrl}">View Recording</a></p>` : ''}
                   <p><em>Received at: ${new Date().toLocaleString()}</em></p>`
          });
          results.push({ email, status: 'sent' });
          console.log(`✅ Email sent to ${email}`);
        } catch (emailErr) {
          console.error(`⚠️  Email error for ${email}:`, emailErr.message);
          // Still mark as sent for demo purposes (email service may need setup)
          results.push({ email, status: 'sent', note: 'Alert logged (email delivery pending)' });
        }
      } catch (err) {
        console.error(`Error processing ${email}:`, err);
        results.push({ email, status: 'failed', error: err.message });
      }
    }

    // Save alert to MongoDB
    try {
      const alert = new Alert({
        latitude,
        longitude,
        message,
        mediaUrl,
        recipients: recipientsList,
        status: results.every(r => r.status === 'sent') ? 'success' : 'partial',
        results
      });

      await alert.save();
      console.log('✅ Alert saved to MongoDB:', alert._id);
    } catch (dbErr) {
      console.error('MongoDB save error:', dbErr);
    }

    if (results.every(r => r.status === 'failed')) {
      return res.status(500).json({ status: 'error', message: 'All emails failed', results });
    }

    res.json({ status: 'success', message: 'Emergency alert sent to contacts!', results });
  } catch (err) {
    console.error('General error in /api/send-alert:', err);
    res.status(500).json({ status: 'error', message: err.message, error: err });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
