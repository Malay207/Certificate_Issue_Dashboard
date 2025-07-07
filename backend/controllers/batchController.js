const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const XLSX = require('xlsx');
const archiver = require('archiver');

const BATCH_LIMIT = 250;
const batchesDir = path.join(__dirname, '..', 'uploads', 'batches');

let io;
function setSocketIO(socket) {
    io = socket;
}

// Ensure batches directory exists
if (!fs.existsSync(batchesDir)) {
    fs.mkdirSync(batchesDir, { recursive: true });
}

// ----------------------
// Controller Functions
// ----------------------

async function uploadBatch(req, res) {
    try {
        if (!req.file) return res.status(400).json({ error: 'No ZIP uploaded' });

        const batchId = Date.now().toString();
        const batchDir = path.join(batchesDir, `batch_${batchId}`);
        const extractedDir = path.join(batchDir, 'extracted');
        fs.mkdirSync(batchDir);
        fs.mkdirSync(extractedDir);

        const zipPath = path.join(batchDir, 'original.zip');
        fs.renameSync(req.file.path, zipPath);

        fs.createReadStream(zipPath)
            .pipe(unzipper.Extract({ path: extractedDir }))
            .on('close', () => {
                const files = fs.readdirSync(extractedDir);
                const excel = files.find(f => f.endsWith('.xlsx') || f.endsWith('.xls'));
                if (!excel) return res.status(400).json({ error: 'Excel file not found' });

                const workbook = XLSX.readFile(path.join(extractedDir, excel));
                const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                const pdfs = files.filter(f => f.endsWith('.pdf'));
                const filenames = rows.map(r => String(r.FileName || r.filename || r.file).trim());

                const valid = filenames.filter(f => pdfs.includes(f));
                const invalid = filenames.filter(f => !pdfs.includes(f));

                if (filenames.length > BATCH_LIMIT) {
                    return res.status(400).json({ error: `Limit ${BATCH_LIMIT} exceeded`, total: filenames.length });
                }

                const breakdown = [];
                for (let i = 0; i < filenames.length; i += 50) {
                    breakdown.push(filenames.slice(i, i + 50));
                }

                res.json({
                    batchId,
                    total: filenames.length,
                    valid: valid.length,
                    invalid: invalid.length,
                    invalidFiles: invalid,
                    estimatedTimeMs: filenames.length * 300,
                    breakdown: breakdown.map((b, i) => ({ batch: i + 1, count: b.length })),
                    message: 'Validation complete',
                });
            });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Upload failed.' });
    }
}

function issueBatch(req, res) {
    const batchId = req.params.batchId;
    const batchDir = path.join(batchesDir, `batch_${batchId}`);
    const extractedDir = path.join(batchDir, 'extracted');
    const statusDir = path.join(batchDir, 'status');
    if (!fs.existsSync(statusDir)) fs.mkdirSync(statusDir);

    const excel = fs.readdirSync(extractedDir).find(f => f.endsWith('.xlsx') || f.endsWith('.xls'));
    if (!excel) return res.status(400).json({ error: 'Excel not found' });

    fs.writeFileSync(path.join(batchDir, 'started.json'), JSON.stringify({ started: true }));

    const workbook = XLSX.readFile(path.join(extractedDir, excel));
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    const certs = rows.map(r => ({
        id: String(r.ID || r.Id || r.id).trim(),
        file: String(r.FileName || r.filename || r.file).trim(),
        status: 'pending',
    }));
    console.log(certs)
    console.log(`🟡 Starting issuance for batch ${batchId}`);
    let completed = 0;
    certs.forEach((cert, i) => {
        console.log(`⏳ Scheduling issuance for cert ${cert.id}`);

        setTimeout(() => {
            cert.status = 'issued';

            const certStatusPath = path.join(statusDir, `${cert.id}.json`);
            fs.writeFileSync(certStatusPath, JSON.stringify({ status: 'issued' }, null, 2));
            console.log(`✅ Issued certificate ${cert.id}`);

            io.emit('statusUpdate', { batchId, cert });

            completed += 1;
            if (completed === certs.length) {
                console.log(`🎉 All certificates issued for batch ${batchId}`);
                io.emit('batchComplete', { batchId });
                generateIssuedZip(batchId, certs, extractedDir);
            }
        }, (i + 1) * 1000);
    });

    res.status(200).json({ message: 'Issuance started', batchId });
}

function getBatchStatus(req, res) {
    const batchId = req.params.batchId;
    const batchDir = path.join(batchesDir, `batch_${batchId}`);
    const extractedDir = path.join(batchDir, 'extracted');
    const statusDir = path.join(batchDir, 'status');
    const started = fs.existsSync(path.join(batchDir, 'started.json'));

    const files = fs.readdirSync(extractedDir);
    const excel = files.find(f => f.endsWith('.xlsx') || f.endsWith('.xls'));

    if (!excel) {
        return res.status(400).json({ error: 'No Excel file found' });
    }

    const workbook = XLSX.readFile(path.join(extractedDir, excel));
    const sheetName = workbook.SheetNames[0]; // dynamic
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log("Sheet used:", sheetName);
    console.log("Excel Rows from batch:", rows);

    const certs = rows.map(r => {
        const id = String(r.ID || r.Id || r.id || '').trim();
        const file = String(r.FileName || r.filename || r.file || '').trim();
        let status = 'pending';
        const statusFile = path.join(statusDir, `${id}.json`);
        if (fs.existsSync(statusFile)) {
            status = JSON.parse(fs.readFileSync(statusFile)).status || 'pending';
        }
        return { id, file, status };
    });

    const allIssued = certs.every(c => c.status === 'issued');
    const batchStatus = !started ? 'pending' : allIssued ? 'completed' : 'in_progress';

    res.status(200).json({ batchId, status: batchStatus, certificates: certs });
}

function retryCertificate(req, res) {
    const { batchId, certId } = req.params;
    const batchDir = path.join(batchesDir, `batch_${batchId}`);
    const extractedDir = path.join(batchDir, 'extracted');
    const statusDir = path.join(batchsDir, 'status');
    const statusPath = path.join(statusDir, `${certId}.json`);

    const excel = fs.readdirSync(extractedDir).find(f => f.endsWith('.xlsx') || f.endsWith('.xls'));
    const rows = XLSX.utils.sheet_to_json(XLSX.readFile(path.join(extractedDir, excel)).Sheets['Sheet1']);
    const cert = rows.find(r => String(r.ID || r.id || r.Id).trim() === certId);

    if (!cert) return res.status(404).json({ error: 'Certificate not found in Excel' });

    const certData = {
        id: certId,
        file: String(cert.FileName || cert.filename || cert.file).trim(),
        status: 'in_progress',
    };

    io.emit('statusUpdate', { batchId, cert: certData });

    setTimeout(() => {
        certData.status = 'issued';
        fs.writeFileSync(statusPath, JSON.stringify({ status: 'issued' }));
        io.emit('statusUpdate', { batchId, cert: certData });

        const statuses = rows.map(r => {
            const id = String(r.ID || r.id || r.Id).trim();
            const file = String(r.FileName || r.filename || r.file).trim();
            const f = path.join(statusDir, `${id}.json`);
            const s = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f)).status : 'pending';
            return s;
        });

        if (statuses.every(s => s === 'issued')) {
            io.emit('batchComplete', { batchId });
            generateIssuedZip(batchId, rows, extractedDir);
        }
    }, 2000);

    res.json({ message: 'Retry started', cert: certData });
}

function downloadZip(req, res) {
    const filePath = path.join(batchesDir, `batch_${req.params.batchId}`, 'issued.zip');
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'ZIP not ready' });
    res.download(filePath);
}

function listBatches(req, res) {
    const batchFolders = fs.readdirSync(batchesDir).filter(f => f.startsWith('batch_'));
    const list = batchFolders.map(name => {
        const extractPath = path.join(batchesDir, name, 'extracted');
        const files = fs.existsSync(extractPath) ? fs.readdirSync(extractPath) : [];
        return {
            id: name.replace('batch_', ''),
            files: files.length,
            time: new Date(parseInt(name.split('_')[1])).toLocaleString(),
        };
    });
    res.status(200).json(list);
}

function generateIssuedZip(batchId, certs, folder) {
    const outputPath = path.join(batchesDir, batchId, 'issued.zip');
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);

    certs.forEach(cert => {
        const certPath = path.join(folder, cert.fileName);
        if (fs.existsSync(certPath)) {
            archive.file(certPath, { name: cert.fileName });
        }
    });

    archive.finalize();
}

// ----------------------
// Exports
// ----------------------

module.exports = {
    uploadBatch,
    issueBatch,
    getBatchStatus,
    retryCertificate,
    downloadZip,
    listBatches,
    generateIssuedZip,
    setSocketIO
};
