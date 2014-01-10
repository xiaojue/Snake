(function() {
    var extend = function ( t, s, b ) {
        if (s) {
            for ( var k in s ) {
                if (!b || !t.hasOwnProperty(k)) {
                    t[k] = s[k];
                }
            }
        }
        return t;
    };

    var randomArray = function(array,source){
        if(array.length == 0) {
            return null;
        }
        var key =  parseInt(Math.random()*array.length);
        var res = array[key];
        if(source) {
            if(!source[res]) {
                var cloneArr = array.concat([]);
                cloneArr.splice(key,1);
                return randomArray(cloneArr,source);
            } else {
                return res;
            }
        } else {
            return res;
        }
    }
    var Snake = function(cfg){
        var _default = {
            columns : 15,
            rows : 15,
            unitLength : 10,
            containerId : '',
            defCss : 'snake',
            activeCssList : ['a','b','c'],
            allowBack : false,
            speed : 800,
            score : 1, //每吃一个食物所加的分数,
            range : 3 //出现特殊食物的机率
        };

        this.config = function(cfg){
            if(cfg) {
                extend(_default,cfg);
            }
            return  _default;
        }
    }

    Snake.prototype = {
        __fill : {}, //记录所有块。

        __map : {}, //此处记录块有没有被占用

        __keyMap : [],

        __foodPlugins : [],

        __timer  : null,
       
        players : {},

        alives : 0,

        setKey :  function(l,t){
            return l + '_' + t;
        },
        draw : function(){
            var cfg = this.config();
            var container = document.getElementById(cfg.containerId);
            
            if(!container) {
                return;
            }

            for(var i = 1; i <= cfg.columns; i ++) {
                for(var j = 1; j <= cfg.rows ; j++) {
                    var key = this.setKey(i,j);
                    var span = document.createElement('span');
                    span.className = cfg.defCss;
                    span.style.display = 'inline-block';
                    span.style.width = cfg.unitLength + 'px';
                    span.style.height = cfg.unitLength + 'px';
                    span.style.position = 'absolute';
                    span.style.left =  i*cfg.unitLength +'px'
                    span.style.top =  j*cfg.unitLength +'px'

                    this.__fill[key] = span;
                    this.__map[key] = 1;
                    this.__keyMap.push(key);
                    container.appendChild(span);
                }
            }
        },

        createBlock : function(l,t,c){
            var cfg = this.config();
            var key = this.setKey(l,t);
            if(!key) {
                return null;
            }
            this.__fill[key].className = c;
            this.__fill[key]._offset = {left : l, top :t};
            this.__map[key] = 0; 
            return this.__fill[key];
        },

        deleteBlock : function(l,t) {
            var cfg = this.config();
            var key = this.setKey(l,t);
            this.__fill[key].className = cfg.defCss;
            this.__map[key] = 1;
        },

        randomBlock : function(c){
            var key = randomArray(this.__keyMap,this.__map);
            if(key) {
                var _key = key.split('_'); 
                return this.createBlock(_key[0],_key[1],c);
            }
            return null
        },
        
        regFood : function(o){
            this.__foodPlugins.push(o);
        },
        
        regBaseFood : function(){
            var cfg = this.config();
            this.__foodPlugins.unshift({
                fp : 0,
                effect : function(player,snake){
                    console.info("hehe");
                },
                score : cfg.score
            });
        },
        
        createFood : function(c){
            var cfg = this.config();
            var fBody = this.randomBlock(c);
            var range = Math.ceil(Math.random()*10)
            if(range <= cfg.range && this.__foodPlugins.length >1) {
                var _food = this.__foodPlugins.concat([]);
                _food.shift();
                fBody.plugin = randomArray(_food);
            } else {
                fBody.plugin = this.__foodPlugins[0];
            }
            window.fbody =fBody;
            return fBody;
        },
        eatFood : function(player,snake,food){
            var cfg = this.config(); 
        },
        createSnake : function(length,head,direction,c){
            var snakeBody = [];
            switch(direction) {
                case 'up' : 
                    while(length --) {
                        snakeBody.push(this.createBlock(head[0],head[1] - length));
                    }
                break;
                
                case 'down' : 
                    while(length --) {
                        snakeBody.push(this.createBlock(head[0],head[1] + length));
                    }
                break;

                case 'left' : 
                    while(length --) {
                        snakeBody.push(this.createBlock(head[0] - length,head[1]));
                    }
                break;

                case 'right' : 
                    while(length --) {
                        snakeBody.push(this.createBlock(head[0] + length,head[1]));
                    }
                break;
            }
            return snakeBody;
        }, 

        addPlayers : function(players){
            var _player = {
                length : 2, //初始长度
                head : [8,14], //初始坐标
                direction : 'left',//初始方向
                name : 'user1', //玩家名称
                scores : 0, //初始分数
                cssName : '', //初始样式
                baseScore : 1
            };
            var cfg = this.config();
            var players = players || [{}];
            for(var p=0; p<players.length; p++){
                var item = extend(_player,players[p]);
                if(!this.players[item.name]) {
                    this.players[item.name] = {
                        snake : {
                            body : this.createSnake(item.length,item.head,item.direction,item.cssName),
                            speed : cfg.speed,
                            status : 'alive',
                            direction : item.direction
                        },
                        name : item.name,
                        scores : item.scores,
                        baseScore : item.baseScore //分数倍数
                    };
                    this.alives ++;
                }
            }
        },

        removePlayers : function(playerName){
            this.players[playerName].snake.status = 'died';
            this.alives --
        },

        __fastInit : function(){ //测试用
            this.draw() //画布
            var cfg = this.config();
            this.regBaseFood();
            this.addPlayers();//增加玩家
            this.createFood();
        },

        snakeMove : function(){
            var cfg = this.config();
            for(var i in this.players) {
                var player = this.players[i];
                if(player.snake.status == 'alive') {
                    var snake = player.snake.body;
                    var disBlock = snake.pop()
                    var nextHead;
                    this.deleteBlock( disBlock._offset.left,disBlock._offset.top);
                    if(player.snake._direction) {
                        player.snake.direction = player.snake._direction;
                        player.snake._direction = null;
                    }
                    switch(player.snake.direction) {
                        case 'up' : 
                            nextHead = this.createBlock(snake[0]._offset.left,snake[0]._offset.top - 1);
                            snake.unshift(nextHead, snake.cssName);
                        break;
                        case 'down' : 
                            snake.unshift(this.createBlock(snake[0]._offset.left,snake[0]._offset.top + 1, snake.cssName));
                        break;
                        case 'left' : 
                            snake.unshift(this.createBlock(snake[0]._offset.left - 1,snake[0]._offset.top, snake.cssName));
                        break;
                        case 'right' : 
                            snake.unshift(this.createBlock(snake[0]._offset.left + 1,snake[0]._offset.top, snake.cssName));
                        break;
                    }

                }
            }
        },

        //运动相关
        go : function(){
            var _t =this;
            var cfg = _t.config();
            _t.__timer = setInterval(function(){
                _t.snakeMove(); 
            },cfg.speed);
        },
        pause : function () {
            clearInterval(this.__timer);
        },
        setDirection : function(snake,direction) { //设置移动方向
            var cfg  = this.config();
            var oldD = snake.direction, newD = direction;
            var rule = {
                'up' : 1,
                'left' : 2,
                'down' : 3,
                'right' : 4
            };

            if(!rule[newD]) {
                return false;
            }
            if(!cfg.allowBack && Math.abs(rule[oldD] - rule[newD]) == 2) {//不能直接向后转弯
                return false 
            }
            snake._direction = direction;
            return true;
        }
    }

    window.Snake = Snake;
} ());

