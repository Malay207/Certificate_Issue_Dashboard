import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [pdfUrl, setPdfUrl] = useState('');
    const [formData, setFormData] = useState({});
    const [qrCoords, setQrCoords] = useState({ x: 0, y: 0 });

    useEffect(() => {
        axios.get(`http://localhost:5000/project/${id}`)
            .then(res => {
                const data = res.data;
                setProject(data);
                setFormData({
                    projectName: data.projectName || '',
                    description: data.description || '',
                    issuer: data.issuer || '',
                    issueDate: data.issueDate || '',
                });
                setQrCoords(data.qrCoordinates || { x: 0, y: 0 });
                setPdfUrl(`http://localhost:5000/${data.templatePdfPath}`);
            })
            .catch(err => {
                alert('Project not found');
                console.error(err);
            });
    }, [id]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handlePdfClick = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        setQrCoords({ x, y });
    };

    const handleUpdate = () => {
        axios.put(`http://localhost:5000/project/${id}/update`, {
            ...formData,
            qrX: qrCoords.x,
            qrY: qrCoords.y
        })
            .then(res => {
                alert('✅ Project updated!');
                setProject(res.data.project);
            })
            .catch(err => {
                alert('❌ Update failed');
                console.error(err);
            });
    };

    if (!project) return <p className="text-center p-10">Loading project...</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
                <h2 className="text-2xl font-bold mb-4 text-center">🔍 Project Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <input name="projectName" value={formData.projectName} onChange={handleChange}
                        className="px-4 py-2 border rounded w-full" placeholder="Project Name" />
                    <input name="description" value={formData.description} onChange={handleChange}
                        className="px-4 py-2 border rounded w-full" placeholder="Description" />
                    <input name="issuer" value={formData.issuer} onChange={handleChange}
                        className="px-4 py-2 border rounded w-full" placeholder="Issuer" />
                    <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange}
                        className="px-4 py-2 border rounded w-full" />
                </div>

                <button
                    onClick={handleUpdate}
                    className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
                    💾 Save Changes
                </button>

                <div className="relative border rounded shadow w-fit mx-auto cursor-crosshair">
                    <Document file={pdfUrl}>
                        <Page
                            pageNumber={1}
                            width={600}
                            onClick={handlePdfClick}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                        />
                    </Document>

                    {/* Red QR Square marker */}
                    <div
                        className="absolute border-2 border-red-500"
                        style={{
                            left: qrCoords.x + 'px',
                            top: qrCoords.y + 'px',
                            width: '20px',
                            height: '20px',
                            pointerEvents: 'none',
                        }}
                    />
                </div>

                <p className="mt-4 text-sm text-center text-gray-600">
                    📍 Click on the PDF to set/update QR position. <br />
                    Current: <strong>X = {qrCoords.x}</strong>, <strong>Y = {qrCoords.y}</strong>
                </p>
            </div>
        </div>
    );
};

export default ProjectDetails;
