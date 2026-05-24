const { Router } = require('express');
const authenticate = require('../middleware/auth');
const personaService = require('../services/persona.service');

const router = Router();
router.use(authenticate);

router.post('/generate', async (req, res, next) => {
  try {
    const { dataset_id, k } = req.body;
    const result = await personaService.generate(dataset_id, { k });
    res.status(202).json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.get('/dataset/:datasetId', async (req, res, next) => {
  try {
    const personas = await personaService.listByDataset(req.params.datasetId);
    res.json({ success: true, data: personas });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const persona = await personaService.getById(req.params.id);
    res.json({ success: true, data: persona });
  } catch (err) { next(err); }
});

router.post('/match', async (req, res, next) => {
  try {
    const result = await personaService.matchBrand(req.body.brand_context);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

module.exports = router;
