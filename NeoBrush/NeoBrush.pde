import java.util.*;

int numberOfLines = 100;
ArrayList<SketchLine> lines = new ArrayList<SketchLine>();
PImage src;
int videoFrame = 0;

void setup() {
  size(1280, 720);
  src = loadImage("http://24.media.tumblr.com/3a6f7196adf7bac67abf36f9dbfdd836/tumblr_mrmy0moOEa1qz6f9yo1_500.jpg");
  src.resize(width, height);
  background(0);
  noFill();
}

void draw() {
  if (mousePressed) { 
    for (SketchLine line : lines) {
      line.update();
      line.render();
    }
    //saveFrameForVideo();
  }
}

void mousePressed() {
  for (int i = 0; i < numberOfLines; i++) {
    lines.add(new SketchLine(10, 0.05 + random(-0.01, 0.01), 0.5  + random(-0.2, 0.2)));
  }
}

void mouseReleased() {
  lines.clear();
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

void saveFrameForVideo() {
  String index = nf(videoFrame, 5);
  saveFrame("data/video/" + index + ".tif");
  videoFrame++;
}

