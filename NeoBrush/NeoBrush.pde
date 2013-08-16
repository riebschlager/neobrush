SketchLine[] lines = new SketchLine[50];
PImage src;
int videoFrame = 0;

void setup() {
  size(1280, 720);
  src = loadImage("http://img.ffffound.com/static-data/assets/6/ff6788911ac9b76ad2b15d62672759e79c9c9c01_m.jpg");
  src.resize(width, height);
  background(0);
  noFill();
}

void draw() {
  if (mousePressed) { 
    for (int i = 0; i < lines.length; i++) {
      lines[i].update();
      lines[i].render();
    }
    //saveFrameForVideo();
  }
}

void saveFrameForVideo() {
  String index = nf(videoFrame, 5);
  saveFrame("data/video/" + index + ".tif");
  videoFrame++;
}

void mousePressed() {
  for (int i = 0; i < lines.length; i++) {
    lines[i] = new SketchLine(10, random(0.075), random(0.75));
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

