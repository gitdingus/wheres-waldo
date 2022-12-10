import { appendChildren } from 'dom-utils';
import Point from './Point.js';

class TargetingSystem {
  constructor() {
    this.mode = 'find';
    this.targetElement = null;
    this.targetPoint = new Point(0,0);
    this.characterList = null;
    this.characterListPoint = new Point(0,0);
  }

  getTarget() {
    const target = document.createElement('div');
    const bullseye = document.createElement('div');

    target.classList.add('target');
    bullseye.classList.add('bullseye');

    target.appendChild(bullseye);

    target.drawTarget = (point) => {
      if (this.mode !== 'find') return;

      target.style.left = `${point.x}px`;
      target.style.top = `${point.y}px`;
    }
    
    this.targetElement = target;
    return this.targetElement;
  }

  getCharacterList(list) {
    const listOfTargetsDiv = document.createElement('div');
    const characterDivs = list.map((character) => {
      const div = document.createElement('div');
      div.classList.add('character');
      div.setAttribute('data-character-name', character.getName());
      if (character.wasFound() === true) {
        div.classList.add('found');
      }

      div.textContent = character.getName();

      return div;
    });

    appendChildren(listOfTargetsDiv, characterDivs);
    listOfTargetsDiv.classList.add('character-list');

    const _updateCharacterDivs = () => {
      characterDivs.forEach((characterDiv) => {
        const character = list.find((char) => char.getName() === characterDiv.getAttribute('data-character-name'));
      
        if (character.wasFound() === true) {
          characterDiv.classList.add('found');
        }
      });
    }

    const characterSelected = (e) => {
      this._characterSelectedCallback(e.target.getAttribute('data-character-name'));
      listOfTargetsDiv.hideCharacterList();
      this.targetElement.drawTarget(new Point(e.pageX, e.pageY));
    };

    listOfTargetsDiv.drawCharacterList = (point, characterListCallback) => {
      this.mode = 'select';
      _updateCharacterDivs();
      this.characterList.classList.add('active');
      this._characterSelectedCallback = characterListCallback;
      listOfTargetsDiv.style.left = `${point.x}px`;
      listOfTargetsDiv.style.top = `${point.y}px`;

      listOfTargetsDiv.addEventListener('click', characterSelected);

    }

    listOfTargetsDiv.hideCharacterList = () => {
      this.mode = 'find';
      listOfTargetsDiv.removeEventListener('click', this._characterSelectedCallback);

      listOfTargetsDiv.classList.remove('active');
    }

    this.characterList = listOfTargetsDiv;

    return this.characterList;
  }

  getMode() {
    return this.mode;
  }

}

export default TargetingSystem;
