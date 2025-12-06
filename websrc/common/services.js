import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyDSff1RU2_hcEjtJtCS_uloSgbbYrnaoLI",
    authDomain: "aura-persona.firebaseapp.com",
    projectId: "aura-persona",
    storageBucket: "aura-persona.firebasestorage.app",
    messagingSenderId: "643081543085",
    appId: "1:643081543085:web:81772b8e4beddf8aa2d524"
};

export const app = initializeApp(firebaseConfig);
export const functions = getFunctions(app);

if (window.location.hostname.includes("localhost")) {
    console.log("USING EMULATOR!")
    connectFunctionsEmulator(functions, "localhost", 5001);
}

export const createPersona = httpsCallable(functions, "createPersona");
export const createPersona2 = httpsCallable(functions, "createPersona2");
export const listPersona = httpsCallable(functions, "listPersona");
export const getPersona = httpsCallable(functions, "getPersona");
export const createDayForPersona = httpsCallable(functions, "createDayForPersona");
export const listDaysPersona = httpsCallable(functions, "listDaysForPersona");
export const listObservations = httpsCallable(functions, "listObservations");
export const makeSpaceMira = httpsCallable(functions, "makeSpaceMira");
export const makeSpacePds = httpsCallable(functions, "makeSpacePds");
export const createAppImg = httpsCallable(functions, "createAppImg");
export const createEditorialImg = httpsCallable(functions, "createEditorialImg");
export const createBGForPersona = httpsCallable(functions, "createBGForPersona");
export const makeSpaceBanaux = httpsCallable(functions, "makeSpaceBanaux");
export const runSimulation = httpsCallable(functions, "runSimulation");
export const processQueue = httpsCallable(functions, "processQueue");
export const listUx = httpsCallable(functions, "listUx");
export const getPersonaWithUx = httpsCallable(functions, "getPersonaWithUx");