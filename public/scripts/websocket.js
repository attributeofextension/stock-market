var socket;  //Variable for socket; initialized in DOMContentLoaded event (to make connection)

//Processes data from stock and returns an array compatible with High Charts Series format
function processStockData(stock) {
  stockData = [];
  stockKeys = [];

  stockKeys = Object.keys(stock);
  for(var i = 0; i < stockKeys.length; i++) {
    var day = [];
    var date = new Date(stockKeys[i]);
 //   var prices = stock[stockKeys[i]];
    if(stock[stockKeys[i]]) {
      day.push(date.getTime());
      day.push(Number(stock[stockKeys[i]]["4. close"]));
      stockData.push(day);
    }
  }

  return stockData.sort( function(a,b) {
    return a[0] - b[0];
  });
}
//Makes the "HighStock" chart according to stocks (stockList)
function makeChart(stocks) {
  var chartData = [];
  
  for(var i = 0; i < stocks.length; i++) {
    chartData.push( {
      name: stocks[i].index,
      data: processStockData(stocks[i].data),
      tooltip: {
        valueDecimals: 2
      }
    });
  }
  Highcharts.stockChart('container', {
  
    rangeSelector: {
        selected: 1
      },

     title: {
        text: 'Daily Close Price'
     },
    
    series: chartData
  });
}
//Clears stockList (for before a new update)
function clearStockList() {
  var ul = document.getElementById("stockList");
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }

}
//Updates the interface according to stockList
//Should be a panel for each stock with a close button
function updateStockList(stockList) {
  var row = document.getElementById("stockList");

  for(var i = 0; i < stockList.length; i++ ) {
    var col = document.createElement("div");
    col.setAttribute("class","col-md-2");
    row.appendChild(col);

    var panel = document.createElement("div");
    panel.setAttribute("class","panel panel-default");
    col.appendChild(panel);

    var panelBody = document.createElement("div");
    panelBody.setAttribute("class","panel-body");
    panel.appendChild(panelBody);
    panelBody.textContent = stockList[i].index;
    
    var btn = document.createElement("button");
    btn.setAttribute("type","button");
    btn.setAttribute("class","close");
    btn.setAttribute("aria-label","Close");
    btn.setAttribute("value",stockList[i].index);
    panelBody.appendChild(btn);

    var span = document.createElement("span");
    span.setAttribute("aria-hidden","true");
    span.innerHTML = "&times;";

    btn.appendChild(span);
    
    btn.addEventListener("click",closeBtnHandler);
    console.log(btn.value);
  }


}
//Routes all messages received from server
function messageRouter(data) {
  switch(data.message) {
    case 10: 
      clearStockList();  
      updateStockList(data.stockList);
      makeChart(data.stockList);
      break;
  
    case 40:
      inputAlert(data.caption);
      break;
    case 41:
      inputAlert(data.caption);
      break;
  }
}
//EVENT HANDLERS================================================================================
//Handles some incoming messaage events that pertain to errors
function inputAlert(caption) {
  console.log(caption);
  var alert = document.getElementById("alert");
  alert.classList.remove("invisible");
  var alertCaption = document.getElementById("alertCaption");
  alertCaption.textContent = caption;
}
//Handles addBtn click event
function addBtnHandler(event) {
  document.getElementById("alert").classList.add("invisible");
  
  var stockInput = document.getElementById("stockInput");
  if(stockInput.checkValidity()) {
    var message = {"message":20,"stock":stockInput.value.toUpperCase()};
    socket.send(JSON.stringify(message));
  } else {
    document.getElementById("alert").textContent = "Input must be all Upper Case and 5 characters maximum";
    document.getElementById("alert").classList.remove("invisible");
  }
}
//Handles closeBtn click event
function closeBtnHandler(event) {
  document.getElementById("alert").classList.add("invisible");
  var message = {"message":21,"stock":event.target.parentElement.value};

  socket.send(JSON.stringify(message));
}
//MAIN FUNCTION=================================================================================
function loaded(event) {
  var HOST = location.origin.replace(/^http/, 'ws');
  socket = new WebSocket(HOST);

  socket.addEventListener('open', function (event) {

  });

  socket.addEventListener('message', function (event) {
   // console.log('Message from server ', event.data);
    messageRouter(JSON.parse(event.data));
  });
  
  window.onbeforeunload = function() {
    socket.close();
  };

  var addBtn = document.getElementById("addBtn");
  addBtn.addEventListener("click",addBtnHandler);

}


$("document").ready(loaded);
