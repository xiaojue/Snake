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

var roomstatus = {};
var x=10;y=10;

//游戏房间逻辑部分
io.sockets.on('connection', function(socket) {

    var id = new Date().valueOf();
    x++;
    y++;

    roomstatus[id] = {
        id:id,
        head:[x,y]
    };

    socket.emit('open',{
        id:id,
        roomstatus:roomstatus
    });

    socket.broadcast.emit('system',{
        type:'new'
    });

    socket.on('status',function(fn){
        fn(roomstatus); 
    });

	socket.on('start', function(data) {

	});
	socket.on('stop', function(data) {

	});

	socket.on('top', function() {
        socket.broadcast.emit('system',{
            type:'top',
            data:roomstatus[id]
        });
	});
	socket.on('right', function() {
        socket.broadcast.emit('system',{
            type:'right',
            data:roomstatus[id]
        });
    });
	socket.on('down', function() {
        socket.broadcast.emit('system',{
            type:'down',
            data:roomstatus[id]
        });
    });
	socket.on('left', function() {
        socket.broadcast.emit('system',{
            type:'left',
            id:id 
        });
    });
    socket.on('disconnect', function() {
        delete roomstatus[id];
        socket.broadcast.emit('system',{
            type:'disconnect',
            data:id
        });
    });
});



server.listen(port);

console.log('view 127.0.0.1:' + port);

