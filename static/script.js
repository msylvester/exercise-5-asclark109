#!/usr/bin/env node

   
/* For index.html */

const USERNAME = "username";
const SESSION_TOKEN = "session_token";
const CHAT_ID = "chat_id";
const MAGIC_KEY = "magic_key";
const BODY = "body";
const MESSAGE_ID = "message_id";

function createSessionStorageKey(chat_id, keyString)
{
  return `${chat_id}_${keyString}`;
}

async function createChat() {
  let nameElement = document.getElementById(USERNAME);
  let formData = new FormData();
  formData.append(USERNAME, nameElement.value);
  let results = await fetch("/api/create", {
    method: "POST",
    body: formData
  });
  let resultsJson = await results.json();
  window.sessionStorage.setItem(createSessionStorageKey(resultsJson.chat_id, SESSION_TOKEN), resultsJson.session_token);
  window.sessionStorage.setItem(createSessionStorageKey(resultsJson.chat_id, USERNAME), nameElement.value);
  location.href = `/chat/${resultsJson.chat_id}`;
}

/* For auth.html */
async function authenticate() {
  let params = new URLSearchParams(window.location.search);
  let chat_id = params.get(CHAT_ID);
  let magic_key = params.get(MAGIC_KEY);
  let nameElement = document.getElementById(USERNAME);
  let username = nameElement.value;
  let formData = new FormData();
  formData.append(CHAT_ID, chat_id);
  formData.append(MAGIC_KEY, magic_key);
  formData.append(USERNAME, username);
  let results = await fetch("/api/authenticate", {
    method: "POST",
    body: formData
  });
  let resultsJson = await results.json();
  if(results.status >= 400)
  {
    alert(resultsJson.message);
    location.href = "/";
  }
  else
  {
    window.sessionStorage.setItem(createSessionStorageKey(chat_id, SESSION_TOKEN), resultsJson.session_token);
    window.sessionStorage.setItem(createSessionStorageKey(chat_id, USERNAME), username);
    location.href = `/chat/${chat_id}`; 
  }
}

/* For chat.html */
async function postMessage(chat_id) {
  let commentElement = document.querySelector("input[name=comment]");
  let comment = commentElement.value;
  let username = sessionStorage.getItem(createSessionStorageKey(chat_id, USERNAME));

  let formData = new FormData();
  formData.append(USERNAME, username);
  formData.append(BODY, comment);
  let session_token = sessionStorage.getItem(createSessionStorageKey(chat_id, SESSION_TOKEN));
  let headers = new Headers();
  // I realize I'm not using the Authorization header properly here, as I'm not specifying "Basic" authentication
  // for example. I put the session_token directly in the Authorization header for ease of implementation. The
  // proper use would require base64 encoding too, which doesn't seem worth the trouble.
  headers.append("Authorization", session_token);  
  let results = await fetch(`/api/chat/${chat_id}`, {
    method: "POST",
    body: formData,
    headers: headers
  });
  let resultsJson = await results.json();
  if(results.status >= 400)
  {
    alert(resultsJson.message);
  }
}

async function startMessagePolling(chat_id) {
  sessionStorage.setItem(createSessionStorageKey(chat_id, MESSAGE_ID), 0);
  let magic_link_anchor = document.querySelector("a.magic_link");
  let magic_link = magic_link_anchor.getAttribute("href");
  while(true)
  {
    //await sleep(500);
    // While I could grab the session token outside the loop, I grab it in the loop to make
    // this easier to debug (I can change the session token in the console while the loop is running).
    let session_token = sessionStorage.getItem(createSessionStorageKey(chat_id, SESSION_TOKEN));
    let headers = new Headers();
    // I realize I'm not using the Authorization header properly here, as I'm not specifying "Basic" authentication
    // for example. I put the session_token directly in the Authorization header for ease of implementation. The
    // proper use would require base64 encoding too, which doesn't seem worth the trouble.
    headers.append("Authorization", session_token);  
    let message_id = parseInt(sessionStorage.getItem(createSessionStorageKey(chat_id, MESSAGE_ID)));
    let results = await fetch(`/api/chat/${chat_id}?${MESSAGE_ID}=${message_id}`, {
      method: "GET",
      headers: headers
    });
    let resultsJson = await results.json();
    if(results.status >= 400)
    {
      alert(resultsJson.message + " Please re-authenticate.");
      location.href = magic_link;
      break;
    }
    else
    {
       let messagesDiv = document.querySelector("div.messages");
       let max_message_id = -1;
       for(let message of resultsJson)
       {
         let singleMessageDiv = document.createElement("div");
         singleMessageDiv.setAttribute("class", "message");
         let messageTextNode = document.createTextNode(`${message.username}: ${message.body}`);
         singleMessageDiv.appendChild(messageTextNode);
         messagesDiv.appendChild(singleMessageDiv);
         max_message_id = Math.max(max_message_id, message.message_id)
       }

       if (max_message_id > -1)
       {
         sessionStorage.setItem(createSessionStorageKey(chat_id, MESSAGE_ID), max_message_id + 1)
       }
    }
  }
}

function chatOnLoad(chat_id) {
  let usernameDiv = document.getElementById(USERNAME);
  let textNode = document.createTextNode(`Username: ${sessionStorage.getItem(createSessionStorageKey(chat_id, USERNAME))}`);
  usernameDiv.appendChild(textNode);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
