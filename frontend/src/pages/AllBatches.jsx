import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AllBatches = () => {
    const [batches, setBatches] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:5000/batch-list')
            .then((res) => setBatches(res.data))
            .catch((err) => console.error('Error loading batches:', err));
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">📦 All Uploaded Batches</h1>

            {batches.length === 0 ? (
                <p className="text-center text-gray-600">No batches uploaded yet.</p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {batches.map((batch) => (
                        <div key={batch.id} className="bg-white rounded shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Batch: {batch.id}</h2>
                            <p className="text-sm text-gray-600 mb-1">
                                Files: {batch.files}
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                Uploaded: {batch.time}
                            </p>
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
                                onClick={() => navigate(`/batch/${batch.id}`)}
                            >
                                🔍 View Issuance Status
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllBatches;
