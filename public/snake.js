(function() {
    extend = function ( t, s, b ) {
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
            columns : 25,
            rows : 25,
            unitLength : 20,
            containerId : '',
            defCss : 'snake',
            //activeCssList : ['a','b','c'],
            allowBack : false,
            speed : 400,
            score : 5, //每吃一个食物所加的分数,
            range : 35, //出现特殊食物的机率
            maxUsers : 5
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

        __isDied : {},

        __foodPlugins : [],
        
        __hasPlugin : {}, 

        __timer  : null,

        __foodNums : 0,

        __events : {},

        players : {},

        playerIds : [],

        playerScores : {},

        alives : 0,

        setKey :  function(l,t){
            return l + '_' + t;
        },
        reset : function(){
            extend(this,{
                __fill : {}, //记录所有块。

                __map : {}, //此处记录块有没有被占用

                __keyMap : [],

                __isDied : {},

                __foodPlugins : [],
                
                __hasPlugin : {}, 

                __timer  : null,

                __foodNums : 0,

                __events : {},

                players : {},

                playerIds : [],

                playerScores : {},

                alives : 0,
            });
        },

        draw : function(){
            var cfg = this.config();
            var container = document.getElementById(cfg.containerId);
            if(!container) {
                return;
            }
            container.innerHTML = '';
            for(var j = 1; j <= cfg.rows; j ++) {
                for(var i = 1; i <= cfg.columns ; i++) {
                    var key = this.setKey(i,j);
                    var span = document.createElement('span');
                    span.className = cfg.defCss;
                    span.style.display = 'inline-block';
                    span.style.width = cfg.unitLength + 'px';
                    span.style.height = cfg.unitLength + 'px';
                    
                    this.__fill[key] = span;
                    this.__fill[key]._offset = {left : i, top :j};
                    this.__map[key] = 1;
                    this.__keyMap.push(key);
                    container.appendChild(span);
                }
            }
            container.style.width = cfg.unitLength * cfg.columns + 'px'
            container.style.height = cfg.unitLength * cfg.rows + 'px'
        },

        createBlock : function(l,t,c){
            var cfg = this.config();
            var key = this.setKey(l,t);
            if(!this.__fill[key]) {
                this.__isDied[key] = true;
                return;
            }
            this.__fill[key].className = c || '';
            this.__map[key] = 0;
            this.__isDied[key] = true;
            return this.__fill[key];
        },

        deleteBlock : function(l,t) {
            var cfg = this.config();
            var key = this.setKey(l,t);
            if(!this.__fill[key]) {
                return;
            }
            this.__fill[key].className = cfg.defCss;
            this.__fill[key].plugin = null;
            this.__map[key] = 1;
            this.__isDied[key] = false;
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
            if( !this.__hasPlugin[o.name]) {
                this.__foodPlugins.push(o);
                this.__hasPlugin[o.name] = o;
            }
        },
        
        regBaseFood : function(json){
            var cfg = this.config();
            var _json = extend({
                name : 'baseFood',
                fp : 0,
                disFp : -1,//多少回合后消失
                effect : function(player,snake,food){
                    var l = food._offset.left,t = food._offset.top;
                    var key = this.setKey(l,t);
                    var block = this.createBlock(l,t,snake.cssName);
                    snake.body.unshift(block);
                    return true;
                },
                score : cfg.score,
                cssName : 'b',
                info : '基本的食物,＋1长度，＋'+ cfg.score + '分'
            },json || {});
            this.__foodPlugins.unshift(_json);
            this.__hasPlugin[_json.name] = _json;
        },
        
        createFood : function(c){
            var cfg = this.config();
            var range = Math.ceil(Math.random()*100)
            var plugin;
            if(range <= cfg.range && this.__foodPlugins.length >1) { 
                var _food = this.__foodPlugins.concat([]);
                _food.shift();
                plugin = randomArray(_food);
            } else {
                plugin = this.__foodPlugins[0]; 
            }
            var fBody = this.randomBlock(plugin.cssName);
            fBody.plugin = plugin;
            this.__isDied[this.setKey(fBody._offset.left,fBody._offset.top)] = false;
            this.__foodNums ++;
            return fBody;
        },
        removeFood : function(food){
            if(!food) {
                return;
            }
            this.deleteBlock(food._offset.left,food._offset.top);
            this.__foodNums --;
            food.plugin = null;
            if(this.__foodNums <0) {
                this.__foodNums = 0;
            }
        },
        eatFood : function(player,snake,food){
            var cfg = this.config();
            console.log(food.plugin.name);
            var plugin = extend({},this.__hasPlugin[food.plugin.name]);
            this.removeFood(food);
            var eated = plugin.effect.apply(this,arguments);
            if(plugin.fp > 0 && typeof plugin.unEffect == 'function') {
                player.buff[plugin.name] = {
                    fp : plugin.fp,
                    unEffect : plugin.unEffect
                }
            }
            player.scores += player.baseScore * plugin.score;
            this.playerScores[player.name] = player.scores;
            this.evtFire('eat',arguments);
            var cFood =  [0,1,2,2,3,4][this.alives];
            if(this.__foodNums <= cFood) {
                this.createFood();
            }
            return eated;
        },
        createSnake : function(length, direction, id, c){
            var snakeBody = [];
            var cfg = this.config();
            switch(direction) {
                case 'up' : 
                    while(length --) {
                        var l = Math.max(parseInt(cfg.columns/cfg.maxUsers),1) * id;
                        var t = cfg.rows - length;
                        snakeBody.push(this.createBlock(l,t,c));
                    }
                break;
                
                case 'down' : 
                    while(length --) {
                        var l = Math.max(parseInt(cfg.columns/cfg.maxUsers),1) * id;
                        var t = length;
                        snakeBody.push(this.createBlock(l,t ,c));
                    }
                break;

                case 'left' : 
                    while(length --) {
                        var l = cfg.columns - length;
                        var t = Math.max(parseInt(cfg.rows/cfg.maxUsers),1) * id;
                        snakeBody.push(this.createBlock(l,t,c));
                    }
                break;

                case 'right' : 
                    while(length --) {
                        var l = cfg.columns + length;
                        var t = Math.max(parseInt(cfg.rows/cfg.maxUsers),1) * id;
                        snakeBody.push(this.createBlock(l, t ,c));
                    }
                break;
            }
            return snakeBody;
        },

        addPlayer : function(player){
            var _player = {
                length : 2, //初始长度
                direction : 'up',//初始方向
                name : 'user' + +new Date, //玩家名称
                scores : 0, //初始分数
                cssName : 'defUser', //初始样式
                baseScore : 1,
            };
            var cfg = this.config();
            var item = extend(_player,player || {});
            if(this.playerIds.length >= cfg.maxUsers) {
                return;
            }
            if(!this.players[item.name]) {
                this.playerScores[item.name] = item.scores
                this.players[item.name] = {
                    snake : {
                        cssName : item.cssName,
                        speed : cfg.speed,
                        status : 'alive',
                        direction : item.direction
                    },
                    name : item.name,
                    scores : item.scores,
                    baseScore : item.baseScore, //分数倍数
                    buff : {}
                };
                for(var i = 0; i< cfg.maxUsers; i++) {
                    if(!this.playerIds[i]) {
                        this.playerIds[i] = this.players[item.name];
                        this.players[item.name].id = i + 1;
                        this.players[item.name].snake.body = this.createSnake(item.length,item.direction,i + 1,item.cssName + (i+1));
                        this.players[item.name].snake.cssName = item.cssName + (i+1);
                        break;
                    }
                }  
                this.alives ++;
                this.evtFire('addplayer',[this.players]);
            }
        },
        
        addPlayers : function(players){
            for(var p=0; p<players.length; p++){
                this.addPlayer(players[p]) 
            }
            
        },

        removePlayer : function(playerName){
            if(this.players[playerName]){
                this.removeSnake(this.players[playerName].snake.body);
                this.playerIds[this.players[playerName].id - 1] = undefined;
                this.players[playerName] = null;
                delete this.players[playerName];
                this.alives --
            }
        },

        removeSnake : function(snakeBody){
            for(var i = 0; i<snakeBody.length; i++) {
                var item = snakeBody[i];
                this.deleteBlock(item._offset.left,item._offset.top);
            }
        },

        init : function(){
            this.draw();
            var cfg = this.config();
            this.regBaseFood();
        },

        loadAllFood : function(){
            var _t =this;
            var cfg = _t.config();
            this.regFood({
                name : 'disFood',
                fp : 0,
                disFp : 20,
                effect : function(pluyer,snake,food){
                    var _snake = snake.body
                    if(_snake.length >2) {
                        var disBlock = _snake.pop()
                        this.deleteBlock( disBlock._offset.left,disBlock._offset.top);
                    }
                },
                score : 0,
                cssName : 'c',
                info : '如果蛇身长度大于初始长度，则蛇身长度－1。'
            });

            this.regFood({
                name : 'goodFood',
                fp : 0,
                disFp : 20,
                effect : function(player,snake,food){
                    var l = food._offset.left,t = food._offset.top;
                    var key = this.setKey(l,t);
                    var block = this.createBlock(l,t,snake.cssName);
                    snake.body.unshift(block);
                    return true;
                },
                score : 2 * cfg.score,
                cssName : 'a',
                info : '＋1长度，＋ '+ (cfg.score*2) +' 分'
            });
            this.regFood({
                name : 'apple',
                fp : parseInt((cfg.columns*cfg.rows)/25),
                disFp : 20,
                effect : function(player,snake,food){
                    var cfg = this.config();
                    player.baseScore =  2;
                },
                unEffect : function(player,snake){
                    var cfg = this.config();
                    player.baseScore = 1; 
                },
                score : 0,
                cssName : 'd',
                info : '（格子总数／25）步内吃到的食物分数加倍'
            });
        },

        snakeMove : function(){
            var cfg = this.config();
            
            if(this.alives == 0) {
                this.evtFire('gameover');
                this.pause();
            }
            for(var i in this.players) {
                var player = this.players[i];
                if(!player) {
                    continue;
                }
                if(player.snake.status == 'alive') {
                    var snake = player.snake.body;
                    var nextHead,l,t;
                    if(player.snake._direction) {
                        player.snake.direction = player.snake._direction;
                        player.snake._direction = null;
                    }
                    switch(player.snake.direction) {
                        case 'up' :
                            l =  snake[0]._offset.left;
                            t =  snake[0]._offset.top - 1
                        break;
                        case 'down' : 
                            l =  snake[0]._offset.left;
                            t =  snake[0]._offset.top + 1
                        break;
                        case 'left' : 
                            l =  snake[0]._offset.left -1;
                            t =  snake[0]._offset.top
                        break;
                        case 'right' : 
                            l =  snake[0]._offset.left +1;
                            t =  snake[0]._offset.top
                        break;
                    }
                    
                    var maybeFood = this.__fill[this.setKey(l,t)],eated = false;
                    if(this.__isDied[this.setKey(l,t)] || !maybeFood) {
                        console.log('game over');
                        player.snake.status = 'died';
                        return ;
                    }
                    
                    for(var pluginName in player.buff) {
                        var buff = player.buff[pluginName];
                        if(buff) {
                            if(buff.fp == 0 && typeof buff.unEffect == 'function') {
                                buff.unEffect.apply(this,[player,player.snake]);
                                buff[pluginName] = undefined;
                                delete buff[pluginName];
                            } 
                            buff.fp --;
                        }
                    }
                    
                    if(maybeFood && maybeFood.plugin) { //吃食物
                        eated = this.eatFood(player,player.snake,maybeFood);
                    } 
                    if(!eated) {
                        var disBlock = snake.pop()
                        this.deleteBlock( disBlock._offset.left,disBlock._offset.top);
                        nextHead = this.createBlock(l,t, player.snake.cssName);
                        
                        snake.unshift(nextHead);
                    } 
                } else if(player.snake.status == 'died') {
                    var _player = extend({},player);
                    this.removePlayer(player.name);
                    this.evtFire('died',[_player]);
                }
            }
        },

        //运动相关
        run : function(){
            var _t =this;
            var cfg = _t.config();
            var cFood =  [0,1,2,2,3,4][this.alives];
            for(var i = 0; i< cFood; i++) {
                this.createFood();
            }
            _t.evtFire('start');
            if(_t.__timer) {
                clearInterval(this.__timer);
            }
            _t.__timer = setInterval(function(){
                _t.evtFire('starting');
                _t.snakeMove();
            },cfg.speed);
        },
        pause : function () {
            clearInterval(this.__timer);
            this.__timer = null 
            this.evtFire('pause');
        },
        setDirection : function(snake,direction) { //设置移动方向
            var cfg  = this.config();
            if(snake.status != 'alive') {
                return;
            }
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
        },
        
        bind : function(evt, alias, handler){
            if(!this.__events[evt]) {
                this.__events[evt] = {};
            }            
            this.__events[evt][alias] = handler;
        },
        unbind : function(evt,alias){
            if(!this.__events[evt]) {
                return;
            }
            if(alias) {
                this.__events[evt][alias] = null;
                delete this.__events[evt][alias];
            } else {
                this.__events[evt] = null;
                delete this.__events[evt];
            }
        },
        evtFire : function(evt,data){
            if(!this.__events[evt]) {
                return;
            }
            
            for(var alias in  this.__events[evt]) {
                var func = this.__events[evt][alias];
                if(typeof func == 'function') {
                    this.__events[evt][alias].apply(this,data);
                }
            }
        }
    }
    window.Snake = Snake;
} ());

