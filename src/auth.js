import { auth, googleProvider } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

// Register with email and password
export function registerWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// Login with email and password
export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Login/Register with Google
export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}
