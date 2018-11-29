var express = require('express');
var app = express();
const router = express.Router();

router.get('/', function (req, res) {
   res.render('index.html', {
      title: 'DynamicRhythm'
   })
});

module.exports = app;