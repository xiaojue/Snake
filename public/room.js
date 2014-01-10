(function(global, undef) {
	$(function() {
		var socket = io.connect('http://172.16.121.205:5566');
		//初始化房间信息
        socket.on('open',function(data){
            console.log(data.roomstatus); 
            console.log(data.id + ' is in the room'); 
        });

        socket.on('system',function(json){
            if(json.type === 'new'){
                socket.emit('status',function(data){
                    //$('#status').text(data); 
                    console.log(data);
                }); 
            }
            if(json.type === 'disconnect'){
                console.log('id '+json.data+' is out');
            }
        });
	});
})(this);

