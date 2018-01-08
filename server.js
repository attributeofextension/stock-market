//FCC Stock Market Challenge https://www.freecodecamp.org/challenges/chart-the-stock-market
const express = require("express");
var app = express();
//Conifgure Request
const request = require('request');

function makeRequestURL(symbol) {
  return "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + symbol + "&apikey=Q56R8K057PXH6KB3";
}

//ROUTES
app.use(express.static('public'));
//PORT==========================================================================
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
//WEB SOCKET
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: process.env.PORT });

//StockList Data
var stockList = [];

wss.on('connection', function connection(ws) {
  pushStockList();

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    messageRouter(JSON.parse(message));
  });

  //SOCKET MESSAGE ROUTING
  function messageRouter(data) {
    switch(data.message) {
        case 20 :
          checkStock(data.stock,success20,failure20);
          function success20() {
            pushStockList();
            pushStockListAll();
          }
          function failure20() {
            invalidStockAlert();
          }
         break;
        case 21 : 
          removeStockList(data.stock);
          pushStockList();
          pushStockListAll();
        break;
    }
  }
  //Checks to see if stock exists then makes a request to Alphavantage API
  //If Alphavantage returns a positive result, callback "SUCCESS" is executed
  //If Alphavantage returns a negative result, callback "FAILURE" is executed
  function checkStock(stock,success,failure) {
    //Check to see if stock already included,
    //if it is then send stockAlreadyAlert message and terminate
    if(stockExists(stock)) {
      stockAlreadyAlert();
      return;
    }
    //Make request
    request(makeRequestURL(stock), function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.
      if(error) {
        console.log("Error retrieving Stock Data from Alphavantage: " + error);
        return;
      }
      var jsonBody = JSON.parse(body);
      if(jsonBody["Meta Data"]){        
        addStockList(stock,jsonBody["Time Series (Daily)"]);
        success();
      } else {
        failure();
      } 
    });
    
  }
  //Checks to see whether stock is already included in globa stockList array
  //Returns true if stock exists, false if not
  function stockExists(stock) {
    var bool = false;

    for(var i = 0; i < stockList.length; i++ ){
      if(stockList[i].index == stock) {
        bool = true;
      }
    }
    return bool;
  }
  //Send a message to client "Stock already added" with message code 41
  function stockAlreadyAlert() {
    var msg = {'message': 41, 'caption':"Stock already added"};
    ws.send(JSON.stringify(msg));
  }
  //Send a message to client "Invalid stock Index" with message code 40
  function invalidStockAlert() {
    var msg = {'message': 40, 'caption':"Invalid stock index"};
  
    ws.send(JSON.stringify(msg));
  }
  //Pushes StockList to client of this connection
  function pushStockList() {
   var msg = {'message': 10,'stockList':stockList};
  
   ws.send(JSON.stringify(msg));
  }
  //Broadcast current stockList to All connected clients (except the client of this connection)
  function pushStockListAll() {
    var msg = {'message': 10,'stockList':stockList};
    
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg));
      }
    });
  }
  //Removes the stockList element that corresponds to input stock
  function removeStockList(stock) {
    var index = -1;
    for(var i = 0; i < stockList.length; i++ ) {
      if(stock == stockList[i].index) {
          index = i;
      }
    }
    if(index >= 0 ) { 
      stockList.splice(index,1);
    }
  }
  //Takes stock index name and json data and pushes to global StockList array
  function addStockList(newStock,data) {
    var index = -1;
    for(var i = 0; i < stockList.length; i++ ) {
      if(newStock == stockList[i].index) {
        index = i;
      }
    }
    if(index < 0 ) {
      stockList.push({"index":newStock,"data": data });
    } 
  }
});


