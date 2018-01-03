//FCC Stock Market Challenge https://www.freecodecamp.org/challenges/chart-the-stock-market
const express = require("express");
var app = express();

app.use(express.static('public'));

//PORT==========================================================================
var listener = app.listen(80, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
