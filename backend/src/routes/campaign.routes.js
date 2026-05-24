const { Router } = require('express');
const authenticate = require('../middleware/auth');
const campaignService = require('../services/campaign.service');

const router = Router();
router.use(authenticate);

router.post('/', async (req, res, next) => {
  try {
    const result = await campaignService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post('/:id/activate', async (req, res, next) => {
  try {
    const result = await campaignService.activate(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const campaign = await campaignService.getById(req.params.id);
    res.json({ success: true, data: campaign });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const campaigns = await campaignService.listByUser(req.user.id);
    res.json({ success: true, data: campaigns });
  } catch (err) { next(err); }
});

module.exports = router;
