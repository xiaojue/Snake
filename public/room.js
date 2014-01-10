(function(global, undef) {
	$(function() {
		window.snake = new Snake;
		snake.config({
			containerId: 'hehe'
		});

		snake.init();

		var socket = io.connect('http://172.16.121.205:5566');
		//初始化房间信息
		socket.on('open', function(data) {
			console.log(data.roomstatus);
			console.log(data.id + ' is in the room');
		});

		socket.on('system', function(json) {
			if (json.type === 'new') {
				socket.emit('status', function(data) {
					//$('#status').text(data); 
					var users = [];
					for (var i in data) {
						users.push({
							mame: i
						});
					}
					snake.addPlayers(users);
				});
			}
			if (json.type === 'disconnect') {
				console.log('id ' + json.data + ' is out');
			}
			if (json.type == 'top') {
				snake.setDirection(snake.players[json.id], 'up');
			}
			if (json.type == 'right') {
				snake.setDirection(snake.players[json.id], 'right');
			}
			if (json.type == 'down') {
				snake.setDirection(snake.players[json.id], 'down');
			}
			if (json.type == 'left') {
				snake.setDirection(snake.players[json.id], 'left');
			}
		});
	});
})(this);

