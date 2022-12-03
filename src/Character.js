class Character {
  constructor(name, box) {
    this.name = name;
    this.box = box;
    this.found = false;
  }

  wasClicked(point) {
    if (this.box.pointInBox(point)) {
      return true;
    }
    return false;
  }

  setFound(found) {
    this.found = found;
  }

  wasFound() {
    return this.found;
  }

  getName() {
    return this.name;
  }
}

export default Character;