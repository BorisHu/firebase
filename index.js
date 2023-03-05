// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    onSnapshot,
    query,
    orderBy,
  } from "firebase/firestore";
import { html, render } from "lit-html";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCsZZXaT-JnC_fCdt14KzAGsSNNdsDv04M",
  authDomain: "in-class-5d43f.firebaseapp.com",
  projectId: "in-class-5d43f",
  storageBucket: "in-class-5d43f.appspot.com",
  messagingSenderId: "502579561666",
  appId: "1:502579561666:web:790f068d08d3fa2604e75b",
  measurementId: "G-2K4GBM0PZ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
let messages = [];
const messagesRef = collection(db, "score");
const auth = getAuth();
let username = "anon";

function signInAnon() {
  signInAnonymously(auth)
    .then(() => {
      updateProfile(auth.currentUser, { displayName: username })
      console.log(auth.currentUser);
    })
    .catch((error) => {
      console.error(`Error ${error.code}: ${error.message}.`);
    });
}

// This function is called if the Sign Out button is clicked
function signOutUser() {
  signOut(auth)
    .then(() => {
      console.info("Sign out was successful");
    })
    .catch((error) => {
      console.error(`Error ${error.code}: ${error.message}.`);
    });
}

// This is an observer which runs whenever the authentication state is changed
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("AUTH STATE CHANGED");
    const uid = user.uid;

    // If there is an authenticated user, we render the normal view
    render(view(), document.body);
    // getAllMessages();
  } else {
    // Otherwise, we render the sign in view
    render(signInView(), document.body);
  }
});

async function sendMessage(message) {
console.log("Sending a score!");
const user = auth.currentUser;
// Add some data to the messages collection
try {
    const docRef = await addDoc(collection(db, "score"), {
    displayName: user.isAnonymous ? "anon" : user.displayName,
    uid: user.uid,
    content: Number(message),
    });
    console.log("Document written with ID: ", docRef.id);
} catch (e) {
    console.error("Error adding document: ", e);
}
}

async function getAllMessages() {
  messages = [];

  const querySnapshot = await getDocs(
    query(messagesRef, orderBy("content", "desc"))
  );
  querySnapshot.forEach((doc) => {
    let msgData = doc.data();
    messages.push(msgData);
  });

  console.log(messages);
  render(view(), document.body);
}


function handleInput(e) {
  if (e.key == "Enter") {
    sendMessage(e.target.value);
    e.target.value = "";
  }
}

function signInView() {
  return html`
  <h3>Enter User name:</h3>
  <input type="text" id="newUserName"><br>`;
  document.getElementById("newUserName").value = username;`
  <button class="sign-in" @click=${signInAnon}>Sign in</button>
  <h3>Or:</h3>
  <button class="sign-in" @click=${signInAnon}>Anonymous Sign in</button>`;
}

function view() {
  let user = auth.currentUser;
  return html`
  <h1>Game</h1>
  <div id="top-bar">
  <span
    >Signed in as
    ${user.isAnonymous ? "anon" : auth.currentUser.displayName}</span
  >
  <button @click=${signOutUser}>Sign Out</button>
</div>
    <input type="text" @keydown=${handleInput} />
    <div id="messages-container">
      ${messages.map((msg) => html`<div class="message">${msg.displayName,msg.content}</div>`)}
    </div>`;
}

onSnapshot(
  collection(db, "score"),
  (snapshot) => {
    console.log("snap", snapshot);
    getAllMessages();
  },
  (error) => {
    console.error(error);
  }
);
