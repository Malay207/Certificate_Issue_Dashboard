import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const VerifyCertificate = () => {
  const [params] = useSearchParams();
  const certId = params.get('id');

  const [cert, setCert] = useState(null);
  const [pdfPath, setPdfPath] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:5000/batch-list`)
      .then(res => {
        const allBatchIds = res.data.map(b => b.id);

        const tryFetch = async () => {
          for (const batchId of allBatchIds) {
            const { data } = await axios.get(`http://localhost:5000/batch/${batchId}/status`);
            const match = data.certificates.find(c => c.id === certId && c.status === 'issued');
            if (match) {
              setCert(match);
              setPdfPath(`http://localhost:5000/uploads/batches/batch_${batchId}/extracted/${match.file}`);
              setLoading(false);
              return;
            }
          }
          setNotFound(true);
          setLoading(false);
        };

        tryFetch();
      })
      .catch(err => {
        console.error(err);
        setNotFound(true);
        setLoading(false);
      });
  }, [certId]);

  if (loading) return <div className="p-10 text-center">🔄 Verifying certificate...</div>;

  if (notFound)
    return (
      <div className="p-10 text-center text-red-600">
        ❌ Certificate ID <code>{certId}</code> not found or not yet issued.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-green-700">
          ✅ Certificate Verified
        </h1>

        <p className="text-center text-gray-700 mb-6">
          Certificate ID: <code>{cert.id}</code><br />
          File: <strong>{cert.file}</strong>
        </p>

        <div className="border rounded shadow overflow-hidden">
          <Document file={pdfPath}>
            <Page pageNumber={1} width={600} />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
