# 🛡️ Women Safety Alert Assistant

A premium, AI-powered emergency alert system designed to provide immediate assistance and coordination during safety emergencies. This application leverages Google's Gemini AI to analyze situations and coordinate with emergency contacts seamlessly.

![Women Safety Banner](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20Node.js%20%7C%20Gemini%20AI-blue?style=for-the-badge)

## ✨ Features

- **🚨 Instant Emergency Alerts**: Send multi-channel alerts (SMS, Email) to pre-configured emergency contacts with a single click.
- **🤖 Gemini AI Integration**: Intelligent situation analysis and automated response suggestions for first responders and contacts.
- **📍 Real-time Location Sharing**: Includes precise location coordinates in all emergency communications.
- **📱 Responsive Design**: A sleek, mobile-first glassmorphism interface for quick access on any device.
- **📁 Secure Emergency Vault**: Encrypted local storage for emergency contacts and personal medical information.

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0 or higher)
- [Gemini API Key](https://aistudio.google.com/app/apikey)

### Local Development

1. **Clone the project:**
   ```bash
   git clone https://github.com/Akilesh-kumar-25/women-safety.git
   cd women-safety
   ```

2. **Install dependencies:**
   ```bash
   # Install root and frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   MONGODB_URI=your_mongodb_connection_string
   GMAIL_PASSWORD=your_app_password
   # See CREDENTIAL_GUIDE.md for detailed instructions
   ```

4. **Run the application:**
   ```bash
   # For Frontend
   npm run dev
   
   # For Backend
   cd backend
   npm start
   ```

## 🔐 Security & Privacy

- **Data Privacy**: All personal contact information is stored locally on the device or in your private MongoDB instance.
- **Minimal Metadata**: The application only transmits essential emergency data during an alert trigger.
- **Environment Safety**: Secret keys and sensitive credentials are never committed to the repository (managed via `.env`).

## 🤝 Contributing

We welcome contributions from the community! If you're interested in improving Women Safety, please fork the repo and submit a pull request.


---

*Created with ❤️ for a safer world.*
