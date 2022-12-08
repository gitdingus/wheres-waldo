class Box {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }

  pointInBox (p) {
    if (p.x >= this.p1.x 
      && p.x <= this.p2.x
      && p.y >= this.p1.y
      && p.y <= this.p2.y) {
        return true;
    }

    return false;
  }

  getPointOne() { 
    return this.p1;
  }

  getPointTwo() {
    return this.p2;
  }
}

export default Box;