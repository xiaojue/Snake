(function(global, undef) {
	$(function() {
        var socket = io.connect('http://127.0.0.1:5566');
		//初始化房间信息
		socket.on('status', function(data) {
			alert(data.length);
		});
		socket.emit('adduser');
	});
})(this);

