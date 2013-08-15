SketchLine[] lines = new SketchLine[100];
PImage src;
int videoFrame = 0;

void setup() {
  size(1280, 720);
  src = loadImage("http://24.media.tumblr.com/b8391bad905418902cf8c52c8ec9988f/tumblr_mrjpostvqg1rdm4i9o2_500.jpg");
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

