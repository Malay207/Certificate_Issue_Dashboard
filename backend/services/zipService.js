const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

function generateIssuedZip(batchId, certs, folder) {
    const outPath = path.join('uploads', 'batches', `batch_${batchId}`, 'issued.zip');
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip');
    archive.pipe(output);

    certs.forEach(cert => {
        const filePath = path.join(folder, cert.file);
        if (fs.existsSync(filePath)) {
            archive.file(filePath, { name: cert.file });
        }
    });

    archive.finalize();
}

module.exports = { generateIssuedZip };
