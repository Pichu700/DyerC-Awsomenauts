game.PlayerEntity = me.Entity.extend({
    init: function (x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "wizard",
                width: 64,
                height: 64,
                spritewidth: "64",
                spriteheight: "64",
                getShape: function () {
                    return(new me.Rect(0, 0, 64, 54)).toPolygon();
                }
            }]);

        this.type = "PlayerEntity";
        this.health = game.data.playerHealth;
        this.body.setVelocity(game.data.playerMoveSpeed, 20);
        this.facing = "right";
        this.now = new Date().getTime();
        this.lastHit = this.now;
        this.lastAttack = new Date().getTime();

        this.renderable.addAnimation("idle", [131]);
        this.renderable.addAnimation("walk", [143, 144, 145, 146, 147, 148, 149, 150, 151], 80);
        this.renderable.addAnimation("attack", [195, 196, 197, 198, 199, 200, 199, 198, 197], 80);

        this.renderable.setCurrentAnimation("idle");
    },
    update: function (delta) {
        this.now = new Date().getTime();
        
        if(this.health <= 0){
            this.dead = true;
        }
        
        if (me.input.isKeyPressed("right")) {
            this.body.vel.x += this.body.accel.x * me.timer.tick;
            this.facing = "right";
            this.flipX(false);
        } else if (me.input.isKeyPressed("left")) {
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
            this.facing = "left";
            this.flipX(true);
        } else {
            this.body.vel.x = 0;
        }

        if (me.input.isKeyPressed("jump") && !this.body.jumping && !this.body.falling) {
            this.body.jumping = true;
            this.body.vel.y -= this.body.accel.y * me.timer.tick;
        }

        if (me.input.isKeyPressed("attack")) {
            if (!this.renderable.isCurrentAnimation("attack")) {
                this.renderable.setCurrentAnimation("attack", "idle");
                this.renderable.setAnimationFrame();
            }
        } else if (this.body.vel.x !== 0 && !this.renderable.isCurrentAnimation("attack")) {
            if (!this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk");
            }
        } else if (!this.renderable.isCurrentAnimation("attack")) {
            this.renderable.setCurrentAnimation("idle");
        }

        me.collision.check(this, true, this.collideHandler.bind(this), true);
        this.body.update(delta);

        this._super(me.Entity, "update", [delta]);
        return true;
    },
    loseHealth: function(damage){
        this.health = this.health - damage;
    },
    collideHandler: function (response) {
        if (response.b.type === "EnemyBaseEntity") {
            var ydif = this.pos.y - response.b.pos.y;
            var xdif = this.pos.x - response.b.pos.x;

            console.log("xdif" + xdif + "ydif" + ydif);

            if (ydif < -40 && xdif < 55 && xdif > -15) {
                this.body.falling = false;
                this.body.vel.y = -1;
            }
            else if (xdif > -20 && this.facing === "right" && (xdif<0)) {
                this.body.vel.x = 0;
                //this.pos.x = this.pos.x - 1;
           }else if (xdif < 60 && this.facing === "left" && xdif>0) {
                this.body.vel.x = 0;
                //this.pos.x = this.pos.x + 1;
           }

                if (this.renderable.isCurrentAnimation("attack") && this.now - this.lastHit >= game.data.playerAttackTimer) {
                    this.lastHit = this.now;
                    response.b.loseHealth(game.data.playerAttack);
                }
            }
            else if(response.b.type==="EnemyCreep"){
                var xdif = this.pos.x - response.b.pos.x;
                var ydif = this.pos.x - response.b.pos.y;
            
            if(xdif>0) {
                //this.pos.x = this.pos.x + 1;
                if(this.facing==="left"){
                    this.body.vel.x = 0;
                }
            }else{
                //this.pos.x = this.pos.x - 1;
                if(this.facing==="right"){
                    this.body.vel.x = 0;
                }
            }
            if(this.renderable.isCurrentAnimation("attack") && this.now - this.lastHit >= game.data.playerAttackTimer
                    && (Math.abs(ydif) <= 40) && 
                    (((xdif>0) && this.facing==="left") || ((xdif<0) && this.facing==="right"))
                    ){
                this.lastHit = this.now;
                response.b.loseHealth(game.data.playerAttack);
            }    
        }
    }
});

game.PlayerBaseEntity = me.Entity.extend({
    init: function (x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "tower",
                width: 100,
                height: 100,
                spritewidth: "100",
                spriteheight: "100",
                getShape: function () {
                    return(new me.Rect(0, 0, 100, 70)).toPolygon();
                }
            }]);
        this.broken = false;
        this.health = game.data.playerBaseHealth;
        this.alwaysUpdate = true;
        this.body.onCollision = this.onCollision.bind(this);
        this.type = "PlayerBase";

        this.renderable.addAnimation("idle", [0]);
        this.renderable.addAnimation("broken", [1]);
        this.renderable.setCurrentAnimation("idle");
    },
    update: function (delta) {
        if (this.health <= 0) {
            this.broken = true;
            this.renderable.setCurrentAnimation("broken");
        }
        this.body.update(delta);

        this._super(me.Entity, "update", [delta]);
        return true;
    },
    
    loseHealth: function (damage) {
        this.health = this.health - damage;
    },
    
    onCollision: function () {

    }

});

game.EnemyBaseEntity = me.Entity.extend({
    init: function (x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "tower",
                width: 100,
                height: 100,
                spritewidth: "100",
                spriteheight: "100",
                getShape: function () {
                    return(new me.Rect(0, 0, 100, 70)).toPolygon();
                }
            }]);
        this.broken = false;
        this.health = game.data.enemyBaseHealth;
        this.alwaysUpdate = true;
        this.body.onCollision = this.onCollision.bind(this);
        this.type = "EnemyBaseEntity";

        this.renderable.addAnimation("idle", [0]);
        this.renderable.addAnimation("broken", [1]);
        this.renderable.setCurrentAnimation("idle");
    },
    update: function (delta) {
        if (this.health <= 0) {
            this.broken = true;
            this.renderable.setCurrentAnimation("broken");
        }
        this.body.update(delta);

        this._super(me.Entity, "update", [delta]);
        return true;
    },
    onCollision: function () {

    },
    loseHealth: function () {
        this.health--;
    }

});

game.EnemyCreep = me.Entity.extend({
    init: function (x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "monster",
                width: 32,
                height: 64,
                spritewidth: "32",
                spriteheight: "64",
                getShape: function () {
                    return(new me.Rect(0, 0, 32, 64)).toPolygon();
                }
            }]);
        this.health = game.data.enemyCreepHealth;
        this.alwaysUpdate = true;
        //this.attacking lets us know that the enemy is attacking
        this.attacking = false;
        //keeps track of when our creep last attacked anything
        this.lastAttacking = new Date().getTime();
        //keeps track of the last time the creep hits anything
        this.lastHit = new Date().getTime();
        this.now = new Date().getTime();
        console.log("creep");
        this.body.setVelocity(3, 20);

        this.type = "EnemyCreep";

        this.renderable.addAnimation("walk", [3, 4, 5], 80);
        this.renderable.setCurrentAnimation("walk");
    },
                
    loseHealth: function(damage) {
      this.health = this.health - damage;
    },
    
    update: function (delta) {
        if(this.health <= 0){
            me.game.world.removeChild(this);
        }
        
        this.now = new Date().getTime();
        
        this.body.vel.x -= this.body.accel.x * me.timer.tick;
        
        me.collision.check(this, true, this.collideHandler.bind(this), true);
        
        this.body.update(delta);

        this._super(me.Entity, "update", [delta]);
        return true;
    },
    
    collideHandler: function(response){
        if(response.b.type==="PlayerBase"){
            this.attacking=true;
            //this.lastAttacking=this.now;
            this.body.vel.x = 0;
            //keeps moving the creep to the right to maintain its position
            this.pos.x = this.pos.x + 1;
            //checks that it has been at least 1 second since this creep hit a base
            if((this.now-this.lastHit >= 1000)){
             //updates the last lit timer
             this.lastHit = this.now;
             //makes the players base call it loseHealth function and pass it a
             //damage of 1
             response.b.loseHealth(1);
            }
        }else if (response.b.type==="PlayerEntity"){
            var xdif = this.pos.x - response.b.pos.x;
            
            this.attacking=true;
            if(xdif > 0) {
                //this.lastAttacking=this.now;
                this.pos.x = this.pos.x + 1;
                //keeps moving the creep to the right to maintain its position
                this.body.vel.x = 0;
            }
            //checks that it has been at least 1 second since this creep hit a something
            if((this.now-this.lastHit >= 1000) && xdif > 0){
            //updates the last lit timer
            this.lastHit = this.now;
            //makes the players base call it loseHealth function and pass it a
            //damage of 1
            response.b.loseHealth(1);
            }
        }
    }
    
});

game.GameManager = Object.extend({
    init: function (x, y, settings) {
        this.now = new Date().getTime();
        this.lastCreep = new Date().getTime();

        this.alwaysUpdate = true;
    },
    update: function () {
        this.now = new Date().getTime();
        
        if(game.data.player.dead){
            me.game.world.removeChild(game.data.player);
            me.state.current().resetPlayer(10,0);
        }

        if(Math.round(this.now/1000)%10 === 0 && (this.now - this.lastCreep >= 1000)) {
            this.lastCreep = this.now;
            var creepe = me.pool.pull("EnemyCreep", 1000, 0, {});
            me.game.world.addChild(creepe, 5);
        }
        return true;
    }

});