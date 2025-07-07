const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multerConfig');
const projectController = require('../controllers/projectController');

router.post('/project', upload.single('templatePdf'), projectController.createProject);
router.get('/projects', projectController.getAllProjects);
router.get('/project/:id', projectController.getSingleProject);
router.put('/project/:id/update', projectController.updateProject);

module.exports = router;
