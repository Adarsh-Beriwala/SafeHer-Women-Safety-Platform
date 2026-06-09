import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const signUp = async (email, password, name, phone, role) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

  await setDoc(doc(db, 'users', user.uid), {
    name,
    email,
    phone,
    role, // 'user' or 'volunteer'
    emergencyContacts: [],
    safetyWord: '',
    fakeCallSettings: {
      callerName: 'Mom',
      delay: 5,
    },
    createdAt: new Date().toISOString(),
  });

  return user;
};

export const logIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logOut = async () => {
  await signOut(auth);
};

export const getUserProfile = async (uid) => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const updateUserProfile = async (uid, data) => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, data);
};
