import { 
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  deleteUser,
} from 'firebase/auth';
import {
  getFirestore,
  getDoc,
  doc,
} from 'firebase/firestore';

class Auth {
  constructor(app, sendUser) {
    this.app = app;
    this.auth = getAuth(app);
    this.sendUser = sendUser;
    this.pauseAuthStateChanged = false;

    this.unsubscribeToAuth = onAuthStateChanged(this.auth, this.authListener);
  }

  authListener  = (user) => {
    if (user === null){
      signInAnonymously(this.auth)
        .then(this.sendUser(user));
    } else {
      this.sendUser(user);
    }
  };

  signIn = (email, password) => {
    this.unsubscribeToAuth();

    if (this.auth.currentUser !== null && this.auth.currentUser.isAnonymous) {
      deleteUser(this.auth.currentUser)
        .then(() => {
          signInWithEmailAndPassword(this.auth, email, password)
          .then((userCredential) => {
            this.unsubscribeToAuth = onAuthStateChanged(this.auth, this.authListener);
          });
        })
    } else {
      signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        this.unsubscribeToAuth = onAuthStateChanged(this.auth, this.authListener);
      });
    }
  };

  signOut = () => {
    this.unsubscribeToAuth();
    if (this.auth.currentUser === null || this.auth.currentUser.isAnonymous){
      return;
  }

    signOut(this.auth);

    signInAnonymously(this.auth)
      .then((userCredential) => {
        this.unsubscribeToAuth = onAuthStateChanged(this.auth, this.authListener);
      });
  }

  deleteAnonymousUser = async () => {
    if (this.auth.currentUser.isAnonymous) {
      await deleteUser(this.auth.currentUser);
    }
  }

  getUser() {
    return this.auth.currentUser;
  }

  getAuth() {
    return this.auth;
  }

  async getAccountType() {
    const db = getFirestore(this.app);
    const rolesRef = doc(db, '/accounts/roles/');

    try {
      const snapshot = await getDoc(rolesRef);

      return 'administrator';
    }
    catch(e) {

      return 'user';
    }
  }
}

export default Auth;