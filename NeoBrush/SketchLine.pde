class SketchLine {

  int numberOfVertices;
  PVector[] curveVertices, distances, endPoints;
  float easeFactor, speedFactor;

  SketchLine(int _numberOfVertices, float _easeFactor, float _speedFactor) {
    numberOfVertices = _numberOfVertices;
    easeFactor = _easeFactor;
    speedFactor = _speedFactor;
    curveVertices = new PVector[numberOfVertices];
    distances = new PVector[numberOfVertices];
    endPoints = new PVector[numberOfVertices];
    for (int i = 0; i < numberOfVertices; i++) {
      curveVertices[i] = new PVector(map(mouseX, 0, width, 0, src.width), map(mouseY, 0, height, 0, src.height));
      distances[i] = new PVector();
      endPoints[i] = new PVector();
    }
  }

  void update() {    
    for (int i = 0; i < numberOfVertices; i++) {
      float mappedMouseX = map(mouseX, 0, width, 0, src.width);
      float mappedMouseY = map(mouseY, 0, height, 0, src.height);
      distances[i].x = (i == 0) ? mappedMouseX - curveVertices[0].x : curveVertices[i-1].x - curveVertices[i].x;
      distances[i].y = (i == 0) ? mappedMouseY - curveVertices[0].y : curveVertices[i-1].y - curveVertices[i].y;
      distances[i].mult(easeFactor);
      endPoints[i].add(distances[i]);
      curveVertices[i].add(endPoints[i]);
      endPoints[i].mult(speedFactor);
    }
  }

  void render() {
    canvas.beginShape();
    for (int i = 0; i < numberOfVertices; i++) {
      canvas.noFill();
      canvas.strokeWeight(lineWeight);
      int r = floor(numberOfVertices / 2);
      int c = src.get((int) constrain(curveVertices[r].x, 0, src.width - 1), (int) constrain(curveVertices[r].y, 0, src.height - 1));
      canvas.stroke(c, lineAlpha);
      canvas.curveVertex(curveVertices[i].x, curveVertices[i].y);
    }
    canvas.endShape();
  }
}

