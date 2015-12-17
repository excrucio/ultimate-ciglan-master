// The Grid component allows an element to be located
//  on a grid of tiles
Crafty.c('Grid', {
    init: function() {
        this.attr({
            w: Game.grid.t.w,
            h: Game.grid.t.h
        })
    },

    // Locate this entity at the given position on the grid
    at: function(x, y) {
        if (x === undefined && y === undefined) {
            return { x: this.x/Game.grid.t.w, y: this.y/Game.grid.t.h }
        } else {
            this.attr({ x: x * Game.grid.t.w, y: y * Game.grid.t.h });
            return this;
        }
    }
});

Crafty.c("GamePart", {
    init: function() {

    }
});
Crafty.c("Actor", {
    init: function() {
        this.requires('2D, Canvas, Grid, GamePart');
    }
})

Crafty.c("EndText",{
    init: function() {
        this.requires("2D, DOM, Text");
    },
});

Crafty.c("Deadly", {
    init: function(){
    }
});

Crafty.c("Breakable", {
    isBroken: false,
    isTriggered: false,
    init: function(){
        this.requires("Solid");
    },
    trigg: function(){
        this.isTriggered = true;
    }
});


/*  spr_blank: [0,0],
    spr_brick: [1,0],
    spr_brickMoss: [2,0],
    spr_grass: [3,0],
    spr_door: [0,1],
    spr_doorLocked: [1,1],
    spr_key: [2,1],
    spr_stone: [3,1],
    spr_stoneMoss: [0,2],
    spr_stoneBreak: [1,2],
    spr_spikeUp: [0,3],
    spr_spikeRight: [1,3],
    spr_spikeDown: [2,3],
    spr_spikeLeft: [3,3]
    */
Crafty.c('Brick', {
    init: function() {
        this.requires('Actor, Solid, spr_brick');
    },
});
Crafty.c('BrickMoss', {
    init: function() {
        this.requires('Actor, Solid, spr_brickMoss');
    },
});
Crafty.c('Grass', {
    init: function() {
        this.requires('Actor, spr_grass');
    },
});
Crafty.c('Stone', {
    init: function() {
        this.requires('Actor, Solid, spr_stone');
    },
});
Crafty.c('StoneMoss', {
    init: function() {
        this.requires('Actor, spr_stoneMoss');
    },
});

//special blocks
Crafty.c('Door', {
    isUnlocked: false,
    init: function() {
        this.requires('Actor, spr_doorLocked');
        this.bind("KeyPicked", function(data) {
            this.toggleComponent("spr_doorLocked","spr_door");
            this.isUnlocked = true;
        });
    },
});
Crafty.c('Key', {
    init: function() {
        this.requires('Actor, spr_key');
    },
});

Crafty.c('StoneBreak', {
    init: function() {
        this.requires('Actor, Breakable, spr_stoneBreak, SpriteAnimation').reel('ani_break', Game.tickTime/4, 1, 2, 3);
    },
    kill: function() {
        this.isBroken = true;
        this.animate("ani_break");
        if(Game.sound){
            Crafty.audio.play("crumble");
        }
        this.bind("AnimationEnd", function(data){
            this.toggleComponent("spr_stoneBreak","spr_blank");
        })
    }
});


Crafty.c('Spike', {
    init: function() {
        this.requires('Actor, Deadly');
    },
    rot: function(rotation){
        if(rotation == "up"){
            this.addComponent("spr_spikeUp");
        } else {
            if(rotation == "left"){
                this.addComponent("spr_spikeLeft");
            } else {
                if(rotation == "down"){
                    this.addComponent("spr_spikeDown");
                } else {
                    if(rotation == "right"){
                        this.addComponent("spr_spikeRight");
                    }
                }
            }
        }
        return this;
    }
});

//player
Crafty.c("Player", {
    direction: "",
    inAir: false,
    init: function(){
        this.requires("Actor, spr_player, SpriteAnimation, Tween")
            .reel('ani_playerLeft', Game.tickTime/2, 0,1,1)
            .reel('ani_playerRight', Game.tickTime/2, 0,0,1)
            .reel('ani_playerWalkLeft', Game.tickTime/2, 0,1,4)
            .reel('ani_playerWalkRight', Game.tickTime/2, 0,0,4)
            .reel('ani_playerJumpLeft', Game.tickTime/2, 1,2,1)
            .reel('ani_playerJumpRight', Game.tickTime/2, 0,2,1)
            .reel('ani_playerDie', Game.tickTime/2, 0,3,4);

        this._globalZ = 1000;
        this.bind("Died",this.killed);
        this.direction = "right";
        this.inAir = false;

    },
    killed: function() {
        this.animate("ani_playerDie");
        Crafty.trigger("Finished",false);
    },
    moving: function(data) {
        switch(data){
            case Action.Stop:
                if(this.inAir){
                    if(this.direction == "left"){
                        this.animate("ani_playerJumpLeft",1);
                    } else {
                        this.animate("ani_playerJumpRight",1);
                    }
                } else {
                    if(this.direction == "left"){
                        this.animate("ani_playerLeft");
                    } else {
                        this.animate("ani_playerRight");
                    }
                }
                break;
            case Action.Left:
                if(this.inAir){
                    this.animate("ani_playerJumpLeft");
                } else {
                    if(Game.sound){
                        Crafty.audio.play("footstep",1,0.4);
                    }
                    this.animate("ani_playerWalkLeft",2);
                }
                this.direction = "left";
                break;
            case Action.Right:
                if(this.inAir){
                    this.animate("ani_playerJumpRight");
                } else {
                    if(Game.sound){
                        Crafty.audio.play("footstep",1,0.4);
                    }
                    this.animate("ani_playerWalkRight",2);
                }
                this.direction = "right";
                break;
            case Action.JumpLeft:
                if(!this.inAir){
                    if(Game.sound){
                        Crafty.audio.play("grunt",1,0.6);
                    }
                }
                this.animate("ani_playerJumpLeft",1);
                this.direction = "left";
                break;
            case Action.JumpRight:
                if(!this.inAir){
                    if(Game.sound){
                        Crafty.audio.play("grunt",1,0.7);
                    }
                }
                this.animate("ani_playerJumpRight",1);
                this.direction = "right";
                break;
            case Action.Jump:
                if(!this.inAir){
                    if(Game.sound){
                        Crafty.audio.play("grunt",1,0.7);
                    }
                }
                if(this.direction == "left"){
                    this.animate("ani_playerJumpLeft",1);
                } else {
                    this.animate("ani_playerJumpRight",1);
                }
                break;
        }
    },
});

Crafty.c("Ticker", {
    isRunning: false,
    winCondition: false,

    onWin: undefined,
    onLose: undefined,
    onCont: undefined,

    debugMove: true,

    init: function(){
        if(Game.debug){
            this.requires("DOM").bind('KeyDown', function(e) {
                if(this.debugMove){
                    this.debugMove = false;
                    if(e.key == Crafty.keys.A) {
                        this.step(Action.Left);
                        console.log("Action: Left");
                    } else if (e.key == Crafty.keys.D) {
                        this.step(Action.Right);
                        console.log("Action: Right");
                    } else if (e.key == Crafty.keys.W) {
                        this.step(Action.Jump);
                        console.log("Action: Jump");
                    } else if (e.key == Crafty.keys.Q) {
                        this.step(Action.JumpLeft);
                        console.log("Action: Jump Left");
                    } else if (e.key == Crafty.keys.E) {
                        this.step(Action.JumpRight);
                        console.log("Action: Jump Right");
                    } else if (e.key == Crafty.keys.S) {
                        this.step(Action.Stop);
                        console.log("Action: Stop");
                    }
                }
            });
        }
        this.bind("StartSimulation",this.start);
        this.bind("PauseSimulation",this.pause);
        this.bind("StopSimulation",this.stop);
        this.bind("Finished",this.finished);
        this.bind("Step",this.step); //step is a tick of the automation
        this.bind("EndStep",this.endstep);
    },
    start: function(data){
        this.onWin = data.onWin;
        this.onLose = data.onLose;
        this.onCont = data.onCont;
        this.isRunning = true;
        console.log("Simulation: starting");
    },
    pause: function(data){
        this.isRunning = false;
    },
    stop: function(data){
        console.log("Simulation: stopping");
        this.isRunning = false;
        this.winCondition = false;
        Game.levelLoad();
    },
    finished: function(data){
        console.log("Finished: " + data.toString());
        Game.textStopToReset = Crafty.e("EndText").attr({x:Game.width()/2-85,y:Game.height()/2+10, w:200}).text("Press stop to reset simulation").textFont({size:"13px"}).unselectable();
        Game.textStopToReset._globalZ = 100000;
        if(data){
            this.winCondition = true;
            Game.textVictory = Crafty.e("EndText").attr({ x: Game.width()/2-45, y: Game.height()/2-20}).text("Victory!").textFont({ size: '24px'}).unselectable();
            Game.textVictory._globalZ = 100000;
            if(Game.sound){
                Crafty.audio.play("victory");
            }
            this.onWin();
        } else {
            this.winCondition = false;
            Game.textFailure = Crafty.e("EndText").attr({ x: Game.width()/2-55, y: Game.height()/2-20, w:200}).text("Crumbled").textFont({ size: '24px'}).unselectable();
            Game.textFailure._globalZ = 100000;
            if(Game.sound){
                Crafty.audio.play("died",1,0.7);
            }
            this.onLose()
        }
    },
    step: function(data) {
        var surrounding = this.checkPlayerState();
        //surrounding is a matrix that shows possible moves
        //if player on ground
        // X X X
        // X X X
        // X P X
        // X X X
        // X X X
        //if player in air (player line is not used)
        //   P
        // X X X
        // X X X
        var gpos = Game.level.player.at();
        var pos = {
            x: Game.level.player.x,
            y: Game.level.player.y
        };
        Game.level.player.moving(data);
        switch(data){
            //in each case we act different whether the player is in air or not. the whole breakable thing is some really bad piece of code, should be rewritten
            case Action.Stop:
                if(Game.level.player.inAir){
                    //if inAir is true, the last step we took made sure we had no ground under us, so we just need to check for the ground under us after the fall
                    Game.level.player.tween({y:pos.y+Game.grid.t.h},Game.tickTime)

                    if(surrounding[1][1] == "solid"){
                        Game.level.player.inAir = false;
                    } else if(surrounding[1][1] == "breakable"){
                        Game.level.player.inAir = false;
                        Game.level.triggerBreakable({x:gpos.x,y:gpos.y+2})
                    }
                } else {
                    //if inAir is false it means we're on solid so we don't do anything, or we're on a triggered breakable block, so we break it and fall
                    //we can't be on a breakable because the previous step would check if we were stepping/falling on it
                    if(surrounding[3][1] == "triggered"){
                        Game.level.player.inAir = true;
                        Game.level.killBreakable({x:gpos.x,y:gpos.y+1});

                        Game.level.player.tween({y:pos.y+Game.grid.t.h},Game.tickTime);

                        if(surrounding[4][1] == "solid"){
                            Game.level.player.inAir = false;
                        } else if(surrounding[4][1] == "breakable") {
                            Game.level.player.inAir = false;
                            Game.level.triggerBreakable({x:gpos.x,y:gpos.y+2})
                        }
                    }
                }
                break;
            case Action.Left:
                if(Game.level.player.inAir){
                    //check if we can move left in the air or are we just falling one block.
                    if(surrounding[0][0] == "free"){
                        Game.level.player.tween({x:pos.x-Game.grid.t.w,y:pos.y+Game.grid.t.h},Game.tickTime)

                        if(surrounding[1][0] == "solid"){
                            Game.level.player.inAir = false;
                        } else if(surrounding[1][0] == "breakable"){
                            Game.level.player.inAir = false;
                            Game.level.triggerBreakable({x:gpos.x-1,y:gpos.y+2})
                        }
                    } else {
                        Game.level.player.tween({y:pos.y+Game.grid.t.h},Game.tickTime)

                        if(surrounding[1][1] == "solid"){
                            Game.level.player.inAir = false;
                        } else if(surrounding[1][1] == "breakable"){
                            Game.level.player.inAir = false;
                            Game.level.triggerBreakable({x:gpos.x,y:gpos.y+2})
                        }
                    }
                } else {
                    //check if we can actually move left, if we can check if we were on a triggered block, if yes kill it, if we can't move, stay on current, or if triggered fall trough
                    if(surrounding[2][0] == "free"){
                        Game.level.player.tween({x:pos.x-Game.grid.t.w},Game.tickTime);

                        if(surrounding[3][1] == "triggered"){
                            Game.level.killBreakable({x:gpos.x,y:gpos.y+1});
                        }

                        if(surrounding[3][0] == "solid"){
                            Game.level.player.inAir = false;
                        } else if(surrounding[3][0] == "breakable"){
                            Game.level.player.inAir = false;
                            Game.level.triggerBreakable({x:gpos.x-1,y:gpos.y+1})
                        } else if(surrounding[3][0] == "free"){
                            Game.level.player.inAir = true;
                        }

                    } else {
                        if(surrounding[3][1] == "triggered"){
                            Game.level.killBreakable({x:gpos.x,y:gpos.y+1});
                            Game.level.player.inAir = true;

                            Game.level.player.tween({y:pos.y+Game.grid.t.h},Game.tickTime);

                            if(surrounding[4][1] == "solid"){
                                Game.level.player.inAir = false;
                            } else if(surrounding[4][1] == "breakable") {
                                Game.level.player.inAir = false;
                                Game.level.triggerBreakable({x:gpos.x,y:gpos.y+2})
                            }
                        }
                    }
                }
                break;
            case Action.Right:
                if(Game.level.player.inAir){
                    //check if we can move right in the air or are we just falling one block.
                    if(surrounding[0][2] == "free"){
                        Game.level.player.tween({x:pos.x+Game.grid.t.w,y:pos.y+Game.grid.t.h},Game.tickTime)

                        if(surrounding[1][2] == "solid"){
                            Game.level.player.inAir = false;
                        } else if(surrounding[1][2] == "breakable"){
                            Game.level.player.inAir = false;
                            Game.level.triggerBreakable({x:gpos.x+1,y:gpos.y+2})
                        }
                    } else {
                        Game.level.player.tween({y:pos.y+Game.grid.t.h},Game.tickTime)

                        if(surrounding[1][1] == "solid"){
                            Game.level.player.inAir = false;
                        } else if(surrounding[1][1] == "breakable"){
                            Game.level.player.inAir = false;
                            Game.level.triggerBreakable({x:gpos.x,y:gpos.y+2})
                        }
                    }
                } else {
                    //check if we can actually move right, if we can check if we were on a triggered block, if yes kill it, if we can't move, stay on current, or if triggered fall trough
                    if(surrounding[2][2] == "free"){
                        Game.level.player.tween({x:pos.x+Game.grid.t.w},Game.tickTime);

                        if(surrounding[3][1] == "triggered"){
                            Game.level.killBreakable({x:gpos.x,y:gpos.y+1});
                        }

                        if(surrounding[3][2] == "solid"){
                            Game.level.player.inAir = false;
                        } else if(surrounding[3][2] == "breakable"){
                            Game.level.player.inAir = false;
                            Game.level.triggerBreakable({x:gpos.x+1,y:gpos.y+1})
                        } else if(surrounding[3][2] == "free"){
                            Game.level.player.inAir = true;
                        }

                    } else {
                        if(surrounding[3][1] == "triggered"){
                            Game.level.killBreakable({x:gpos.x,y:gpos.y+1});
                            Game.level.player.inAir = true;

                            Game.level.player.tween({y:pos.y+Game.grid.t.h},Game.tickTime);

                            if(surrounding[4][1] == "solid"){
                                Game.level.player.inAir = false;
                            } else if(surrounding[4][1] == "breakable") {
                                Game.level.player.inAir = false;
                                Game.level.triggerBreakable({x:gpos.x,y:gpos.y+2})
                            }
                        }
                    }
                }
                break;
            case Action.JumpLeft:
                if(Game.level.player.inAir){
                    //if we're in air we're behaving just like a left
                    if(surrounding[0][0] == "free"){
                        Game.level.player.tween({x:pos.x-Game.grid.t.w,y:pos.y+Game.grid.t.h},Game.tickTime)

                        if(surrounding[1][0] == "solid"){
                            Game.level.player.inAir = false;
                        } else if(surrounding[1][0] == "breakable"){
                            Game.level.player.inAir = false;
                            Game.level.triggerBreakable({x:gpos.x-1,y:gpos.y+2})
                        }
                    } else {
                        Game.level.player.tween({y:pos.y+Game.grid.t.h},Game.tickTime)

                        if(surrounding[1][1] == "solid"){
                            Game.level.player.inAir = false;
                        } else if(surrounding[1][1] == "breakable"){
                            Game.level.player.inAir = false;
                            Game.level.triggerBreakable({x:gpos.x,y:gpos.y+2})
                        }
                    }
                } else {
                    //check for freedom of jumping and kill triggered block underneath if true
                    if(surrounding[1][1] == "free"){
                        //we can jump one block high
                        if(surrounding[3][1] == "triggered"){
                            Game.level.killBreakable({x:gpos.x,y:gpos.y+1});
                            Game.level.player.inAir = true;
                        }
                        if(surrounding[0][1] == "free"){
                            //we can jump two blocks high
                            if(surrounding[0][0] == "free"){
                                //we can jump the whole jump
                                Game.level.player.inAir = true;
                                Game.level.player.tween({x:pos.x-Game.grid.t.w,y:pos.y-Game.grid.t.h*2},Game.tickTime)

                                if(surrounding[1][0] == "solid"){
                                    Game.level.player.inAir = false;
                                } else if(surrounding[1][0] == "breakable"){
                                    Game.level.player.inAir = false;
                                    Game.level.triggerBreakable({x:gpos.x-1,y:gpos.y-1});
                                }

                            } else {
                                //we behave as if it was a normal jump
                                Game.level.player.inAir = true;
                                Game.level.player.tween({y:pos.y-Game.grid.t.h*2},Game.tickTime)
                            }
                        } else {
                            if(surrounding[1][0] == "free"){
                                //we can do a short jump up left
                                Game.level.player.inAir = true;
                                Game.level.player.tween({x:pos.x-Game.grid.t.w,y:pos.y-Game.grid.t.h},Game.tickTime);

                                if(surrounding[2][0] == "solid"){
                                    Game.level.player.inAir = false;
                                } else if(surrounding[2][0] == "breakable"){
                                    Game.level.player.inAir = false;
                                    Game.level.triggerBreakable({x:gpos.x-1,y:gpos.y});
                                }
                            } else {
                                //we're making a one block normal jump
                                Game.level.player.inAir = true;
                                Game.level.player.tween({y:pos.y-Game.grid.t.h},Game.tickTime)
                            }
                        }
                    } else {
                        //we have no place to jump, behave like a left
                        if(surrounding[2][0] == "free"){
                            Game.level.player.tween({x:pos.x-Game.grid.t.w},Game.tickTime);

                            if(surrounding[3][1] == "triggered"){
                                Game.level.killBreakable({x:gpos.x,y:gpos.y+1});
                            }

                            if(surrounding[3][0] == "solid"){
                                Game.level.player.inAir = false;
                            } else if(surrounding[3][0] == "breakable"){
                                Game.level.player.inAir = false;
                                Game.level.triggerBreakable({x:gpos.x-1,y:gpos.y+1})
                            } else if(surrounding[3][0] == "free"){
                                Game.level.player.inAir = true;
                            }

                        } else {
                            if(surrounding[3][1] == "triggered"){
                                Game.level.killBreakable({x:gpos.x,y:gpos.y+1});
                                Game.level.player.inAir = true;

                                Game.level.player.tween({y:pos.y+Game.grid.t.h},Game.tickTime);

                                if(surrounding[4][1] == "solid"){
                                    Game.level.player.inAir = false;
                                } else if(surrounding[4][1] == "breakable") {
                                    Game.level.player.inAir = false;
                                    Game.level.triggerBreakable({x:gpos.x,y:gpos.y+2})
                                }
                            }
                        }
                    }
                }
                break;
            case Action.JumpRight:
                if(Game.level.player.inAir){
                    //if we're in air we're behaving just like a right
                    if(surrounding[0][2] == "free"){
                        Game.level.player.tween({x:pos.x+Game.grid.t.w,y:pos.y+Game.grid.t.h},Game.tickTime)

                        if(surrounding[1][2] == "solid"){
                            Game.level.player.inAir = false;
                        } else if(surrounding[1][2] == "breakable"){
                            Game.level.player.inAir = false;
                            Game.level.triggerBreakable({x:gpos.x+1,y:gpos.y+2})
                        }
                    } else {
                        Game.level.player.tween({y:pos.y+Game.grid.t.h},Game.tickTime)

                        if(surrounding[1][1] == "solid"){
                            Game.level.player.inAir = false;
                        } else if(surrounding[1][1] == "breakable"){
                            Game.level.player.inAir = false;
                            Game.level.triggerBreakable({x:gpos.x,y:gpos.y+2})
                        }
                    }
                } else {
                    //PAZI
                    //check for freedom of jumping and kill triggered block underneath if true
                    if(surrounding[1][1] == "free"){
                        //we can jump one block high
                        if(surrounding[3][1] == "triggered"){
                            Game.level.killBreakable({x:gpos.x,y:gpos.y+1});
                            Game.level.player.inAir = true;
                        }
                        if(surrounding[0][1] == "free"){
                            //we can jump two blocks high
                            if(surrounding[0][2] == "free"){
                                //we can jump the whole jump
                                Game.level.player.inAir = true;
                                Game.level.player.tween({x:pos.x+Game.grid.t.w,y:pos.y-Game.grid.t.h*2},Game.tickTime)

                                if(surrounding[1][2] == "solid"){
                                    Game.level.player.inAir = false;
                                } else if(surrounding[1][2] == "breakable"){
                                    Game.level.player.inAir = false;
                                    Game.level.triggerBreakable({x:gpos.x+1,y:gpos.y-1});
                                }

                            } else {
                                //we behave as if it was a normal jump
                                Game.level.player.inAir = true;
                                Game.level.player.tween({y:pos.y-Game.grid.t.h*2},Game.tickTime)
                            }
                        } else {
                            if(surrounding[1][2] == "free"){
                                //we can do a short jump up left
                                Game.level.player.inAir = true;
                                Game.level.player.tween({x:pos.x+Game.grid.t.w,y:pos.y-Game.grid.t.h},Game.tickTime);

                                if(surrounding[2][2] == "solid"){
                                    Game.level.player.inAir = false;
                                } else if(surrounding[2][2] == "breakable"){
                                    Game.level.player.inAir = false;
                                    Game.level.triggerBreakable({x:gpos.x+1,y:gpos.y});
                                }
                            } else {
                                //we're making a one block normal jump
                                Game.level.player.inAir = true;
                                Game.level.player.tween({y:pos.y-Game.grid.t.h},Game.tickTime)
                            }
                        }
                    } else {
                        //we have no place to jump, behave like a right
                        if(surrounding[2][2] == "free"){
                            Game.level.player.tween({x:pos.x+Game.grid.t.w},Game.tickTime);

                            if(surrounding[3][1] == "triggered"){
                                Game.level.killBreakable({x:gpos.x,y:gpos.y+1});
                            }

                            if(surrounding[3][2] == "solid"){
                                Game.level.player.inAir = false;
                            } else if(surrounding[3][2] == "breakable"){
                                Game.level.player.inAir = false;
                                Game.level.triggerBreakable({x:gpos.x+1,y:gpos.y+1})
                            } else if(surrounding[3][2] == "free"){
                                Game.level.player.inAir = true;
                            }

                        } else {
                            if(surrounding[3][1] == "triggered"){
                                Game.level.killBreakable({x:gpos.x,y:gpos.y+1});
                                Game.level.player.inAir = true;

                                Game.level.player.tween({y:pos.y+Game.grid.t.h},Game.tickTime);

                                if(surrounding[4][1] == "solid"){
                                    Game.level.player.inAir = false;
                                } else if(surrounding[4][1] == "breakable") {
                                    Game.level.player.inAir = false;
                                    Game.level.triggerBreakable({x:gpos.x,y:gpos.y+2})
                                }
                            }
                        }
                    }
                    //PAZI
                }
                break;
            case Action.Jump:
                if(Game.level.player.inAir){
                    //if we are in the air we behave just like we're stopping in air
                    Game.level.player.tween({y:pos.y+Game.grid.t.h},Game.tickTime)

                    if(surrounding[1][1] == "solid"){
                        Game.level.player.inAir = false;
                    } else if(surrounding[1][1] == "breakable"){
                        Game.level.player.inAir = false;
                        Game.level.triggerBreakable({x:gpos.x,y:gpos.y+2})
                    }
                } else {
                    //we're on the ground, if we're on a triggered breakable we need to destroy it, and we jump the amount of free blocks we can (max height of jump is 2)
                    if(surrounding[3][1] == "triggered"){
                        Game.level.killBreakable({x:gpos.x,y:gpos.y+1});
                        Game.level.player.inAir = true;
                    }
                    if(surrounding[1][1] == "free"){
                        if(surrounding[0][1] == "free"){
                            Game.level.player.inAir = true;
                            Game.level.player.tween({y:pos.y-Game.grid.t.h*2},Game.tickTime)
                        } else {
                            Game.level.player.inAir = true;
                            Game.level.player.tween({y:pos.y-Game.grid.t.h},Game.tickTime)
                        }
                    }
                }
        }
        setTimeout(function() {
            Crafty.trigger("EndStep","");
        },Game.tickTime);
    },

    endstep: function(){

        this.normalizePlayer();

        playerpos = Game.level.player.at();
        keypos = Game.level.key.at();
        doorpos = Game.level.door.at();

        if(Game.level.touchedDeadly(playerpos)){
            Crafty.trigger("Died","");
            return;
        }

        if(!Game.level.door.isUnlocked){
            if(playerpos.x == keypos.x && playerpos.y == keypos.y){
                Crafty.trigger("KeyPicked", "");
                if(Game.sound){
                    Crafty.audio.play("collect");
                }
                Game.level.key.toggleComponent("spr_key","spr_blank");
            }
        } else {
            if(doorpos.x == playerpos.x && doorpos.y == playerpos.y){
                Crafty.trigger("Finished",true);
                return;
            }
        }

        if(Game.debug){
            this.debugMove = true;
        }
        this.onCont();
    },

    normalizePlayer: function() {
        var pos = {
            x:Game.level.player.x,
            y:Game.level.player.y
        }
        var mod = {
            x: pos.x%Game.grid.t.w,
            y: pos.y%Game.grid.t.h
        }
        var newpos = {
            x:pos.x,
            y:pos.y
        }
        if(mod.x != 0){
            if(mod.x > Game.grid.t.w/2){
                newpos.x = (Game.grid.t.w-mod.x)+pos.x;
            } else {
                newpos.x = (pos.x - mod.x);
            }
        }
        if(mod.y != 0){
            if(mod.y > Game.grid.t.h/2){
                newpos.y = (Game.grid.t.h-mod.y)+pos.y;
            } else {
                newpos.y = (pos.y - mod.y);
            }
        }
        Game.level.player.at(newpos.x/16,newpos.y/16);

    },
    //Check player surroundings
    checkPlayerState: function(){
        var playerpos = Game.level.player.at();
        //surrounding is a matrix that shows possible moves
        //if player on ground
        // X X X
        // X X X
        // X P X
        // X X X
        // X X X
        //if player in air (player line is not used)
        //   P
        // X X X
        // X X X
        var sur = [];
        if(Game.level.player.inAir){
            sur = [
                [Game.level.typeOf(playerpos.x-1,playerpos.y+1),Game.level.typeOf(playerpos.x,playerpos.y+1),Game.level.typeOf(playerpos.x+1,playerpos.y+1)],
                [Game.level.typeOf(playerpos.x-1,playerpos.y+2),Game.level.typeOf(playerpos.x,playerpos.y+2),Game.level.typeOf(playerpos.x+1,playerpos.y+2)],
            ];
            return sur;
        } else {
            sur = [
                [Game.level.typeOf(playerpos.x-1,playerpos.y-2),Game.level.typeOf(playerpos.x,playerpos.y-2),Game.level.typeOf(playerpos.x+1,playerpos.y-2)],
                [Game.level.typeOf(playerpos.x-1,playerpos.y-1),Game.level.typeOf(playerpos.x,playerpos.y-1),Game.level.typeOf(playerpos.x+1,playerpos.y-1)],
                [Game.level.typeOf(playerpos.x-1,playerpos.y),"player",Game.level.typeOf(playerpos.x+1,playerpos.y)],
                [Game.level.typeOf(playerpos.x-1,playerpos.y+1),Game.level.typeOf(playerpos.x,playerpos.y+1),Game.level.typeOf(playerpos.x+1,playerpos.y+1)],
                [Game.level.typeOf(playerpos.x-1,playerpos.y+2),Game.level.typeOf(playerpos.x,playerpos.y+2),Game.level.typeOf(playerpos.x+1,playerpos.y+2)]
            ];
            return sur;
        }
    },
});