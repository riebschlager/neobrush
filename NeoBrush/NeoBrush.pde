SketchLine[] lines = new SketchLine[100];
PImage src;

void setup() {
  size(displayWidth, displayHeight);
  src = loadImage("http://img.ffffound.com/static-data/assets/6/6c71f3bfc54328f50fcbc58bb2f2e4d91e038655_m.jpg");
  src.resize(width, height);
  for (int i = 0; i < lines.length; i++) {
    lines[i] = new SketchLine((int) random(5, 40), random(0.1, 0.4), random(0.5, 0.85));
  }
  background(0);
  noFill();
}

void draw() {
  if (mousePressed) { 
    for (int i = 0; i < lines.length; i++) {
      lines[i].render();
    }
  }
}

void mousePressed() {
  for (int i = 0; i < lines.length; i++) {
    lines[i].reset();
  }
}

void keyPressed() {
  if (key == ' ') {
    background(0);
  }
  if (key == 's') {
    String fileName = "data/output/composition-" + month() + "-" + day() + "-" + hour() + "-" + minute() + "-" + second() + ".png";
    save(fileName);
    println("Saved: " + fileName);
  }
}

