// src/pages/Createproject.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import Joyride from 'react-joyride';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Createproject = () => {
    const [formData, setFormData] = useState({
        projectName: '',
        description: '',
        issuer: '',
        issueDate: '',
    });

    const [file, setFile] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [qrCoords, setQrCoords] = useState({ x: 0, y: 0 });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setPdfUrl(URL.createObjectURL(selectedFile));
    };

    const handlePdfClick = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setQrCoords({ x, y });
        alert(`QR Position captured at X: ${x}, Y: ${y}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please upload a PDF');

        const data = new FormData();
        data.append('templatePdf', file);
        data.append('projectName', formData.projectName);
        data.append('description', formData.description);
        data.append('issuer', formData.issuer);
        data.append('issueDate', formData.issueDate);
        data.append('qrX', qrCoords.x);
        data.append('qrY', qrCoords.y);

        try {
            const res = await axios.post('http://localhost:5000/project', data);
            if (res.status === 200) {
                alert('Project created successfully!');
                setFile(null);
                setFormData({
                    projectName: '',
                    description: '',
                    issuer: '',
                    issueDate: '',
                });
                setQrCoords({ x: 0, y: 0 });
                setPdfUrl(null);
            }

        } catch (err) {
            console.error(err);
            alert('Error submitting project');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <Joyride
                continuous
                showSkipButton
                steps={[
                    {
                        target: '.project-name',
                        content: 'Enter the name of your certificate project here.',
                    },
                    {
                        target: '.upload-pdf',
                        content: 'Upload a sample certificate template in PDF format.',
                    },
                    {
                        target: '.pdf-preview',
                        content: 'Click anywhere on the PDF to select QR code position.',
                    },
                    {
                        target: '.submit-button',
                        content: 'Click here to save your project and proceed.',
                    },
                ]}
            />
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">🎓 Create Certificate Project</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="projectName"
                        placeholder="Project Name"
                        onChange={handleInputChange}
                        required
                        className="project-name w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="text"
                        name="description"
                        placeholder="Description"
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="text"
                        name="issuer"
                        placeholder="Issuer"
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="date"
                        name="issueDate"
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        required
                        className="upload-pdf w-full"
                    />
                    <button
                        type="submit"
                        className="submit-button w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition"
                    >
                        Submit Project
                    </button>
                </form>

                {pdfUrl && (
                    <div className="mt-8 pdf-preview">
                        <h4 className="font-medium text-gray-700 mb-2">Click on the PDF to set QR code position:</h4>
                        <div className="border rounded shadow">
                            <Document file={pdfUrl}>
                                <Page
                                    pageNumber={1}
                                    width={600}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    onClick={handlePdfClick}
                                />
                            </Document>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Captured QR Coordinates: <span className="font-semibold">X = {qrCoords.x}, Y = {qrCoords.y}</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Createproject;
