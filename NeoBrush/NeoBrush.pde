import java.util.*;
import controlP5.*;

ArrayList<SketchLine> lines = new ArrayList<SketchLine>();
PImage src;
int videoFrame = 0;
ControlPanel controlPanel;
PGraphics canvas;
boolean showSource = false;

// The Tweakables

float lineWeight = 1f;
float lineAlpha = 100f;
float easeMin = 0.01f;
float easeMax = 0.5f;
float speedMin = 0.5f;
float speedMax = 0.75f;
int numberOfLines = 100;
int numberOfVerticesMin = 5;
int numberOfVerticesMax = 10;

void setup() {
  src = loadImage("http://a1.s6img.com/cdn/box_005/post_15/701220_4692744_lz.jpg");
  src.resize(src.width * 3, src.height * 3);
  size(src.width/2, src.height/2);
  background(0);
  controlPanel = new ControlPanel(this);
  canvas = createGraphics(src.width, src.height);
  canvas.beginDraw();
  canvas.clear();
  canvas.endDraw();
}

void draw() {
  background(0);


  if (showSource) image(src, 0, 0, width, height);

  image(canvas, 0, 0, width, height);
  if (mousePressed && !controlPanel.cp5.isVisible()) { 
    canvas.beginDraw();
    for (SketchLine line : lines) {
      line.update();
      line.render();
    }
    canvas.endDraw();
    //saveFrameForVideo();
  }
}

void mousePressed() {
  for (int i = 0; i < numberOfLines; i++) {
    lines.add(new SketchLine(ceil(random(numberOfVerticesMin, numberOfVerticesMax)), random(easeMin, easeMax), random(speedMin, speedMax)));
  }
}

void mouseReleased() {
  lines.clear();
}

void keyPressed() {
  if (key == ' ') {
    canvas.beginDraw();
    canvas.clear();
    canvas.endDraw();
  }
  if (key == 's') {
    String fileName = "data/output/composition-" + month() + "-" + day() + "-" + hour() + "-" + minute() + "-" + second() + ".png";
    canvas.save(fileName);
    println("Saved: " + fileName);
  }
  if (key == 'c') {
    controlPanel.toggle();
  }
  if (key == 'z') {
    showSource = !showSource;
  }
}

void saveFrameForVideo() {
  String index = nf(videoFrame, 5);
  saveFrame("data/video/" + index + ".tif");
  videoFrame++;
}

