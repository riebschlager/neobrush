SketchLine[] lines = new SketchLine[100];
PImage src;
int videoFrame = 0;

void setup() {

  src = loadImage("http://img.ffffound.com/static-data/assets/6/4e4eb75891ed176d307d84d3a3506f70a001bd20_m.jpg");
  src.resize(src.width * 2, src.height * 2);
  size(src.width, src.height);
  for (int i = 0; i < lines.length; i++) {
    lines[i] = new SketchLine((int) random(5, 40), random(0.1, 0.4), random(0.5, 0.75));
  }
  background(0);
  noFill();
}

void draw() {
  if (mousePressed) { 
    for (int i = 0; i < lines.length; i++) {
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

