import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';

import { $ } from "./util.js";
import { getMember } from "./services.js";

import {
  TextComponent, ImageComponent, Component, Button
} from "./components.js";

class ClientLogin extends Component {
  constructor(parent, data) {
    super(parent, { class: "client-login row-container" });
    this.userPic = new ImageComponent(this, { class: "rounded-img" });
    this.settingsButton = new Button(this, { class: "material-symbols-outlined" }, { text: "settings" });
    this.signInButton = new Button(this, {}, { text: "Sign in" });
    this.signInButton.visible(false);
    this.signOutButton = new Button(this, {}, { text: "Sign out" });
    this.signOutButton.visible(false);
  }

  draw() {
    super.draw();
    if (this.data) {
      this.userPic.visible(false);
      this.userPic.data = { src: this.data.photoURL };
      this.settingsButton.visible(this.data.isAdmin);
      this.signInButton.visible(false);
      this.signOutButton.visible(true);
    } else {
      this.userPic.visible(false);
      this.settingsButton.visible(false);
      this.signInButton.visible(true);
      this.signOutButton.visible(false);
    }
  }
}

export const clientLogin = new ClientLogin($('navigation-login'));
clientLogin.signInButton.addListener('click', signIn);
clientLogin.signOutButton.addListener('click', signOutUser);
clientLogin.settingsButton.addListener('click', goSettings);

export async function signIn() {
  var provider = new GoogleAuthProvider();
  await signInWithPopup(getAuth(), provider);
}

function signOutUser() {
  signOut(getAuth());
}

function goSettings() {
  location.href = "/settings"
}

var _authStateCallback = null;

export function initNavigation(authStateCallback) {
  _authStateCallback = authStateCallback;
  onAuthStateChanged(getAuth(), authStateObserver);
}

async function authStateObserver(user) {
  getMember().then(e => {
    clientLogin.data = e.data;
    _authStateCallback(e);
  });

}

