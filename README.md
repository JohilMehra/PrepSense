# PrepSense – AI-Based Interview Simulation Platform

PrepSense is a full-stack web application that simulates real-world technical and behavioral interview rounds. It helps students prepare effectively through structured assessments, coding tests, and AI-driven feedback.

---

## ✨ Features

* Structured interview rounds (Fundamentals, Coding, Project, Scenario, HR)
* Coding assessments with company-style MCQs
* AI-based evaluation for descriptive answers
* Performance analysis with strengths and weaknesses
* Progress tracking across multiple attempts
* Personalized improvement insights

---

## 🛠️ Tech Stack

* Frontend: React, Tailwind CSS
* Backend: Node.js, Express.js
* Database: MongoDB (Mongoose)
* AI Integration: Gemini API

---

## ⚙️ How It Works

1. User starts an interview session
2. System generates structured questions
3. User answers MCQ and descriptive questions
4. AI evaluates responses and calculates score
5. Dashboard displays performance and weak areas

---

## 📁 Project Structure

client/     → React frontend
server/     → Node.js backend
data/       → Question datasets
routes/     → API routes
models/     → Database schemas

---

## ▶️ Run Locally

Clone the repository:
git clone https://github.com/JohilMehra/YOUR_REPO_NAME.git

Backend setup:
cd server
npm install
npm start

Frontend setup:
cd client
npm install
npm run dev

---

## 🔐 Environment Variables

Create a `.env` file inside the server folder:

MONGO_URI=your_mongodb_connection
GEMINI_API_KEY=your_api_key
JWT_SECRET=your_secret

---

## 🚧 Future Enhancements

* Video and voice-based interview simulation
* Adaptive AI-based question generation
* Resume scoring (ATS analysis)
* Advanced analytics dashboard
* Multi-role interview support
* Mobile-friendly version

---

## 🏆 Motivation

This project aims to bridge the gap between practice platforms and real interview experiences by providing a structured and realistic interview simulation system.

---

## 📌 Author

Johil Mehra

---

## ⭐ Support

If you found this project useful, consider giving it a star on GitHub.
