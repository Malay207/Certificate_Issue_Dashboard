import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get('http://localhost:5000/projects')
            .then((res) => setProjects(res.data))
            .catch((err) => console.error('Error loading projects:', err));
    }, []);
    console.log("projects", projects);
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-center md:text-left">📋 Project Dashboard</h1>

                <div className="flex flex-wrap gap-2">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow-md"
                        onClick={() => navigate('/create')}
                    >
                        ➕ Create Project
                    </button>
                    <button
                        onClick={() => navigate('/upload-batch')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded shadow-md"
                    >
                        🧾 Upload Batch
                    </button>
                    <button
                        onClick={() => navigate('/batches')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow-md"
                    >
                        📦 View All Batches
                    </button>
                </div>
            </div>

            {projects.length === 0 ? (
                <p className="text-center text-gray-600">No projects found.</p>
            ) : (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between"
                        >
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">{project.projectName}</h2>
                                <p className="text-sm text-gray-600 mb-1">
                                    <strong>Issuer:</strong> {project.issuer}
                                </p>
                                <p className="text-sm text-gray-600 mb-1">
                                    <strong>Issue Date:</strong> {project.issueDate}
                                </p>
                            </div>

                            <button
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                                onClick={() => navigate(`/project/${project.id}`)}
                            >
                                🔍 View / Edit
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

};

export default Dashboard;
