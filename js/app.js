//常用的元素和变量
var $body = $(document.body);

//画布相关
var $canvas = $('#game');
var canvas = $canvas.get(0);
var context = canvas.getContext('2d');
//var bgIndex = 1;
var bgImage2 = 'url("file:///C:/Users/pengZhenXian/Desktop/allElement/fight-ui/img/bg_2.jpg")';
var bgImage3 = 'url("file:///C:/Users/pengZhenXian/Desktop/allElement/fight-ui/img/bg_3.jpg")';
var bgImage4 = 'url("file:///C:/Users/pengZhenXian/Desktop/allElement/fight-ui/img/bg_4.jpg")';

var scoreTimer
//设置画布的宽度和高度
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//获取画布相关信息
var canvasWidth = canvas.clientWidth;
var canvasHeight = canvas.clientHeight;

//判断是否有 requestAnimationFrame 方法,如果有则模拟实现
window.requestAnimFrame =
window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimationFrame ||
window.msRequestAnimationFrame ||
function(callback){
	window.setTimeout(callback, 1000 / 30);
};
var die = document.getElementById('die');
var boom = document.getElementById('boom');
var buttom = document.getElementById('button');
var biu = document.getElementById('biu');
var bgmusic = document.getElementById('bgmusic');
die.pause();
boom.pause();
button.pause();
biu.pause();
bgmusic.pause();

var defaultMusicOff;

function bindEvent(){
	//绑定事件
	var self = this;
	//点击开始按键
	$body.on('click', '.js-start', function(){
		$body.attr('data-status', 'start');
		//开始游戏
		GAME.start();
		
	});
	
	//点击说明按钮
	$body.on('click', '.js-rule', function(){
		$body.attr('data-status', 'rule');
	});
	
	//点击设置按钮
	$body.on('click', '.js-setting', function(){
		$body.attr('data-status', 'setting');
	});
	
	//点击确认按钮
	$body.on('click', '.js-confirm-setting', function(){
		$body.attr('data-status', 'index');
		//设置游戏
		GAME.init();
		switch($('.defaultBg')[0].selectedIndex){
			case 1:
				$('#main').css('background',bgImage2);
				break;
			case 2:
				$('#main').css('background',bgImage3);
				break;
			case 3:
				$('#main').css('background',bgImage4);
				break;
		}
		if(defaultMusicOff == 0){
			button.play();
			setTimeout(function(){
				button.pause();
			},300);
		}
			
	});
	
	//点击我知道了规则的按钮
	$body.on('click', '.js-confirm-rule', function(){
		$body.attr('data-status', 'index');
	});
}

/*
 * 游戏对象
 */
var GAME = {
	/*
	 * 游戏初始化
	 */
	init:function(opts){
		//设置opts
		var opts = Object.assign({}, CONFIG);
		this.opts = opts;
		
		//计算飞机对象初始坐标
		this.planePosX = canvasWidth / 2 - opts.planeSize.width / 2;
		this.planePosY = canvasHeight - opts.planeSize.height - 50;
		
	},
	/**
	 * 游戏开始需要设置
	 */
	start:function(){
		//获取游戏初始化 level
		var self = this;//保存函数调用对象(即Game)
		var opts = this.opts;
		var images = this.images;
		var defaultPlanes = 'bluePlaneIcon';
		
		//清空射击目标对象数组和分数设置为0
		this.enemies = [];
		this.score = 0;
		
		defaultMusicOff = $('.defaultMusic')[0].selectedIndex
		
		//随机生成大小敌机
		this.createSmallEnemyInterval = setInterval(function(){
			self.createEnemy('normal');
		}, 500);
		this.createBigEnemyInterval = setInterval(function(){
			self.createEnemy('big');
		}, 1500);
		
		//创建主角英雄
		
//		console.log(window.getComputedStyle($body[0],null).backgroundImage);		
		
		if(defaultMusicOff == 0){
			bgmusic.play();
		}
		
		$('.ui-getScore').show()
		
		scoreTimer = setInterval(function(){
			$('.ui-getScore').html('分数：'+selfScore);
		},500);
				
		if($('.defaultPlane')[0].selectedIndex === 1){
			defaultPlanes = 'pinkPlaneIcon';
		}
		this.plane = new Plane({
			x: this.planePosX,
			y: this.planePosY,
			width: opts.planeSize.width,
			height: opts.planeSize.height,
			//子弹尺寸速度
			bulletSize: opts.bulletSize,
			bulletSpeed: opts.bulletSpeed,
			//图标相关			
			icon: resourceHelper.getImage(defaultPlanes),
			bulletIcon: resourceHelper.getImage('fireIcon'),
			boomIcon: resourceHelper.getImage('enemyBigBoomIcon')
		});
		
		//飞机开始射击
		this.plane.startShoot();
		
		//开始更新游戏
		this.update();
	},
	update:function(){
		var self = this;
		var opts = this.opts;
		//更新飞机, 敌人
		this.updateElement();
		
		//先清理画布
		context.clearRect(0, 0, canvasWidth, canvasHeight);
				
		if(this.plane.status === 'boomed'){
			this.end();
			return;
		}
				
		//绘制画布
		this.draw();
		
		//不断循环 update
		requestAnimFrame(function(){
			self.update()
		});
	},
	
	/**
	 * 更新当前所有元素的状态
	 */
	updateElement: function() {
		var opts = this.opts;
		var enemySize = opts.enemySize;
		var enemies = this.enemies;
		var plane = this.plane;
		var i = enemies.length;
		
		if(plane.status === 'booming'){
			plane.booming();
			return;
		}
		
		//循环更新怪兽
		while(i--){
			var enemy = enemies[i];
			enemy.down();
			
			if(enemy.y >= canvasHeight){
				this.enemies.splice(i,1);
			}else{
				//判断飞机状态
				if(plane.status === 'normal'){
					if(plane.hasCrash(enemy)){
						plane.booming();
					}
				}
				//根据怪兽状态判断是否被击中
				switch(enemy.status){
					case 'normal':						
						if(plane.hasHit(enemy)){
							
							enemy.live -= 1;
							if(enemy.live === 0){
								enemy.booming();
								
							}
						}
						break;
					case 'booming':
						enemy.booming();
						break;
					case 'boomed':
						enemies.splice(i, 1);
						break;
				}
			}
		}
	},
	/**
	 * 绑定手指触摸
	 */
	bindTouchAction: function(){
		var opts = this.opts;
		var self = this;
		//飞机极限横坐标，纵坐标
		var planeMinX = 0;
		var planeMinY = 0;
		var planeMaxX = canvasWidth - opts.planeSize.width - 20;
		var planeMaxY = canvasHeight - opts.planeSize.height - 15;
		//手指初始位置坐标
		var startTouchX;
		var startTouchY;
		//飞机初始位置
		var startPlaneX;
		var startPlaneY;
		
		//首次触屏
		$canvas.on('touchstart', function(e){
			var plane = self.plane;
			//记录首次触摸位置
//			console.log(e.originalEvent.touches[0]);
			startTouchX = e.originalEvent.touches[0].clientX;
			startTouchY = e.originalEvent.touches[0].clientY;
//			console.log('touchstart', startTouchX, startTouchY);
			// 记录飞机的初始位置
			startPlaneX = plane.x;
			startPlaneY = plane.y;
		
		});
		//滑动屏幕
		$canvas.on('touchmove', function(e){
			var newTouchX = e.originalEvent.touches[0].clientX;
			var newTouchY = e.originalEvent.touches[0].clientY;
//			console.log('touchmove',newTouchX, newTouchY);
			
			//新的飞机坐标等于手指滑动的距离加上飞机的初始位置
			var newPlaneX = startPlaneX + newTouchX - startTouchX;
			var newPlaneY = startPlaneY + newTouchY - startTouchY;
			//判断是否超出位置
			if(newPlaneX < planeMinX){
				newPlaneX = planeMinX;
			}
			if(newPlaneX > planeMaxX){
				newPlaneX = planeMaxX;
			}
			if(newPlaneY < planeMinY){
				newPlaneY = planeMinY;
			}
			if(newPlaneY > planeMaxY){
				newPlaneY = planeMaxY;
			}
			//更新飞机的位置
			self.plane.setPosition(newPlaneX, newPlaneY);
			//禁止默认事件，防止滑动屏幕
			e.preventDefault();
			
		});
		
	},
	
	/**
	 * 生成怪兽
	 * 
	 */
	createEnemy: function(enemyType){
		var enemies = this.enemies;
		var score = this.score;
		var opts = this.opts;
		var images = this.images || {};
		var enemySize = opts.enemySmallSize;
		var enemySpeed = opts.enemySpeed;
		var enemyIcon = resourceHelper.getImage('enemySmallIcon');
		var enemyBoomIcon = resourceHelper.getImage('enemySmallBoomIcon');
		
		var enemyScore = 100;
		var enemyLive = 1;
		
		//大型低级参数
		if (enemyType === 'big'){
			enemySize = opts.enemyBigSize;
			enemyIcon = resourceHelper.getImage('enemyBigIcon');
		    enemyBoomIcon = resourceHelper.getImage('enemyBigBoomIcon');			
			enemySpeed = opts.enemySpeed * 0.6;
			enemyLive = 10;
			enemyScore = 1000;
		}
		
		//综合元素的参数
		var initOpt = {
			x: Math.floor(Math.random() * (canvasWidth - enemySize.width)),
			y: -enemySize.height,
			enemyType: enemyType,
			live: enemyLive,
			width: enemySize.width,
			height: enemySize.height,
			speed: enemySpeed,
			icon: enemyIcon,
			boomIcon: enemyBoomIcon,
			score: enemyScore
		}
		
		//怪兽的数量不大于最大值则新增
		if(enemies.length < opts.enemyMaxNum){
			enemies.push(new Enemy(initOpt));
		}
		
	},
	end:function(){
		$('.ui-reload').find('.score').html(selfScore + '分');
		$('.ui-reload').show();
		clearInterval(scoreTimer);
		biu.pause();
		bgmusic.pause();
	},
	draw:function(){
		this.enemies.forEach(function(enemy){
			enemy.draw();
		});
		this.plane.draw();
	}
};

$('.ui-reload').find('.btn').on('click',function(){
	location.reload();
});

/*
 *页面主入口
 * */
function init(){
	//加载图片资源,加载完成才能交互
	resourceHelper.load(CONFIG.resources, function(resources){
		//加载完成
		GAME.init();
		//绑定手指事件
		GAME.bindTouchAction();
		bindEvent();
	});	
}

init();
