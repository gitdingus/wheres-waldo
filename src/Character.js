class Character {
  constructor(name, box, image = '') {
    this.name = name;
    this.box = box;
    this.image = image;
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

  getCoordinates() {
    return this.box;
  }

  getImage() {
    return this.image;
  }
}

export default Character;