'use strict';

function SketchLine(numberOfVertices, easeFactor, speedFactor, colors, p, art) {

  var curveVertices = [];
  var distances = [];
  var endPoints = [];
  var colorIndex = 0;

  for (var i = 0; i < numberOfVertices; i++) {
    curveVertices[i] = p.createVector(p.mouseX, p.mouseY);
    distances[i] = p.createVector(0, 0);
    endPoints[i] = p.createVector(0, 0);
  }

  this.update = function() {
    colorIndex = (colorIndex < colors.length) ? colorIndex + 1 : 0;
    for (var i = 0; i < numberOfVertices; i++) {
      distances[i].x = (i === 0) ? p.mouseX - curveVertices[0].x : curveVertices[i - 1].x - curveVertices[i].x;
      distances[i].y = (i === 0) ? p.mouseY - curveVertices[0].y : curveVertices[i - 1].y - curveVertices[i].y;
      distances[i].mult(easeFactor);
      endPoints[i].add(distances[i]);
      curveVertices[i].add(endPoints[i]);
      endPoints[i].mult(speedFactor);
    }
  };

  this.render = function() {
    art.beginShape();
    for (var i = 0; i < numberOfVertices; i++) {
      art.noFill();
      art.strokeWeight(1);
      var c = colors[colorIndex];
      art.blendMode(art.ADD);
      if (p.random(1) > 0.5) {
        art.blendMode(art.BLEND);
      }
      art.stroke(c[0], c[1], c[2], 255 / 20);
      art.curveVertex(curveVertices[i].x, curveVertices[i].y);
    }
    art.endShape();
  };
}

var s = function(p) {

  var lines = [];
  var colors = [];
  var src, canvas, art;

  p.clearme = function() {
    art.clear();
    art.background(0);
  };

  p.saveme = function() {
    art.get().save('neobrush-' + Date.now() + '.png');
  };

  p.updateSource = function(colorSource) {
    colors = [];
    src = p.loadImage(colorSource, function(img) {
      for (var x = 0; x < src.width; x++) {
        for (var y = 0; y < src.height; y++) {
          colors.push(img.get(x, y));
        }
      }
    });
  };

  p.mousePressed = function() {
    for (var i = 0; i < p.ui.numberOfLines; i++) {
      var easing = p.ui.easing + p.random(-p.ui.easingJitter, p.ui.easingJitter);
      var speed = p.ui.speed + p.random(-p.ui.speedJitter, p.ui.speedJitter);
      var vertices = p.ui.vertices + p.random(-p.ui.verticesJitter, p.ui.verticesJitter);
      var line = new SketchLine(vertices, easing, speed, colors, p, art);
      lines.push(line);
    }
  };

  p.mouseReleased = function() {
    lines = [];
  };

  p.setup = function() {
    p.pixelDensity(1);
    p.background(0);
    p.updateSource('img/source-0.jpg');

    canvas = p.createCanvas(975, 700);
    canvas.parent('neobrush');

    art = p.createGraphics(canvas.width, canvas.height);
    art.background(0);
  };

  p.draw = function() {
    p.background(0);
    for (var i = 0; i < lines.length; i++) {
      lines[i].update();
      lines[i].render();
    }
    p.image(art, 0, 0, canvas.width, canvas.height);
  };
};

var sketch = new p5(s);
