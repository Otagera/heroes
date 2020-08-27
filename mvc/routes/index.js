const express = require('express');
const router = express.Router();

const indexCtrl = require('../controllers/index');

/* GET home page. */
router.get('/', indexCtrl.getIndex);
router.get('/heroes', indexCtrl.getHeroesIndex);
router.get('/create-hero', indexCtrl.getHeroesForm);
router.post('/create-hero', indexCtrl.createNewHero);
router.post('/delete-hero/:heroid', indexCtrl.deleteHero);
router.get('/update-hero/:heroid', indexCtrl.getUpdateForm);
router.post('/update-hero/:heroid', indexCtrl.updateHero);
router.get('/reset/:specialKey', indexCtrl.reset);

module.exports = router;
