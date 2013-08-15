class  SketchLine {

  int numberOfPoints;
  PVector[] points, deltas, controlPoints;
  float[] easeFactor, speedFactor;

  SketchLine(int _numberOfPoints, float _easeFactor, float _speedFactor) {
    numberOfPoints = _numberOfPoints;
    points = new PVector[numberOfPoints];
    deltas = new PVector[numberOfPoints];
    controlPoints = new PVector[numberOfPoints];
    easeFactor = new float[numberOfPoints];
    speedFactor = new float[numberOfPoints];
    for (int i = 0; i < numberOfPoints; i++) {
      easeFactor[i] = _easeFactor * (0.07 * (i + 1));
      speedFactor[i] = _speedFactor - (0.02 * i);
    }
  }

  void reset() {
    for (int i=0; i < numberOfPoints; i++) {
      points[i] = new PVector(mouseX, mouseY);
      deltas[i] = new PVector();
      controlPoints[i] = new PVector();
    }
  }

  void render() { 
    for (int i = 0; i < numberOfPoints; i++) {
      deltas[i].x = (i == 0) ? mouseX - points[i].x : points[i-1].x - points[i].x;
      deltas[i].y = (i == 0) ? mouseY - points[i].y : points[i-1].y - points[i].y;
      deltas[i].mult(easeFactor[i]);
      controlPoints[i].add(deltas[i]);
      points[i].add(controlPoints[i]);
      controlPoints[i].mult(speedFactor[i]);
    }
    beginShape();
    for (int i = 0; i < numberOfPoints; i++) {
      strokeWeight(1.5);
      stroke(src.get((int) points[i].x, (int) points[i].y), 50);
      //if (random(1) > 0.95) stroke(0, 60);
      curveVertex(points[i].x, points[i].y);
    }
    endShape();
  }
}

