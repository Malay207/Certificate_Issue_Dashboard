Certificate Issuance Web Application

This is a full-stack web application that allows users to create certificate templates, upload batches of certificates with student data, and simulate the issuance process with real-time status updates.

✨ Features

Core Features

Project Management: Create, update, and view certificate template projects.

Batch Upload: Upload ZIP files containing PDFs and an Excel sheet.

Validation: Automatically validate that every student in Excel has a corresponding PDF.

Issuance Simulation: Start issuance process that updates each certificate status in real-time.

Retry Failed: Retry any certificate that failed to issue.

Download Issued ZIP: Once issuance is complete, download a ZIP of all issued PDFs.

Real-Time Updates: WebSocket integration for live certificate status tracking.

Validation breakdowns in 50-student chunks

Excel parsing with support for multiple key formats (e.g. ID, Id, id)

Dynamic sheet name parsing

Issuance simulation with delays and retry

🚀 Technologies Used

Layer

Technology

Frontend

React, TailwindCSS

Backend

Node.js, Express

File Uploads

Multer, Unzipper

Excel Parsing

xlsx

Real-Time

Socket.io

Compression

Archiver (ZIP output)

📦 Project Structure

backend/
├── controllers/
│   ├── batchController.js
│   ├── projectController.js
├── routes/
│   ├── batchRoutes.js
│   ├── projectRoutes.js
├── middlewares/
│   └── multerConfig.js
├── uploads/
├── socket/
│   └── socket.js
├── server.js
└── package.json

frontend/
├── src/
│   ├── components/         # Reusable components
│   ├── pages/              # Dashboard, Upload, Batch Views
│   └── App.jsx, index.js
├── public/
├── tailwind.config.js
├── package.json

📆 Sample Test ZIP

Included in the repository: sample_batch.zip


Excel sheet data.xlsx with matching FileName column and ID

Used for testing batch upload, validation, and issuance

🔧 Setup Instructions

Backend

cd backend
npm install
npm run dev

Frontend

cd frontend
npm install
npm run dev

Make sure the backend is running on http://localhost:5000 and frontend on http://localhost:5173 or configured accordingly.

🚫 Known Limitations

Only supports .pdf and .xlsx files

Issuance is a simulation and does not embed data into PDFs

Server stores everything on disk (no DB for now)
