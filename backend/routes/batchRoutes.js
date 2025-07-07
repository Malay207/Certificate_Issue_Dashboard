const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multerConfig');
const {
    uploadBatch,
    issueBatch,
    getBatchStatus,
    retryCertificate,
    downloadZip,
    listBatches,
} = require('../controllers/batchController');

router.post('/upload-batch', upload.single('batchZip'), uploadBatch);
router.post('/issue/:batchId', issueBatch);
router.get('/batch/:batchId/status', getBatchStatus);
router.post('/retry/:batchId/:certId', retryCertificate);
router.get('/download/:batchId', downloadZip);
router.get('/batch-list', listBatches);

module.exports = router;
