import Point from './src/Point.js';
import Box from './src/Box.js';
import Character from './src/Character.js';
import Gameboard from './src/Gameboard.js';
import TargetingSystem from './src/TargetingSystem.js';

const waldosBox = new Box(new Point(1832, 1145), new Point(1913, 1296));
const Waldo = new Character('Waldo', waldosBox);

const yellowBathingSuitManBox = new Box(new Point(742, 668), new Point(798,877));
const YellowBathingSuitMan = new Character('Yellow Bathing Suit Man', yellowBathingSuitManBox);

const characters = [Waldo, YellowBathingSuitMan];

const gameboards = [ new Gameboard('../waldo-1.jpg', characters) ];
const activeBoard = gameboards[0];
const gameboardDiv = document.querySelector('.gameboard');
const gameboardImage = document.querySelector('.gameboard img');

gameboardImage.src = activeBoard.getImage();

const targetingSystem = new TargetingSystem();

function gameboardClicked (point) {
  const characterClicked = activeBoard.clicked(point);

  return function characterSelected(characterName) {
    if (characterClicked === null || characterClicked.getName() !== characterName) {
      console.log('Keep looking!');
      return;
    } 

    console.log('You found him!');
  }
}

gameboardDiv.appendChild(targetingSystem.getTarget());
gameboardDiv.appendChild(targetingSystem.getCharacterList(activeBoard.getCharacters()));

const target = targetingSystem.getTarget();
const characterList = targetingSystem.getCharacterList(activeBoard.getCharacters());

gameboardDiv.appendChild(target);
gameboardDiv.appendChild(characterList);

gameboardDiv.addEventListener('pointermove', (e) => {
  if (e.target !== gameboardImage) {
    return;
  }

  const point = new Point(e.offsetX, e.offsetY);

  requestAnimationFrame(() => {
    target.drawTarget(point);
  });
});

gameboardDiv.addEventListener('click', (e) => {
  const point = new Point(e.offsetX, e.offsetY);

  if (e.target === gameboardImage) {
    if (targetingSystem.getMode() === 'select') {
      characterList.hideCharacterList();
      target.drawTarget(point);
    } else {
      const characterSelected = gameboardClicked(point);
      characterList.drawCharacterList(point, characterSelected);
    }
  }

});