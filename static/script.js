/* For index.html */

// TODO: If a user clicks to create a chat, create a session token for them
// and save it. Redirect the user to /chat/<chat_id>
function createChat() {
  
    if (sessionStorage.username === undefined) {
      location.href = "/username";
    }
    else {
      console.log("lets create a chat!")
      // we have a username defined. create a chat. prepare
      // to send the create request to the python API
      host_username = sessionStorage.username

      options = {
        method: 'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body: JSON.stringify({
          'username': host_username,
        })
      };

      console.log("sending request to python API / server")
      // send request and get response...ultimately stored in "json"
      fetch( '/create', options).then((response) => {
        console.log(response);
        return response.json()
      }).then((json) => {
        console.log(json);
        console.log("obtained response from server! parsed to JSON!")

      // response should contain host_session_token and chat_id
      // print chat id
      console.log("Storing chat_id: ",json.chat_id);
      // sessionStorage.setItem("session_token",json.session_token)

      // Store Session Token
      console.log("Storing Session_token: ",json.session_token);
      sessionStorage.setItem("session_token",json.session_token)
  
      // Redirect to chat
      // console.log(redirect)
      window.location.href = "/chat/" + String(json.chat_id);;
      
      });
    }
}

/* For auth.html */

// TODO: On page load, pull chat_id and magic_key out of the URL parameters
// Send them to the auth API endpoint to get a session token
// If the user authenticaes successfully, save the session token
// and redirect them to /chat/<chat_id>
function authenticate() {
  // okay, we want to pull out of the url the chat_id and magic_key,
  // if there is a failure, we redirect to the homepage.
  
  return;
}

/* For chat.html */

// TODO: Fetch the list of existing chat messages.
// POST to the API when the user posts a new message.
// Automatically poll for new messages on a regular interval.
function postMessage() {

  // if (localStorage.username === undefined) {
  //   location.href = "/username";
  // }
  // else {
    console.log("lets post a message!")
    // prepare to send the post message request to the python API
  
    // get token of user (user needs a token if they are to be on this page)
    user_token = sessionStorage.session_token
  
    comment = document.getElementById("messageBox").value
  
    options = {
      method: 'POST',
      headers:{
        'Content-Type':'application/json',
        'user_token': user_token
      },
      body: JSON.stringify({
        'comment': comment
      })
    };
  
    console.log("sending request to python API / server: post message")
    // send request and get response...ultimately stored in "json"
    // get current chat_id
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams);
    // if (urlParams.has('chat_id')
  
    fetch( '/chat/1', options).then((response) => {
      console.log(response);
      return response.json()
    }).then((json) => {
      console.log(json);
      console.log("obtained response from server! parsed to JSON!");
  
    // response should contain host_session_token and chat_id
    // print chat id
    console.log("comment submission status: ",json.status);
    // sessionStorage.setItem("session_token",json.session_token)
  
    // Redirect to chat
    // console.log(redirect)
    // window.location.href = "/chat/" + String(json.chat_id);;
    
    });
    //}
    return;
}

function getMessages() {
  // if (localStorage.username === undefined) {
  //   location.href = "/username";
  // }
  // else {
  console.log("let's obtain the messages!")
  // prepare to send the post message request to the python API

  // get token of user (user needs a token if they are to be on this page)
  user_token = sessionStorage.session_token

  // options = {
  //   method: 'GET',
  //   headers:{
  //     'Accept': 'application/json',
  //     'user_token': user_token
  //   }
  // };

  options = {
    method: 'GET',
    headers:{
      'Accept': 'application/json',
      'user_token': user_token,
      'chat_id': "1",
      'new': "true"
    }
  };

  console.log(options);

  console.log("sending request to python API / server: get messages")
  // send request and get response...ultimately stored in "json"
  // get current chat_id
  const urlParams = new URLSearchParams(window.location.search);
  console.log(urlParams);
  // if (urlParams.has('chat_id')

  fetch( '/api/get_messages', options).then((response) => {
    console.log(response);
    return response.json()
  }).then((json) => {
    console.log(json);
    console.log("obtained response from server! parsed to JSON!");
  // fetch( '/chat/1', options).then((response) => {
  //   console.log(response);
  //   return response.json()
  // }).then((json) => {
  //   console.log(json);
  //   console.log("obtained response from server! parsed to JSON!");

  msgs= json.messages
  // reponse should have a dict of messages:

  // re-write messages
  // first erase them
  commentContainer = document.querySelector(".messages")
  while (commentContainer.innerHTML.trim() != ""){
    commentContainer.lastElementChild.remove();
  }

  // write the messages
  for (let i = 0; i < msgs.length; i++) {
    let body = msgs[i]["body"];
    let username = msgs[i]["username"];
    message_elem = document.createElement('message');
    author_elem = document.createElement('author');
    author_elem.textContent = username;
    content_elem = document.createElement('content');
    content_elem.textContent = body;
    message_elem.appendChild(author_elem)
    message_elem.appendChild(content_elem)
    commentContainer.appendChild(message_elem)
  }




  

  
  // response should contain host_session_token and chat_id
  // print chat id
  // console.log("comment submission status: ",json.status);
  // sessionStorage.setItem("session_token",json.session_token)

  // Redirect to chat
  // console.log(redirect)
  //window.location.href = "/chat/" + String(json.chat_id);;
  
  });
  //}
  
  return;
}

function startMessagePolling() {
  // var intervalID = setInterval(getMessages,500);
  // setTimeout(function() {
  //   console.log("looking for content");
  // }, 4 * 1000);
  return;
}
