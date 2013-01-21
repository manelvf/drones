var gameData = {
  restart: false,
  canvas: null,
  screenW: null,
  screenH: null,
  ctx:false,
  FPS:0,
  FPSCounter:0,
  enemies: [],
  rocks: [],
  killList: [],
  ship: null,
  eventTime: 0,
  curTime: 0,
  PPS: 200, // pixels per second
  score: 0,
  nofRocks: 20,
  nofEnemies: 5,
  mouseX: null,
  mouseY: null,
  content: []
}

var Game = {
  polygon:Polygon,
  startFPS: function() {
    Game.FPS = Game.FPSCounter;
    Game.FPSCounter = 0;
  },
  drawFPS: function() {
    Game.ctx.strokeText(Game.FPS+" FPS // SCORE: " + zeropad(Game.score,7), 30,30);
  }
};


function rand(min, max, decimals) {
  var d = max-min;
  if (decimals)
    return (Math.random() * d) + min;
  else
    return Math.round((Math.random() * d) + min);
}


window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})();

xxx = Math.PI*0.5;

function init(sx,sy) {
  var p,k;

  Game = $.extend(Game,gameData);
  Game.enemies = [];
  Game.rocks = [];

  // rocks
  for (k = 0; k<Game.nofRocks; k++) {
    Game.rocks.push(rockCreate());
  }

  // enemies 
  for (k = 0; k<Game.nofEnemies; k++) {
    tx = rand(0, innerWidth);
    ty = rand(0, innerHeight);
    f = 4;
    p = new Game.polygon(f,tx,ty,30, "source-over","rgb(250,50,50)",50);
    p.movement = p.shipMovement(Math.PI/2);
    p.checkHit = p.rockCheckHit;
    p.finish = p.enemyFinish;
    Game.enemies.push(p);
  }

  Game.ship = new Game.polygon(3, sx, sy, 30, "source-over", "rgb(50,100,200)");
  Game.ship.movement = Game.ship.shipMovement((7.6/6.6)*Math.PI); // movement handler

  //Game.bgPattern = doPattern(); // create a background pattern

  startEvents();

  if (Game.intervalFPS)
    window.clearInterval(Game.intervalFPS);
  Game.intervalFPS = window.setInterval(Game.startFPS,1000);
  cycle();
}


function cycle() {

  Game.bgPattern.draw(); 


  Game.killList = [];
  for(k=0; k< Game.rocks.length; k++) {
    Game.rocks[k].draw();
    if (Game.rocks[k].checkHit(Game.ship)) {
      Game.rocks[k].finish(Game.rocks,k, rockCreate());
    }
  }

  /*
  for(k=0; k<Game.killList.length; k++) {
    console.log(Game.killList);
    delete Game.rocks[Game.killList[k]];
    Game.rocks.splice(Game.killList[k], 1);
  }
  */

  for(k=0; k< Game.enemies.length; k++) {
    Game.enemies[k].goNear(Game.ship.ox,Game.ship.oy);
    Game.enemies[k].draw();
    if (Game.enemies[k].checkHit(Game.ship)) {
      Game.enemies[k].finish();
    }
  }
  Game.ship.draw();

  Game.drawFPS();
  Game.FPSCounter++;

  var c = Date.now();
  Game.eventTime = c - Game.curTime;
  Game.curTime = Date.now(); 

  if (Game.restart) {
    drawTitleScreen(true);
  } else {
    requestAnimFrame( function() {
      cycle();
    });
  }

}


Zepto(function($) {
  var i,j,k,f,s;
  var tx, ty;

  gameData.screenW = innerWidth;
  gameData.screenH = innerHeight;

  gameData.canvas = $("<canvas width='"+ innerWidth +"px' height='"+ innerHeight +"px'></canvas>");
  $('body').append(gameData.canvas);

  if (gameData.canvas[0].getContext) {
    gameData.ctx = gameData.canvas[0].getContext("2d");
    gameData.bgPattern = doPattern(gameData.ctx); // create a background pattern
    drawTitleScreen();
  }

});

function drawTitleScreen(restart) {
  var ctx = gameData.ctx;

  gameData.bgPattern.draw(); 
  //ctx.beginPath();
  ctx.fillStyle = "rgba(100, 100, 255, 0.8)";
  if (restart) {
    ctx.font = "25pt Verdana";
    ctx.fillText("Want More?", gameData.screenW * 0.44, 100);
    ctx.font = "20pt Verdana";
    ctx.fillText("Click to RESTART the War Again", gameData.screenW * 0.37, 140);
  } else {
    ctx.font = "25pt Verdana";
    ctx.fillText("Click to Start the War", gameData.screenW * 0.39, 100);
    ctx.font = "20pt Verdana";
    ctx.fillText("then Just Kill All the Humans and Survive", gameData.screenW * 0.33, 140);
  }

  $(gameData.canvas).off("click");
  $(gameData.canvas).on("click", function(e) {
    init(e.offsetX,e.offsetY);
  });

}

function startEvents() {
  Game.canvas.off('mousemove');
  Game.canvas.on('mousemove', function(e) {
    Game.ship.goNear(e.offsetX,e.offsetY);
  });
}


function doPattern(ctx) {
  var ctx = ctx || Game.ctx;

  var pattern = document.createElement('canvas');

  pattern.width = 64;
  pattern.height = 64;

  var pctx = pattern.getContext('2d');

  pctx.fillStyle = "rgb(255,255,200)";
  pctx.fillRect(0,0,64,64);

  pctx.strokeStyle = "rgb(255,255,255)";
  pctx.lineWidth = 3;

  pctx.beginPath();
  pctx.moveTo(0,0);
  pctx.lineTo(64,64);
  pctx.closePath();
  pctx.stroke();
  
  pctx.beginPath();
  pctx.moveTo(32,0);
  pctx.lineTo(64,32);
  pctx.closePath();
  pctx.stroke();

  pctx.beginPath();
  pctx.moveTo(0,32);
  pctx.lineTo(32,64);
  pctx.closePath();
  pctx.stroke();

  var pattern = ctx.createPattern(pattern, "repeat");

  return {
    draw: function() {
      ctx.beginPath();
      ctx.fillStyle = pattern;
      ctx.fillRect(0,0, Game.screenW, Game.screenH);
    }
  }
}

function zeropad(v,n) {
  z = n-String(v).length;
  s = "";
  for (var c = 0; c < z; c++) {
    s += "0";
  }
  return s+v;
}
