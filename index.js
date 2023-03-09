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
    doc,
  } from "firebase/firestore";
import { html, render } from "lit-html";

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
var username = "anonymous";

function signInAnon() {
  signInAnonymously(auth)
    .then(() => {
      console.log(auth.currentUser);
      updateProfile(auth.currentUser, { displayName: username })
    })
    .catch((error) => {
      console.error(`Error ${error.code}: ${error.message}.`);
    });
}

// This function is called if the Sign Out button is clicked
function signOutUser() {
  signOut(auth)
    .then(() => {
      username = "anon";
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
    displayName: user.displayName,
    uid: user.uid,
    content: Number(message),
    });
    console.log("Document written with ID: ", docRef.id);
} catch (e) {
    console.error("Error adding document: ", e);
}
}

window.sendMessage = sendMessage

function handleInput(e) {
  if (e.key == "Enter") {
    sendMessage(e.target.value);
    e.target.value = "";
  }
}


function updateValue(event) {
  username = event.target.value;
}

function signInView() {
  return html`
  <h3>Enter User name:</h3>
  <input type="text" id="inputValue" @input=${updateValue}>
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
    ${user.isAnonymous ? username : auth.currentUser.displayName}</span
  >
  <button @click=${signOutUser}>Sign Out</button>
</div>
    <input type="text" @keydown=${handleInput} />
    <div id="rank">
    <div class="row">
      ${messages.map((msg) => html`<div class="message">${msg.displayName}</div>`)}
    </div>
    <div class="row">
      ${messages.map((msg) => html`<div class="message">${msg.content}</div>`)}
    </div>
    </div>`;
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
