import firebaseConfig from './config/firebase-config.js';
import { initializeApp } from 'firebase/app';
import Login from './Login.js';
import Auth from './firebaseAuth.js';
import Game from './Game.js';

import './style.css';

const firebaseApp = initializeApp(firebaseConfig);

const auth = new Auth(firebaseApp, authChanged);

const clearContentDiv = () => {
  const contentDiv = document.querySelector('.content');

  while (contentDiv.firstElementChild !== null) {
    contentDiv.firstElementChild.remove();
  }
}

async function authChanged (user) {
  if (user === null) {
    return;
  }
  const loginDiv = document.querySelector('#login');

  while (loginDiv.firstElementChild !== null) {
    loginDiv.firstElementChild.remove();
  }
  
  if (user.isAnonymous) {
    loginDiv.appendChild(Login.getLoginScreen(auth.signIn));
  } else if (user !== null && user.isAnonymous === false) {
    loginDiv.appendChild(Login.getWelcomeScreen(user.email, auth.signOut));
  
    const role = await auth.getAccountType();

    if (role === 'administrator') {
      loginDiv.appendChild(Login.getAdminLinks());
    }
  }

  const content = document.querySelector('.content');
  const gameboardClicked = async (id) => {
    const content = document.querySelector('.content');

    clearContentDiv();
    content.appendChild(await Game.getGameboard(firebaseApp, id));
  };

  clearContentDiv();
  content.appendChild(await Game.getGameboardsElement(firebaseApp, gameboardClicked));
}

window.addEventListener('beforeunload', async () => {
  if (auth.getUser().isAnonymous) {
    await auth.deleteAnonymousUser();
  }
});
