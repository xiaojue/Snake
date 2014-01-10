(function(global,undef){
    var socket = io.connect('http://172.16.121.205:5566');
    socket.emit('add',{user:'xiaojue'});
})(this);
