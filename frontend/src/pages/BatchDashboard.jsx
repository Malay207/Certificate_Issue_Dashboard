import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const BatchDashboard = () => {
    const { batchId } = useParams();
    const [certs, setCerts] = useState([]);
    const [status, setStatus] = useState('pending');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load initial batch data
        axios.get(`http://localhost:5000/batch/${batchId}/status`)
            .then((res) => {
                setCerts(res.data.certificates);
                console.log(res.data);
                setStatus(res.data.status);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                alert('Batch not found');
                setLoading(false);
            });

        // WebSocket updates
        socket.on('statusUpdate', ({ batchId: updatedId, cert }) => {
            if (updatedId !== batchId) return;
            setCerts(prev =>
                prev.map(c => (c.id === cert.id ? { ...c, status: cert.status } : c))
            );
        });

        socket.on('batchComplete', ({ batchId: doneId }) => {
            if (doneId === batchId) setStatus('completed');
        });

        return () => {
            socket.off('statusUpdate');
            socket.off('batchComplete');
        };
    }, [batchId]);

    const retryCert = (certId) => {
        axios.post(`http://localhost:5000/retry/${batchId}/${certId}`)
            .then(() => console.log('Retrying...'))
            .catch(() => alert('Retry failed'));
    };

    const downloadZip = () => {
        window.open(`http://localhost:5000/download/${batchId}`);
    };

    if (loading) return <div className="p-10 text-center">Loading batch...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-5xl mx-auto bg-white rounded shadow p-6">
                <div className="flex flex-col md:flex-row md:justify-between gap-3 items-center mb-6">
                    <h2 className="text-2xl font-bold text-center md:text-left">🚀 Batch: {batchId}</h2>

                    <div className="flex gap-3">
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                            disabled={status !== 'pending'}
                            onClick={(e) => {
                                e.preventDefault();
                                axios.post(`http://localhost:5000/issue/${batchId}`)
                                    .then(() => {
                                        alert('Issuance started!');
                                        setStatus('in_progress');
                                    })
                                    .catch(() => alert('Failed to start issuance'));
                            }}
                        >
                            🚀 Start Issuance
                        </button>

                        <button
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                            onClick={downloadZip}
                            disabled={status !== 'completed'}
                        >
                            ⬇ Download Issued ZIP
                        </button>
                    </div>
                </div>


                <p className="text-gray-600 mb-4">Status: <strong>{status}</strong></p>

                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-4 py-2 border">Certificate ID</th>
                                <th className="px-4 py-2 border">Filename</th>
                                <th className="px-4 py-2 border">Status</th>
                                <th className="px-4 py-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {certs.map((cert) => (
                                <tr key={cert.id}>
                                    <td className="px-4 py-2 border">{cert.id}</td>
                                    <td className="px-4 py-2 border">{cert.file}</td>
                                    <td className="px-4 py-2 border">{cert.status}</td>
                                    <td className="px-4 py-2 border space-x-2 text-center">
                                        <button
                                            onClick={() =>
                                                window.open(
                                                    `http://localhost:5000/uploads/batches/batch_${batchId}/extracted/${cert.file}`
                                                )
                                            }
                                            className="text-blue-600 underline"
                                        >
                                            View
                                        </button>

                                        <button
                                            onClick={() =>
                                                window.open(`https://verify.example.com?id=${cert.id}`, '_blank')
                                            }
                                            className="text-purple-600 underline"
                                        >
                                            Verify
                                        </button>

                                        {cert.status === 'failed' && (
                                            <button
                                                onClick={() => retryCert(cert.id)}
                                                className="text-red-600 underline"
                                            >
                                                Retry
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className="text-center mt-4 text-gray-500 text-sm">
                    Real-time updates enabled via WebSocket.
                </p>
            </div>
        </div>
    );
};

export default BatchDashboard;
