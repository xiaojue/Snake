(function(global, undef) {
	$(function() {
		window.snake = new Snake;
		snake.config({
			containerId: 'hehe'
		});
        var serverid;

		snake.init();

		var socket = io.connect('http://172.16.121.168:5566');
		//初始化房间信息
		socket.on('open', function(data) {
			console.log(data.roomstatus);
			console.log(data.id + ' is in the room');
            serverid = data.id;
		});

		socket.on('system', function(json) {
			if (json.type === 'new') {
				socket.emit('status', function(data) {
                    delete data[serverid];
					var users = [];
					for (var i in data) {
                        var user = data[i];
                        console.log(data)
                        console.log(user.head);
						users.push({
							name: user.id,
							head: user.head
						});
					}
					snake.addPlayers(users);
				});
			}
			if (json.type === 'disconnect') {
				console.log('id ' + json.data + ' is out');
			}
			if (json.type == 'top') {
				snake.setDirection(snake.players[json.data.id].snake, 'up');
			}
			if (json.type == 'right') {
				snake.setDirection(snake.players[json.data.id].snake, 'right');
			}
			if (json.type == 'down') {
				snake.setDirection(snake.players[json.data.id].snake, 'down');
			}
			if (json.type == 'left') {
				snake.setDirection(snake.players[json.data.id].snake, 'left');
			}
		});
	});
})(this);

