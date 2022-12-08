import firebaseConfig from './config/firebase-config.js';
import { initializeApp } from 'firebase/app';
import Login from './Login.js';
import Auth from './firebaseAuth.js';
import AdminTools from './AdminTools.js';
import './admin.css';

const firebaseApp = initializeApp(firebaseConfig);
const auth = new Auth(firebaseApp, authChanged);

const content = document.querySelector('.content');

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
    content.appendChild(AdminTools.getAccessDenied());
  } else if (user !== null && user.isAnonymous === false) {
    loginDiv.appendChild(Login.getWelcomeScreen(user.email, auth.signOut));
  
    const role = await auth.getAccountType();

    console.log(role);
    if (role === 'administrator') {
      loginDiv.appendChild(Login.getAdminLinks());
      content.appendChild(AdminTools.getAddGameboardForm());
    }

    console.log('user logged in');
  }
}

