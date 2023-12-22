class Pig extends RedBird {
  constructor(x, y, r, img) {
    super(x, y, r, img);
    this.type = "pig";
  }

  show() {
    const pos = this.body.position;
    const angle = this.body.angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    imageMode(CENTER);
    image(PigImg, 0, 0, this.r * 2.4, this.r * 2.4);
    pop();
  }
}
