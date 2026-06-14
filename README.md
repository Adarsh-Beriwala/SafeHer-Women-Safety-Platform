<div align="center">
  
# 🛡️ SafeHer: Next-Gen Women Safety Platform

**A real-time, hardware-integrated safety application featuring live GPS tracking, mathematical volunteer dispatch, and automated evidence collection.**

<br />

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=Twilio&logoColor=white)

</div>

---

## 🌟 Why SafeHer Stands Out
SafeHer is not just a standard web app; it's a demonstration of integrating **Browser Hardware APIs** (Geolocation, MediaRecorder, SpeechRecognition) with **Advanced Cloud Services** and **Mathematical Distance Algorithms** to solve real-world emergency scenarios efficiently.

---

## ✨ Core System Architecture

### 🚨 1. Automated Emergency Workflow
> *Zero-latency SOS triggering designed for high-stress situations.*

| Feature | Description | Technical Implementation |
| :--- | :--- | :--- |
| **One-Tap SOS** | Instantly fires the emergency sequence across all systems. | React State Management & Firestore `setDoc` |
| **Voice Activation** | Hands-free trigger by saying **"Help Me"**. | HTML5 `SpeechRecognition` Web API |
| **Twilio SMS Alerts** | Sends emergency SMS with a Native Google Maps URL. | Node.js Twilio SDK integration |

<br />

### 📍 2. Dual-Mode Location Tracking
> *Leverages hardware GPS chips for sub-meter accuracy.*

| Mode | Behavior | Technology Used |
| :--- | :--- | :--- |
| **Live Web Tracking** | The frontend continuously updates the map every 2s as the user moves. | `navigator.geolocation.watchPosition` + Leaflet Maps + Firebase `onSnapshot` |
| **Native Deep-Link** | SMS recipients click a link to instantly open the Google Maps mobile app. | Dynamic URL Generation (`maps.google.com/?q=lat,lng`) |

<br />

### 🤝 3. Haversine-Powered Volunteer Dispatch
> *Mathematical efficiency to find help nearby.*

Instead of sending blanket alerts to all users, SafeHer calculates the exact spherical distance between the victim and active volunteers using the **Haversine Formula**.
* Only volunteers within a strict **5KM radius** are dispatched.
* Built using pure server-side Node.js computation to reduce frontend load.

<br />

### 📸 4. Automated Evidence Vault
> *Securing proof before the phone can be taken away.*

| Feature | Action | Storage Logic |
| :--- | :--- | :--- |
| **Silent Camera** | Takes a photo using the front/rear camera immediately. | Converted to `Blob` & pushed to Firebase Storage |
| **Audio Recording** | Records the next 10 seconds of ambient audio silently. | `MediaRecorder API` -> Firebase Storage |
| **Immutable Log** | Evidence is permanently tied to the specific SOS Session ID. | Firestore Reference Pointers |

<br />

### 🛡️ 5. Pre-Emptive Safety Tools
* **Fake Call Generator:** Simulates a realistic incoming call (custom caller ID & delay) to escape uncomfortable situations.
* **Dead-Man's Switch (Periodic Check-In):** A countdown timer that automatically triggers an SOS if the user fails to tap "I'm Safe".
* **SafeBot (AI):** Context-aware chatbot powered by the **Google Gemini AI API** for instant safety strategies and mental health support.

---

## 🛠️ The Tech Stack

### Frontend (Client)
- **Framework:** React.js (Vite)
- **State & Routing:** Context API, React Router DOM
- **UI/UX:** Custom Vanilla CSS3 (Dark Glassmorphism UI)
- **Map Engine:** React-Leaflet (OpenStreetMap integration)

### Backend (Server)
- **Runtime:** Node.js + Express.js REST API
- **Database:** Firebase Firestore (NoSQL, Real-time sync)
- **Authentication:** Firebase Auth (JWT)
- **Blob Storage:** Firebase Cloud Storage

---

## 💻 Local Setup & Installation

<details>
<summary><b>Click to expand Installation Instructions</b></summary>

### Prerequisites
- Node.js (v18+)
- Firebase Account (Firestore, Auth, Storage)
- Twilio Account (for SMS)

### 1. Clone & Install
```bash
git clone https://github.com/Adarsh-Beriwala/SafeHer-Women-Safety-Platform.git
cd SafeHer-Women-Safety-Platform

# Client setup
cd client
npm install

# Server setup
cd ../server
npm install
```

### 2. Environment Variables
You need two `.env` files.

**`client/.env`**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_key
VITE_API_URL=http://localhost:5001
```

**`server/.env`**
```env
PORT=5001
CLIENT_URL=http://localhost:5173
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
TWILIO_VERIFIED_PHONE=your_personal_phone
```

### 3. Run the App
```bash
# Terminal 1 (Backend)
cd server
npm run dev

# Terminal 2 (Frontend)
cd client
npm run dev
```
</details>

---

<div align="center">
  <i>Developed to showcase full-stack engineering, hardware API integration, and mathematical system design.</i>
</div>
