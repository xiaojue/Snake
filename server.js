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

function objtoarr(obj) {
	var ret = [];
	for (var i in obj) {
		ret.push(obj[i]);
	}
	return ret;
}

var roomstatus = {};
var gamestatus = false;
var roommax = 5;

//游戏房间逻辑部分
io.sockets.on('connection', function(socket) {

	var id = new Date().valueOf();

	roomstatus[id] = {
		id: id,
		isready: false
	};
    /*
    if(objtoarr(roomstatus).length > roommax){
        socket.emit('');
        return;
    }
    */

	socket.emit('open', {
		id: id,
		roomstatus: roomstatus,
		status: gamestatus
	});

    socket.on('gameover',function(){
        socket.broadcast.emit('system',{type:'reload'}); 
    });

    socket.on('died',function(id){
        delete roomstatus[id];
    });

	socket.broadcast.emit('system', {
		type: 'new',
        data:roomstatus
	});

    socket.on('reopen',function(){
        socket.broadcast.emit('system',{type:'reopen'}); 
    });

	socket.on('serverinit', function(serverid) {
		//delete roomstatus[serverid];
        roomstatus = {};
	});

	socket.on('status', function(fn) {
		fn(roomstatus);
	});

	socket.on('isready', function(id) {
		roomstatus[id].isready = true;
		var allready = true;
		for (var i in roomstatus) {
			if (!roomstatus[i].isready) {
				allready = false;
				break;
			}
		}
		if (allready) socket.broadcast.emit('system', {
			type: 'allready'
		});
	});

	socket.on('start', function(data) {

	});
	socket.on('stop', function(data) {

	});

	socket.on('top', function() {
		socket.broadcast.emit('system', {
			type: 'top',
			data: roomstatus[id]
		});
	});
	socket.on('right', function() {
		socket.broadcast.emit('system', {
			type: 'right',
			data: roomstatus[id]
		});
	});
	socket.on('down', function() {
		socket.broadcast.emit('system', {
			type: 'down',
			data: roomstatus[id]
		});
	});
	socket.on('left', function() {
		socket.broadcast.emit('system', {
			type: 'left',
			data: roomstatus[id]
		});
	});
	socket.on('disconnect', function() {
		delete roomstatus[id];
		socket.broadcast.emit('system', {
			type: 'disconnect',
			data: {
                id:id,
                roomstatus:roomstatus
            }
		});
	});
    socket.on('offline',function(){
		delete roomstatus[id];
		socket.broadcast.emit('system', {
			type: 'disconnect',
			data: {
                id:id,
                roomstatus:roomstatus
            }
		});
    });
});

server.listen(port);

console.log('view 127.0.0.1:' + port);

