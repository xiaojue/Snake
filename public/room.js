(function(global,undef){
    var socket = io.connect('http://127.0.0.1:5566');
    socket.emit('add',{user:'xiaojue'});
})(this);
