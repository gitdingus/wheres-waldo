import { getElementFromTemplateFile } from 'dom-utils';
import loginTemplate from './template/login.template.html';
import logoutTemplate from './template/logout.template.html';

class Login {
  static getLoginScreen(loginUser){
    const loginForm = getElementFromTemplateFile(loginTemplate);
    const email = loginForm.querySelector('#email');
    const password = loginForm.querySelector('#password');

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loginUser(email.value, password.value);
    });

    return loginForm;
  }

  static getWelcomeScreen(email, signOut){
    const welcome = getElementFromTemplateFile(logoutTemplate);
    const emailSpan = welcome.querySelector('.logged-in-email');
    const signOutButton = welcome.querySelector('.sign-out');

    emailSpan.textContent = email;
    signOutButton.addEventListener('click', (e) => {
      signOut();
    });
    
    return welcome;
  }

  static getAdminLinks () {
    const div = document.createElement('div');
    const adminPageLink = document.createElement('a');

    adminPageLink.textContent = 'Manage';
    adminPageLink.href = './admin.html';

    div.appendChild(adminPageLink);
    div.classList.add('admin-links');

    return div;
  }
}

export default Login;