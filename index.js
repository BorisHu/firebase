// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
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

async function sendMessage(message) {
console.log("Sending a score!");
// Add some data to the messages collection
try {
    const docRef = await addDoc(collection(db, "score"), {
    time: Date.now(),
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
  
  getAllMessages();

  function handleInput(e) {
    if (e.key == "Enter") {
      sendMessage(e.target.value);
      e.target.value = "";
    }
  }

  function view() {
    return html`<h1>my cool app</h1>
      <input type="text" @keydown=${handleInput} />
      <div id="messages-container">
        ${messages.map((msg) => html`<div class="message">${msg.content}</div>`)}
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

render(view(), document.body);