l = {
    t: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,8,0,0,0,0,9,4,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,12,0,0,0,0,0,3,6,8,8,6,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,2,2,6,0,10,6,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,13,0,0,5,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
}

Game = {
    //if debug is true moveemnt with qweasd is possible
    debug: true,

    //sound for game part
    sound: true,

    //defines tick time
    tickTime: 1000,
    // This defines our grid's size and the size of each of its tiles
    grid: {
        w: 24,
        h: 15,
        t: {
            w: 16,
            h: 16
        }
    },
    textVictory: undefined,
    textFailure: undefined,
    textStopToReset: undefined,
    level: {
        t: [],
        player: undefined,
        door: undefined,
        key: undefined,
        breakable: [],
        solids: [],
        deadly: [],
        rest: [],

        clear: function(){
            Crafty('GamePart').each(function() { this.destroy(); });
            this.player = undefined;
            this.door = undefined;
            this.key = undefined;
            this.breakable = [];
            this.solids = [];
            this.deadly = [];
            this.rest = [];
        },
        typeOf: function(x,y){
            if(x>=0 && x<Game.grid.w){
                if(y>=0 && y<Game.grid.h){
                    for(var c in this.solids){
                        var pos = this.solids[c].at();
                        if(pos.x == x && pos.y == y){
                            return "solid"
                        }
                    }
                    for(var c in this.breakable){
                        var pos = this.breakable[c].at();
                        if(pos.x == x && pos.y == y){
                            if(this.breakable[c].isTriggered){
                                if(this.breakable[c].isBroken){
                                    return "free";
                                } else {
                                    return "triggered";
                                }
                            }
                            return "breakable"
                        }
                    }
                    return "free";
                }
            }
            return "solid"
        },
        triggerBreakable: function(pos){
            for(var c in this.breakable){
                if(!this.breakable[c].isBroken){
                    var bpos = this.breakable[c].at();
                    if(bpos.x == pos.x && bpos.y == pos.y){
                        this.breakable[c].trigg();
                    }
                }
            }
        },
        killBreakable: function(pos){
            for(var c in this.breakable){
                if(!this.breakable[c].isBroken){
                    var bpos = this.breakable[c].at();
                    if(bpos.x == pos.x && bpos.y == pos.y){
                        this.breakable[c].kill();
                    }
                }
            }
        },
        touchedDeadly: function(pos){
            for(var c in this.deadly){
                var dpos = this.deadly[c].at();
                if(dpos.x == pos.x && dpos.y == pos.y){
                    return true;
                }
            }
            return false;
        }
    },

    levelLoad: function(){
        Game.level.clear();
        if(Game.textVictory !== undefined){
            Game.textVictory.destroy();
            Game.textVictory = undefined;
        }
        if(Game.textFailure !== undefined){
            Game.textFailure.destroy();
            Game.textFailure = undefined;
        }
        if(Game.textStopToReset != undefined) {
            Game.textStopToReset.destroy();
            Game.textStopToReset = undefined;
        }
        for(var y in Game.level.t){
            for(var x in Game.level.t[y]){
                //blank = 0, brick = 1, brickMoss = 2, grass = 3, door = 4, key = 5, stone = 6, stoneMoss = 7, stoneBreak = 8, spikeUp = 9, spikeLeft = 10, spikeDown = 11, spikeRight = 12, player = 13
                switch(Game.level.t[y][x]){
                    case 0:
                        break;
                    case 1:
                        Game.level.solids.push(Crafty.e("Brick").at(x,y));
                        break;
                    case 2:
                        Game.level.solids.push(Crafty.e("BrickMoss").at(x,y));
                        break;
                    case 3:
                        Game.level.rest.push(Crafty.e("Grass").at(x,y));
                        break;
                    case 4:
                        Game.level.door = Crafty.e("Door").at(x,y);
                        break;
                    case 5:
                        Game.level.key = Crafty.e("Key").at(x,y);
                        break;
                    case 6:
                        Game.level.solids.push(Crafty.e("Stone").at(x,y));
                        break;
                    case 7:
                        Game.level.solids.push(Crafty.e("StoneMoss").at(x,y));
                        break;
                    case 8:
                        Game.level.breakable.push(Crafty.e("StoneBreak").at(x,y));
                        break;
                    case 9:
                        Game.level.deadly.push(Crafty.e("Spike").rot("up").at(x,y));
                        break;
                    case 10:
                        Game.level.deadly.push(Crafty.e("Spike").rot("left").at(x,y));
                        break;
                    case 11:
                        Game.level.deadly.push(Crafty.e("Spike").rot("down").at(x,y));
                        break;
                    case 12:
                        Game.level.deadly.push(Crafty.e("Spike").rot("right").at(x,y));
                        break;
                    case 13:
                        Game.level.player = Crafty.e("Player").at(x,y);
                        break;
                }

            }
        }
        var playerpos = Game.level.player.at();
        if(Game.level.typeOf(playerpos.x,playerpos.y+1) == "free"){
            Game.level.player.inAir = true;
        }
        if(Game.level.typeOf(playerpos.x,playerpos.y+1) == "breakable"){
            Game.level.triggerBreakable({x:playerpos.x,y:playerpos.y+1});
        }
    },
    // The total width of the game screen. Since our grid takes up the entire screen
    // this is just the width of a tile times the width of the grid
    width: function() {
        return this.grid.w * this.grid.t.w;
    },

    // The total height of the game screen. Since our grid takes up the entire screen
    // this is just the height of a tile times the height of the grid
    height: function() {
        return this.grid.h * this.grid.t.h;
    },

    // Initialize and start our game
    start: function() {

        Crafty.init(Game.width(), Game.height());
        Crafty.background('#4fc4ff url(img/bck.png)');

        Crafty.sprite()
        Crafty.scene("loading", function() {
            Crafty.e("2D, DOM, Text").attr({ x: Game.width()/2-30, y:  Game.height()/2 }).text("Loading");
            Crafty.load(['img/spritesheet.png','img/tileset.png', 'snd/crumble.mp3', 'snd/died.mp3', 'snd/footstep.mp3', 'snd/victory.mp3', 'snd/collect.mp3', 'snd/grunt.mp3'], function() {

                Crafty.audio.add("crumble", "snd/crumble.mp3");
                Crafty.audio.add("died", "snd/died.mp3");
                Crafty.audio.add("footstep", "snd/footstep.mp3");
                Crafty.audio.add("victory", "snd/victory.mp3");
                Crafty.audio.add("collect", "snd/collect.mp3");
                Crafty.audio.add("grunt","snd/grunt.mp3");
                Crafty.sprite(16,'img/spritesheet.png',{
                    spr_player: [0,0]
                },0,0);
                Crafty.sprite(16,'img/tileset.png',{
                    spr_blank: [0,0],
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
                });
                Crafty.scene("main"); //when everything is loaded, run the main scene
            },
            function(e) {
                //progress
            },

            function(e) {
                //uh oh, error loading
                console.log("Error loading images and sounds");
            });

        });
        Crafty.scene("loading");

        Crafty.scene("main", function(){
            Game.level.t = l.t;
            Game.levelLoad();
            var ticker = Crafty.e("Ticker");
        });
    }
};