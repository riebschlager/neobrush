class  SketchLine {

  int vertices;
  PVector[] startPoints, deltas, endPoints;
  float easeFactor, speedFactor;

  SketchLine(int _vertices, float _easeFactor, float _speedFactor) {
    vertices = _vertices;
    easeFactor = _easeFactor;
    speedFactor = _speedFactor;
    startPoints = new PVector[vertices];
    deltas = new PVector[vertices];
    endPoints = new PVector[vertices];
  }

  void reset() {
    for (int i = 0; i < vertices; i++) {
      startPoints[i] = new PVector(mouseX, mouseY);
      deltas[i] = new PVector();
      endPoints[i] = new PVector();
    }
  }

  void update() {    
    for (int i = 0; i < vertices; i++) {
      deltas[i].x = (i == 0) ? mouseX - startPoints[i].x : startPoints[i-1].x - startPoints[i].x;
      deltas[i].y = (i == 0) ? mouseY - startPoints[i].y : startPoints[i-1].y - startPoints[i].y;
      deltas[i].mult(easeFactor);
      endPoints[i].add(deltas[i]);
      startPoints[i].add(endPoints[i]);
      endPoints[i].mult(speedFactor);
    }
  }

  void render() { 
    beginShape();
    for (int i = 0; i < vertices; i++) {
      strokeWeight(1);
      stroke(src.get((int) startPoints[i].x, (int) startPoints[i].y), 30);
      if (random(1) > 0.95) {
        strokeWeight(0.1);
        stroke(0);
      }
      curveVertex(startPoints[i].x, startPoints[i].y);
    }
    endShape();
  }
}

