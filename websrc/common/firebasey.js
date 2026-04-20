import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';

import { getMember } from "./services.js";

export async function signIn() {
  var provider = new GoogleAuthProvider();
  await signInWithPopup(getAuth(), provider);
}

export function signOutUser() {
  signOut(getAuth());
}

var _authStateCallback = null;

export function initNavigation(authStateCallback) {
  _authStateCallback = authStateCallback;
  onAuthStateChanged(getAuth(), authStateObserver);
}

export var clientData = null;
async function authStateObserver(user) {
  getMember().then(e => {
    clientData = e.data;
    _authStateCallback(e);
  });

}

