/**
 * 子类 plane 飞机
 * 1.继承 element
 * 2.依赖 bullet
 */
var Plane = function(opts){
	var opts = opts || {};
	//调用父类方法
	Element.call(this, opts);
	
	//特有属性
	this.status = 'normal';
	this.icon = opts.icon;
	//子弹相关
	this.bullets = [];
	this.bulletSize = opts.bulletSize;
	this.bulletSpeed = opts.bulletSpeed;
	this.bulletIcon = opts.bulletIcon;
//	this.shootSound = opts.shootSound;
	//特有属性， 爆炸相关
	this.boomIcon = opts.boomIcon;
	this.boomCount = 0;
};

//继承 element 方法
Plane.prototype = new Element();


/**
 * 播放音频
 */
//function playAudio(file){
//	var audio = document.getElementById('button');
//	if(audio){
//		document.removeChild(audio);
//	}
//	audio = document.createElement('audio');
//	audio.setAttribute('id','button');
//	audio.setAttribute('src',file);
//	audio.setAttribute('hidden','true');
//	audio.setAttribute('loop','true');
//	document.body.appendChild(audio);
//}

/**
 * 方法： hasHit 判断是否撞到当前元素
 * @param {target} target 目标元素实例
 */
Plane.prototype.hasCrash = function(target){
	var crash = false;
	//判断四边是否都没有空隙
	
	if (!(this.x + this.width < target.x) && 
	!(target.x + target.width < this.x) &&
	!(this.y + this.height < target.y) &&
	!(target.y + target.height < this.y)){
		//物体碰撞了
		crash = true;
		
		if(defaultMusicOff == 0){
			die.play();
			setTimeout(function(){
				die.pause();
			},900);
		}
			
	}
	return crash;	
};


/**
 * 方法: hasHit 判断是否击中当前元素
 * @param {target} target 目标元素实例
 */
Plane.prototype.hasHit = function(target){	
	var bullets = this.bullets;
	var hasHit = false;
	for (var j = bullets.length - 1; j >= 0 ; j--){
		//如果子弹击中的是目标对象的范围，则销毁子弹		
		if(bullets[j].hasCrash(target)){
			//清除子弹实例
			this.bullets.splice(j ,1);
			hasHit = true;			
			
			break;
		}
	}
	return hasHit;
	
};

/**
 * 方法： setPosition 修改飞机当前位置
 */
Plane.prototype.setPosition = function(newPlaneX, newPlaneY){
	this.x = newPlaneX;
	this.y = newPlaneY;
	return this;
};

/**
 * 方法：startShoot 方法
 */
Plane.prototype.startShoot = function(){
	var self = this;
	var bulletWidth = this.bulletSize.width;
	var bulletHeight = this.bulletSize.height;
	//定时发射子弹
	this.shootingInterval = setInterval(function(){
		//创建子弹，子弹位置是垂直居中发出
		var bulletX = self.x + self.width / 2 - bulletWidth / 2;
		var bulletY = self.y - bulletHeight;
		//创建子弹
		self.bullets.push(new Bullet({
			x: bulletX,
			y: bulletY,
			width: bulletWidth,
			height: bulletHeight,
			speed: self.bulletSpeed,
			icon: self.bulletIcon,
		}));
	},200);
};

//方法： drawBullets 画子弹
Plane.prototype.drawBullets = function(){
	var bullets = this.bullets;
	var i = bullets.length;
	while(i--){
		var bullet = bullets[i];
		//更新子弹的位置
		bullet.fly();//更新和绘制耦合在一起了
		//如果子弹超出边界。则删除
		if(bullet.y <= 0){
			//如果子弹实例下降到底部，则需要在drops数组中消除该子弹实例对象
			bullets.splice(i,1);
		}else{
			//未超出的则绘制子弹
			bullet.draw();
		}
	}
};

Plane.prototype.booming = function(){
	//设置状态为 booming
	this.status = 'booming';
	this.boomCount += 1;
	//如果已经booming 了6次，则设置状态为boomed
	if(this.boomCount > 10){
		this.status = 'boomed';
		clearInterval(this.shootingInterval);
	}
}

//方法; draw 方法
Plane.prototype.draw = function(){
	//绘制飞机
	switch(this.status){
		case 'booming':
			context.drawImage(this.boomIcon, this.x, this.y, this.width, this.height);
			break;
		default:
			context.drawImage(this.icon, this.x, this.y, this.width, this.height);
			break;
	}
	//绘制子弹
	this.drawBullets();
	return this;
};
