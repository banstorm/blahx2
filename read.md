// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCt14oNW4PLgHfYU3Pt5Rmf14aB-3753yE",
  authDomain: "cha-front.firebaseapp.com",
  projectId: "cha-front",
  storageBucket: "cha-front.appspot.com",
  messagingSenderId: "862726265734",
  appId: "1:862726265734:web:655eb838b2af138a0caa07",
  measurementId: "G-VWQHKCP4WW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);