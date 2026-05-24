const { Router } = require('express');
const multer = require('multer');
const authenticate = require('../middleware/auth');
const datasetService = require('../services/dataset.service');

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.use(authenticate);

router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const result = await datasetService.upload(req.file, req.user.id);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.get('/:id/status', async (req, res, next) => {
  try {
    const status = await datasetService.getStatus(req.params.id);
    res.json({ success: true, data: status });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const datasets = await datasetService.listByUser(req.user.id);
    res.json({ success: true, data: datasets });
  } catch (err) { next(err); }
});

module.exports = router;
