Polygon = function(faces, ox, oy, side, composite, color,velocity) {
  this.points = [];
  this.center = null;
  this.faces = faces;
  this.ox = ox;
  this.oy = oy;
  this.rx = ox; // float
  this.ry = oy; //   
  this.composite=composite;
  this.side = side;
  this.startAngle = rand(0,2*Math.PI,true);
  this.toX = 0; // do not move on Start
  this.toY = 0;
  this.radius = side/(2*Math.sin(Math.PI/faces))
  this.radians = (2*Math.PI)/faces;
  this.contents = []; // list of functions
  this.velocity = velocity || Game.PPS;

  this.movement = function() {}; // function to move, can be overriden
  this.checkHit = function() {}; // function to move, can be overriden
  this.finish = function() {}; // function to move, can be overriden

  if (!color)
    this.color = "rgb("+rand(128,256)+","+rand(0,128)+","+rand(0,128)+")";
  else
    this.color = color;

}


Polygon.prototype.draw = function() {
  var ctx = Game.ctx;
  var f;
  var faces = this.faces;
  var side = this.side;
  var startAngle = this.startAngle;


  var pi = Math.PI;

  var r = (pi/2) + ((3*pi)/faces) + startAngle;

  this.movement();
  var ox = this.ox;
  var oy = this.oy;

  var sx = ox + (Math.cos(r) * this.radius);
  var sy = oy + (Math.sin(r) * this.radius);


  ctx.globalCompositeOperation = this.composite;

  ctx.beginPath();
  ctx.strokeStyle = "rgb(0,0,0)";
  ctx.beginPath();
  ctx.moveTo(sx,sy);
  ctx.lineTo(ox,oy);
  ctx.stroke();

  ctx.fillStyle = this.color;
  ctx.beginPath();
  ctx.moveTo(ox,oy);
  
  ctx.lineTo(sx,sy);

  cx = sx;
  cy = sy;
  this.points = [[cx,cy]];

  var curRadians = this.radians + startAngle;

  for (f=0; f < faces -1; f++) {
    cx += Math.cos(curRadians) * side;
    cy += Math.sin(curRadians) * side;

    this.points.push([cx,cy]);

    ctx.lineTo(cx,cy);
    curRadians -= this.radians;
  }
  ctx.fill();

  for (c = 0; c<this.contents.length; c++) {
    this.contents[c].call(this);
  }
}


Polygon.prototype.getCenter = function() {
  var k;
  var x = 0;
  var y = 0;
  for(k = 0; k<this.faces; k++) {
    x += this.points[k][0];
    y += this.points[k][1];
  } 
  return (Math.round(x/faces), Math.round(y/faces));
}


Polygon.prototype.goNear = function(toX, toY) {
  this.toX = toX;
  this.toY = toY;
}


Polygon.prototype.shipMovement = function(customAngle) {
  return function() {
    var dx = this.toX - this.rx;//Game.PPS)/clamp(Game.FPS,20);
    var dy = this.toY - this.ry;//(Game.PPS/clamp(Game.FPS,20);

    this.startAngle = Math.atan2(dy,dx) + customAngle;
    
    var d = Math.sqrt((dx*dx) + (dy*dy));
    if (d<2)
      return;
    var c = (this.velocity/clamp(Game.FPS,20));
    var dx = (dx/d) * c;
    var dy = (dy/d) * c;

    this.rx += dx;
    this.ry += dy;
    this.ox = Math.round(this.rx);
    this.oy = Math.round(this.ry);
  }
}




Polygon.prototype.humanContent = function() {
  var ctx = Game.ctx;
  //console.log(this, this.ox,this.oy);
  ctx.fillStyle = "rgb(255, 205, 100)";
  ctx.fillRect((this.ox) - 20, (this.oy) - 20, 40,40);

  ctx.fillStyle = "rgb(255, 255, 100)";
  ctx.beginPath();
  ctx.arc(this.ox,this.oy,12,0,Math.PI,false);   // Mouth (clockwise)
  ctx.moveTo(this.ox-10,this.oy-10);
  ctx.arc(this.ox-10,this.oy-10,5,0,Math.PI*2,true);  // Left eye
  ctx.moveTo(this.ox+10,this.oy-10);
  ctx.arc(this.ox+10,this.oy-10,5,0,Math.PI*2,true);  // Right eye
  ctx.stroke();
}

Polygon.prototype.rockCheckHit = function(ship) {
  var dx = ship.ox-this.ox;
  var dy = ship.oy-this.oy;
  if ((dx*dx) + (dy*dy) < 200)
    return true;
}


Polygon.prototype.rockFinish = function(list, n, newElement) {
  delete list[n];
  list[n] = newElement;

  Game.content.push(function() {
  });
  Game.score+=10;
}

Polygon.prototype.enemyFinish = function() {
  Game.restart = true;
}

Polygon.prototype.showHit = function() {
  ctx = Game.ctx;
  ctx.fillStyle = "rgba(0, 0, 255, 1)";
  ctx.fillText("HIT!", list[n].ox, list[n].ox);
}


var rockCreate = function() {
  var tx = rand(0, innerWidth);
  var ty = rand(0, innerHeight);
  var f = rand(4,10);
  var s = rand(20, 90);

  var p = new Game.polygon(f,tx,ty,80, "source-over",false);
  p.contents.push(p.humanContent);
  p.checkHit = p.rockCheckHit;
  p.finish = p.rockFinish;
  return p;
}


function clamp(number, limit) {
  if (number < limit )
    return limit;
  else 
    return number;
}
