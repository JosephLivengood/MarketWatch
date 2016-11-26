var express     =       require('express');
var app         =       express();
var server      =       require('http').Server(app);
var io          =       require('socket.io')(server);
var PORT        =       process.env.PORT || 8080;
var path        =       process.cwd();

/*Rendered pug while in dev*/
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

/*All routes lead to our app*/
app.get('*', function(req, res) {
    res.render(path + '/public/pug/index');
});

/*Server start*/
server.listen(PORT, function() {
    console.log("App listening on port " + PORT);
});

/*Storage for server session, Also init array since our servo will sleep often*/
var stocks = ['AAPL','GOOG'];

/*Socket.io events
*   createStock(data)- add a stock to the 'global' array
*   deleteStock(data)- delete a stock from the 'global' array
*   stockUpdate(data)- broadcasts the entire array of stocks
*/
io.on('connection', function (socket) {
    
    /*Update new users with current stock watchlist*/
    socket.emit('stockUpdate', {stocks: stocks});
    
    socket.on('deleteStock', function (data) {
        if (stocks.indexOf(data.stock) > -1) {
            stocks.splice(stocks.indexOf(data.stock), 1);
            io.sockets.emit('stockUpdate', {stocks: stocks});
        }
    });
    
    socket.on('createStock', function (data) {
        if (data.stock) {
            stocks.push(data.stock);
            io.sockets.emit('stockUpdate', {stocks: stocks}); //socket.broadcast.emit
        }
    });
  
});
