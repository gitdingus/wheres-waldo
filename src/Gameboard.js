class Gameboard {
  constructor (imageSrc, characters) {
    this.imageSrc = imageSrc;
    this.characters = characters;
  }

  clicked(point) {
    const clickedCharacter = this.characters.find((character) => character.wasClicked(point));
    if (clickedCharacter !== undefined) {
      return clickedCharacter;
    }

    return null;
  }

  getImage() {
    return this.imageSrc;
  }

  getCharacterNames() {
    const characterNames = this.characters.map((character) => character.getName());

    return characterNames;
  }

  getCharacters() {
    return this.characters;
  }

  allCharactersFound() {
    return this.characters.every((character) => character.wasFound() === true);
  }
}

export default Gameboard;