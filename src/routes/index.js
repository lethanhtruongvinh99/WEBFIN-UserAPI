var express = require('express');
var router = express.Router();
const {findAccountByUsername} = require('../controllers/accounts.controller'); 

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/someroute', async (req, res) => {
  const resAccount = await findAccountByUsername('newaccount2');
  res.json(resAccount);
})

module.exports = router;