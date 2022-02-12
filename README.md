# Exercise #5: Watch Party

5 points

**DUE: Friday, February 18 by 5:30pm**

### Instructions

For this exercise, we will build a group chat web application with asynchronous
Javascript and a REST API written in Python with Flask.

Watch Party lets users start new private chats that work like group texts or
Slack rooms. A user creates a new chat, which is assigned a unique identifier.
They can invite other users by sharing a unique link that will authenticate the
bearer to the chat. Users in a chat post messages which appear in a single
conversation thread to all users. Unlike Slack or a group chat, Watch Party only
saves or shows the last 30 messages.

Take Watch Party UI here and serve it
using server-side code written in the [latest stable version of Python](https://www.python.org/downloads/release/python-3102/)
([3.10.2](https://www.python.org/downloads/release/python-3102/))
and [Flask](https://flask.palletsprojects.com/en/2.0.x/installation/). Be sure to
include important features like:
- Prompt users to enter a username when they create or join a chat. Save that
  username so that we remember if if the user enters a new chat.
- Give each chat a unique URL
- As other users type new messages in a chat, Watch Party should asynchronously
  fetch them, and those messages should appear automatically without anyone
  reloading the page.
- Allow users to be in multiple chats in multiple tabs if they want (hint: scope
  storage and session tokens to chat id).
- Redirect users to the home screen if they try to join a chat without the right
  invite link.
- Make sure chat messages support Unicode characters

You may save chat messages and user names on the server however you want; with a
database like we used in Exercise 3 or just in memory on your server. Either
way, make sure you delete older messages as ones over 30 come in. For the
purposes of this Exercise, you also do not need to worry about deleting chats
that nobody is using anymore.

Also using Python and Flask, write a REST API for creating and hosting live
Watch Party group chats. It should support the following methods:
- `POST /create`: Allow any user to create a new chat with a new secret invite
  link. Return a unique identifier `chat_id`and a `session_token` to allow the
  original creator to identify themselves in subsequent requests.
- `GET /<chat_id>`: Require a valid `session_token` in an authorization header.
  Return the messages in the chat. Optionally take a parameter that allows it to
  return only new messages.
- `POST /<chat_id>`: Require a valid `session_token` in an authorization header.
  Post a new message to the chat.
  
Your web application should use these API methods. Feel free to include any
other methods you think will be useful, either as web controllers or as further
API endpoints. You can use any other libraries or frameworks you find useful, as
well.

Remember to include in your submission any classmates you collaborated with and
any materials you consulted. Watch Party (though it has somewhat different
requirements) is inspired by [yap.chat](https://yap.chat/).

### Rubric

One point each for:
- Sign up with Magic Links: Generate URLs that contain a chat id and a unique
  key, such that visiting that URL lets the user authorize and join the chat.
- Session Tokens: Issue a session token to users that create a chat or enter one
  with a magic link. Hold those tokens in memory on the server side. Authenticate
  API requests by requiring users to bring a token. Tokens should expire within
  6 hours, and only 6 tokens may exist for a given chat.
- Chat Web UI: UI to create new chats. UI to post messages and to asynchronously
  (and without user input) fetch and display new messages from the server as
  they are posted by interacting with the API. Hold authorization token in local
  storage.
- JSON API:
  - REST endpoint to create a new chat that returns a session token.
  - REST endpoint authenticate to an existing chat and receive a session token.
  - REST endpoints that require a session token to post messages to a chat and
    get messages from a chat
- Advanced UI Handling: Allow users to be in multiple chats in multiple tabs or
  windows. Redirect users to the home screen if they try to join a chat that's
  full (even by following a magic link). Support usernames and messages that
  contain unicode characters.
