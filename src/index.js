import Point from './Point.js';
import Box from './Box.js';
import Character from './Character.js';
import Gameboard from './Gameboard.js';
import TargetingSystem from './TargetingSystem.js';
import waldo1 from './images/waldo-1.jpg';
import firebaseConfig from './config/firebase-config.js';
import { initializeApp } from 'firebase/app';
import Login from './Login.js';
import Auth from './firebaseAuth.js';
import Game from './Game.js';

import './style.css';

const firebaseApp = initializeApp(firebaseConfig);

const auth = new Auth(firebaseApp, authChanged);

async function authChanged (user) {
  if (user === null) {
    return;
  }
  const loginDiv = document.querySelector('#login');

  while (loginDiv.firstElementChild !== null) {
    loginDiv.firstElementChild.remove();
  }
  
  if (user.isAnonymous) {
    console.log('user is anonymous');
    loginDiv.appendChild(Login.getLoginScreen(auth.signIn));
  } else if (user !== null && user.isAnonymous === false) {
    console.log('user logged in');
    loginDiv.appendChild(Login.getWelcomeScreen(user.email, auth.signOut));
  
    const role = await auth.getAccountType();

    console.log(role);
    if (role === 'administrator') {
      loginDiv.appendChild(Login.getAdminLinks());
    }
  }

  const content = document.querySelector('.content');
  content.appendChild(await Game.getGameboardsElement(firebaseApp));
}

window.addEventListener('beforeunload', async () => {
  if (auth.getUser().isAnonymous) {
    await auth.deleteAnonymousUser();
  }
});


const waldosBox = new Box(new Point(1832, 1145), new Point(1913, 1296));
const Waldo = new Character('Waldo', waldosBox);

const yellowBathingSuitManBox = new Box(new Point(742, 668), new Point(798,877));
const YellowBathingSuitMan = new Character('Yellow Bathing Suit Man', yellowBathingSuitManBox);

const characters = [Waldo, YellowBathingSuitMan];

const gameboards = [ new Gameboard(waldo1, characters) ];
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

  const point = new Point(e.pageX, e.pageY);

  requestAnimationFrame(() => {
    target.drawTarget(point);
  });
});

gameboardDiv.addEventListener('click', (e) => {
  const gameboardPoint = new Point(e.offsetX, e.offsetY);
  const pagePoint = new Point(e.pageX, e.pageY);

  if (e.target === gameboardImage) {
    if (targetingSystem.getMode() === 'select') {
      characterList.hideCharacterList();
      target.drawTarget(pagePoint);
    } else {
      const characterSelected = gameboardClicked(gameboardPoint);
      characterList.drawCharacterList(pagePoint, characterSelected);
    }
  }

});