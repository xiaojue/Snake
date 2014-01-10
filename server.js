var express = require('express');
var port = 5566;
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.use(express['static']('public'));
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/view');
app.set('view engine', 'html');

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.cookieSession({
	secret: 'snake secret'
}));
app.use(express.methodOverride());

app.get('/', function(req, res, next) {
	res.render('snake');
});

app.get('/rank', function(req, res, next) {
	res.render('rank');
});

app.get('/handle', function(req, res, next) {
	res.render('handle');
});

io.sockets.on('connection', function(socket) {
	socket.on('add', function(data) {
		console.log(data);
	});
	socket.on('start', function(data) {

	});
	socket.on('stop', function(data) {

	});
	socket.on('top', function() {

	});
	socket.on('right', function() {});
	socket.on('down', function() {});
	socket.on('left', function() {});
});

server.listen(port);

console.log('view 127.0.0.1:' + port);
