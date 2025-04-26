import { auth, googleProvider, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function registerWithEmail(email, password, type, userData = {}) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    
    if (type === 'seller') {
      const sellerData = {
        nik: userData.nik || '',
        idfarmer: userData.idfarmer || '',
        selleremail: email,
        selleruid: uid,
        createdAt: new Date(),
        type: 'seller'
      };
      
      await setDoc(doc(db, "sellers", uid), sellerData);
    } 
    else if (type === 'buyer') {
      const buyerData = {
        nik: userData.nik || '',
        nib: userData.nib || '',
        buyeremail: email,
        buyerrole: userData.buyerrole || 'normal',
        buyeruid: uid,
        createdAt: new Date(),
        type: 'buyer'
      };
      
      await setDoc(doc(db, "buyers", uid), buyerData);
    }
    
    return userCredential;
  } catch (error) {
    if (auth.currentUser) {
      await auth.currentUser.delete();
    }
    throw error;
  }
}

// Check if user exists and what type they are
export async function checkUserType(uid) {
  if (!uid) return null;
  
  try {
    // Check in buyers collection
    const buyerDoc = await getDoc(doc(db, 'buyers', uid));
    if (buyerDoc.exists()) {
      return 'buyer';
    }
    
    // Check in sellers collection
    const sellerDoc = await getDoc(doc(db, 'sellers', uid));
    if (sellerDoc.exists()) {
      return 'seller';
    }
    
    return null;
  } catch (error) {
    console.error("Error checking user type:", error);
    return null;
  }
}

// Check if the current user is authenticated
export async function isAuthenticated() {
  return new Promise((resolve) => {
    const unsubscribe = firebaseOnAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(!!user);
    });
  });
}

// Check if authenticated user is a buyer
export async function isBuyer() {
  const user = auth.currentUser;
  if (!user) return false;
  
  const userType = await checkUserType(user.uid);
  return userType === 'buyer';
}

// Check if authenticated user is a seller
export async function isSeller() {
  const user = auth.currentUser;
  if (!user) return false;
  
  const userType = await checkUserType(user.uid);
  return userType === 'seller';
}

export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function onAuthStateChanged(callback) {
  return firebaseOnAuthStateChanged(auth, callback);
}

export function signOut() {
  return firebaseSignOut(auth);
}
