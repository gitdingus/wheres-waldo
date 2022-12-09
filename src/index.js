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
  const gameboardClicked = async (id) => {
    const content = document.querySelector('.content');

    clearContentDiv();
    content.appendChild(await Game.getGameboard(firebaseApp, id));
  };

  content.appendChild(await Game.getGameboardsElement(firebaseApp, gameboardClicked));
}

window.addEventListener('beforeunload', async () => {
  if (auth.getUser().isAnonymous) {
    await auth.deleteAnonymousUser();
  }
});
