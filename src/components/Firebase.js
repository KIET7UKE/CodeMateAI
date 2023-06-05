import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB4Df3zUMxXk_Hr2p9YCPxOUUYFbXq8C5I",
  authDomain: "a2s-task-1578f.firebaseapp.com",
  projectId: "a2s-task-1578f",
  storageBucket: "a2s-task-1578f.appspot.com",
  messagingSenderId: "887169888466",
  appId: "1:887169888466:web:7c2351a801c2cba8ff7d0b",
  measurementId: "G-KE50LQ51LZ"
};

firebase.initializeApp(firebaseConfig);
export const dataref = firebase.database();
export const storage = firebase.storage();
export default firebase;