var express = require('express');
var port = 5566;
var app = express();

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

app.get('/handle',function(req,res,next){
    res.render('handle');
});

app.listen(port);

console.log('view 127.0.0.1:' + port);

