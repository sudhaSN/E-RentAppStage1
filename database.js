import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyDdIJg_wewJRkGMJKd5m7bu3RFuZAtn6uQ",
  authDomain: "e-rent-app.firebaseapp.com",
  projectId: "e-rent-app",
  storageBucket: "e-rent-app.appspot.com",
  messagingSenderId: "5091692171",
  appId: "1:5091692171:web:dd615cb6995260f9448e8e"
};

firebase.initializeApp(firebaseConfig);

export default firebase.firestore();