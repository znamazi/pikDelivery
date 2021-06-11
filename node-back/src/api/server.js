const { Router } = require('express');
let router = Router();

router.get('/status', function (req, res, next) {
  res.json({
    success: true,
    status: 'online'
  });
});

router.get('/time', function (req, res, next) {
  let {t} = req.query;
  res.json({
    success: true,
    timestamp: Date.now(),
    deltaTime: !!t ? (Date.now() - t)/1000 : undefined
  });
});

module.exports = router;
