// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Createproject from './pages/CreateprojectPage';
import ProjectDetails from './pages/ProjectDetails'; // you’ll create this later
import UploadBatch from './pages/UploadBatch';
import AllBatches from './pages/AllBatches';
import BatchDashboard from './pages/BatchDashboard';
import VerifyCertificate from './pages/VerifyCertificate';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<Createproject />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
        <Route path="/upload-batch" element={<UploadBatch />} />
        <Route path="/batches" element={<AllBatches />} />
        <Route path="/batch/:batchId" element={<BatchDashboard />} />
        <Route path="/verify" element={<VerifyCertificate />} />



      </Routes>
    </Router>
  );
}

export default App;
