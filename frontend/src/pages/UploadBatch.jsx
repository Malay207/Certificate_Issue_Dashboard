import React, { useState } from 'react';
import axios from 'axios';

const UploadBatch = () => {
    const [zipFile, setZipFile] = useState(null);
    const [validationResult, setValidationResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setZipFile(e.target.files[0]);
        setValidationResult(null);
        setErrorMsg('');
    };

    const handleUpload = async () => {
        if (!zipFile) return alert('Please select a ZIP file');

        const formData = new FormData();
        formData.append('batchZip', zipFile);

        setLoading(true);
        setErrorMsg('');
        try {
            const res = await axios.post('http://localhost:5000/upload-batch', formData);
            setValidationResult(res.data);
        } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data?.error || 'Upload failed');
        }
        setLoading(false);
    };

    const handleReset = () => {
        setZipFile(null);
        setValidationResult(null);
        setErrorMsg('');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
                <h2 className="text-2xl font-bold text-center mb-4">📤 Upload Certificate Batch</h2>

                {!validationResult && (
                    <>
                        <input
                            type="file"
                            accept=".zip"
                            onChange={handleFileChange}
                            className="w-full mb-4 border p-2 rounded"
                        />
                        <button
                            onClick={handleUpload}
                            disabled={loading || !zipFile}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded w-full"
                        >
                            {loading ? '⏳ Validating...' : '🚀 Upload & Validate'}
                        </button>
                        {errorMsg && <p className="text-red-600 mt-4">{errorMsg}</p>}
                    </>
                )}

                {validationResult && (
                    <div className="mt-6 space-y-4">
                        <h3 className="text-lg font-semibold text-green-700">✅ Validation Summary:</h3>
                        <p><strong>Total Entries:</strong> {validationResult.total}</p>
                        <p><strong>Valid Certificates:</strong> {validationResult.valid}</p>
                        <p><strong>Invalid Entries:</strong> {validationResult.invalid}</p>
                        <p><strong>Estimated Time:</strong> {Math.ceil(validationResult.estimatedTimeMs / 1000)} seconds</p>

                        <h4 className="font-medium mt-4 text-gray-700">📦 Batch Breakdown:</h4>
                        <ul className="list-disc list-inside text-sm">
                            {validationResult.breakdown.map(b => (
                                <li key={b.batch}>Batch {b.batch}: {b.count} items</li>
                            ))}
                        </ul>

                        {validationResult.invalidFiles?.length > 0 && (
                            <>
                                <h4 className="text-red-600 mt-4 font-semibold">❌ Invalid File Names:</h4>
                                <ul className="list-disc list-inside text-sm text-red-500">
                                    {validationResult.invalidFiles.map((f, i) => (
                                        <li key={i}>{f}</li>
                                    ))}
                                </ul>
                            </>
                        )}

                        <button
                            onClick={handleReset}
                            className="mt-6 w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
                        >
                            🔄 Upload Another Batch
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadBatch;
