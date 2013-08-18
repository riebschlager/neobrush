//float lineWeight = 1.5f;
//float lineAlpha = 50f;
//float easeMin = 0.01f;
//float easeMax = 0.05f;
//float speedMin = 0.1f;
//float speedMax = 0.9f;
//int numberOfLines = 100;
//int numberOfVerticesMin = 4;
//int numberOfVerticesMax = 100;

class ControlPanel {

  ControlP5 cp5;

  ControlPanel(PApplet app) {
    int r = 10;
    int s = 40;
    int l = 10;
    cp5 = new ControlP5(app);
    cp5.addNumberbox("lineWeight").setPosition(l, r += s).setRange(0.1f, 10f).setMultiplier(0.01f);
    cp5.addNumberbox("lineAlpha").setPosition(l, r += s).setRange(0f, 255f).setMultiplier(1f);
    cp5.addNumberbox("easeMin").setPosition(l, r += s).setRange(0.01f, 0.1f).setMultiplier(0.0001).setDecimalPrecision(4);
    cp5.addNumberbox("easeMax").setPosition(l, r += s).setRange(0.01f, 0.1f).setMultiplier(0.0001).setDecimalPrecision(4);
    cp5.addNumberbox("speedMin").setPosition(l, r += s).setRange(0.01f, 0.9f).setMultiplier(0.0001).setDecimalPrecision(4);
    cp5.addNumberbox("speedMax").setPosition(l, r += s).setRange(0.01f, 0.9f).setMultiplier(0.0001).setDecimalPrecision(4);
    cp5.addNumberbox("numberOfLines").setPosition(l, r += s).setRange(1, 500);
    cp5.addNumberbox("numberOfVerticesMin").setPosition(l, r += s).setRange(4, 200);
    cp5.addNumberbox("numberOfVerticesMax").setPosition(l, r += s).setRange(4, 200);
    toggle();
  }

  void toggle() {
    if (cp5.isVisible()) cp5.hide();
    else cp5.show();
  }
}

