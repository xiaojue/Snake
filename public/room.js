(function(global, undef) {
	$(function() {
		var socket = io.connect('http://172.16.121.205:5566');
		//初始化房间信息
		socket.on('status', function(data) {
			alert(data.length);
		});
		socket.emit('adduser');
	});
})(this);

