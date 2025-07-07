const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads');

module.exports = {
    createProject: (req, res) => {
        const { projectName, description, issuer, issueDate, qrX, qrY } = req.body;
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No PDF uploaded' });

        const projectId = Date.now().toString();
        const projectFolder = path.join(uploadDir, `project_${projectId}`);
        if (!fs.existsSync(projectFolder)) fs.mkdirSync(projectFolder);

        const newPdfPath = path.join(projectFolder, 'certificate.pdf');
        fs.renameSync(file.path, newPdfPath);

        const newProject = {
            id: projectId,
            projectName,
            description,
            issuer,
            issueDate,
            qrCoordinates: { x: qrX, y: qrY },
            templatePdfPath: `uploads/project_${projectId}/certificate.pdf`,
        };

        fs.writeFileSync(path.join(projectFolder, 'metadata.json'), JSON.stringify(newProject, null, 2));
        res.status(200).json({ message: 'Project created', project: newProject });
    },

    getAllProjects: (req, res) => {
        const projectFolders = fs.readdirSync(uploadDir).filter(f => f.startsWith('project_'));
        const allProjects = projectFolders.map(folder => {
            const metaPath = path.join(uploadDir, folder, 'metadata.json');
            if (fs.existsSync(metaPath)) return JSON.parse(fs.readFileSync(metaPath));
            return null;
        }).filter(Boolean);
        res.status(200).json(allProjects);
    },

    getSingleProject: (req, res) => {
        const metaPath = path.join(uploadDir, `project_${req.params.id}`, 'metadata.json');
        if (!fs.existsSync(metaPath)) return res.status(404).json({ error: 'Project not found' });
        const data = fs.readFileSync(metaPath);
        res.status(200).json(JSON.parse(data));
    },

    updateProject: (req, res) => {
        const projectPath = path.join(uploadDir, `project_${req.params.id}`);
        const metaPath = path.join(projectPath, 'metadata.json');
        if (!fs.existsSync(metaPath)) return res.status(404).json({ error: 'Project not found' });

        const project = JSON.parse(fs.readFileSync(metaPath));
        const { projectName, description, issuer, issueDate, qrX, qrY } = req.body;

        if (projectName) project.projectName = projectName;
        if (description) project.description = description;
        if (issuer) project.issuer = issuer;
        if (issueDate) project.issueDate = issueDate;
        if (qrX && qrY) project.qrCoordinates = { x: qrX, y: qrY };

        fs.writeFileSync(metaPath, JSON.stringify(project, null, 2));
        res.status(200).json({ message: 'Project updated', project });
    }
};
