from calendar import c
import string
import random
from datetime import datetime, timedelta
from flask import Flask, render_template, request, jsonify
from functools import wraps
from itsdangerous import json

from sqlalchemy import true

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# sample_chats = {
#     1: {
#         "authorized_users": {
#             "as3215jhkg231hjgkl4123": {"username": "Alice", "expires": "2020-02-15T20:53:15Z"},
#             "session_token_1": {"username": "Bob", "expires": "2020-02-15T20:57:22Z"}
#         },
#         "magic_key": "some_really_long_key_value"
#         "messages": [
#             {"username": "Alice", "body": "Hi Bob!"},
#             {"username": "Bob", "body": "Hi Alice!"},
#             {"username": "Alice", "body": "Knock knock"},
#             {"username": "Bob", "body": "Who's there?"},
#         ]
#     }
# }
chats = {}

def newChat(host, session_token):
    authorized_users = dict([
        (session_token, dict([
            ("username", host),
            ("expires", datetime.utcnow() + timedelta(hours=6))
        ]))
    ])
    magic_key = ''.join(random.choices(string.ascii_lowercase + string.digits, k=40))

    return dict([
        ("authorized_users", authorized_users),
        ("magic_key", magic_key),
        ("messages", [])
    ])


@app.route('/')
def index(chat_id=None):
    return app.send_static_file('index.html')

@app.route('/username')
def auth():
    return app.send_static_file('username.html')

@app.route('/authenticate')
def auth():
    return app.send_static_file('auth.html')

@app.route('/chat/<int:chat_id>')
def chat(chat_id):
    # we know the chat id, and we need to look up the magic key
    # to render the site properly
    global chats
    magic_key = chats[chat_id]["magic_key"]
    invite_link = "?chat_id={}&magic_key={}".format(chat_id,magic_key)
    return render_template('chat.html',
            chat_id=chat_id,
            invite_link=invite_link)

# -------------------------------- API ROUTES ----------------------------------

# TODO: Create the API

new_chat_id_number = 1
new_session_token_number = 1

def generate_session_token():
    """returns a new unique session token"""
    global new_session_token_number
    assignment = new_session_token_number
    new_session_token_number += 1
    return "session_token_{}".format(new_session_token_number)

def generate_new_chat_id():
    """returns a new unique chat id"""
    global new_chat_id_number
    assigned_chat_id = new_chat_id_number
    new_chat_id_number +=1
    return assigned_chat_id

@app.route('/create', methods = ['POST'])
def create():
    # create new chat with new secret invite link
    global chats

    # receive request
    content = request.get_json()

    # expecting username to be defined
    print(content["username"])
    host_username = content["username"]

    # generate session token
    chat_id = generate_new_chat_id()
    session_token = generate_session_token()
    print(chat_id)
    print(session_token)

    # create new chat
    new_chat_dict = newChat(host_username,session_token)
    print(new_chat_dict)

    # add chat to chats dict
    chats[chat_id] = new_chat_dict
    print()
    print(chats)
 
    # return unique chat_id, and session_token to allow creator to identify themselves
    # in subsequent requests
    return jsonify({"session_token" : session_token,
                    "chat_id" : chat_id})


@app.route('/chat/<chat_id>', methods = ['GET','POST'])
def func(chat_id):
    global chats
    ### POST REQUEST
    if request.method == 'GET':
        # require a valid session_token in an authorization header
        # return the messages in the chat.
        # take optional param that only returns new messages

        print("ARRIVED")

        # access global chats dict datastructure
        

        # receive request
        content = request.get_json()
        print(content)

        # validate user token
        user_token = request.headers.get("user_token")

        if user_token in chats[int(chat_id)]["authorized_users"].keys():
            print("token validated!: "+user_token)

            print("now: "+ str(datetime.utcnow()))
            expiration = chats[int(chat_id)]["authorized_users"][user_token]["expires"]

            # check if token expired
            if datetime.utcnow() > expiration:
                print("EXPIRED TOKEN")
                print("TO IMPLMEMENT: REMOVE TOKEN")
            else:
                print("expiration: "+str(expiration))
                print("token not expired!")

                # package up and send all the messages
                return jsonify({"messages" : chats[int(chat_id)]["messages"]})
        # return empty dict of messages
        return jsonify({"messages" : dict()})
    ### GET REQUEST
    if request.method == 'POST':
        print("ARRIVED")

        # receive request
        content = request.get_json()
        print(content)

        # validate user token
        user_token = request.headers.get("user_token")

        if user_token in chats[int(chat_id)]["authorized_users"].keys():
            print("token validated!: "+user_token)

            print("now: "+ str(datetime.utcnow()))
            expiration = chats[int(chat_id)]["authorized_users"][user_token]["expires"]

            # check if token expired
            if datetime.utcnow() > expiration:
                print("EXPIRED TOKEN")
                print("TO IMPLMEMENT: REMOVE TOKEN")
            else:
                print("expiration: "+str(expiration))
                print("token not expired!")

                # display comment
                user_comment = content['comment']
                print("user comment: "+user_comment)

                # add comment to data structure on server
                # tracking chat data
                list_of_comment_dicts = chats[int(chat_id)]["messages"]
                new_comment_dict = dict()
                # lookup username
                username = chats[int(chat_id)]["authorized_users"][user_token]["username"]
                body = user_comment
                new_comment_dict = {"username": username, "body": body}
                print(new_comment_dict)
                list_of_comment_dicts.append(new_comment_dict)
                # update chat comments
                chats[int(chat_id)]["messages"] = list_of_comment_dicts
                # see updated chat data
                print(chats)    

                # # require a valid session_token in an authorization header
                # post a new message to the chat
                return jsonify({"status" : "successful posting of comment",
                })
        # # require a valid session_token in an authorization header
        # post a new message to the chat
        return jsonify({"status" : "failed to post comment",
        })

# @app.route('/chat/<chat_id>', methods = ['POST'])
# def func2(chat_id):
#     print("ARRIVED")
#     # access global chats dict datastructure
#     global chats

#     # receive request
#     content = request.get_json()
#     print(content)

#     # validate user token
#     user_token = request.headers.get("user_token")

#     if user_token in chats[int(chat_id)]["authorized_users"].keys():
#         print("token validated!: "+user_token)

#         print("now: "+ str(datetime.utcnow()))
#         expiration = chats[int(chat_id)]["authorized_users"][user_token]["expires"]

#         # check if token expired
#         if datetime.utcnow() > expiration:
#             print("EXPIRED TOKEN")
#             print("TO IMPLMEMENT: REMOVE TOKEN")
#         else:
#             print("expiration: "+str(expiration))
#             print("token not expired!")

#             # display comment
#             user_comment = content['comment']
#             print("user comment: "+user_comment)

#             # add comment to data structure on server
#             # tracking chat data
#             list_of_comment_dicts = chats[int(chat_id)]["messages"]
#             new_comment_dict = dict()
#             # lookup username
#             username = chats[int(chat_id)]["authorized_users"][user_token]["username"]
#             body = user_comment
#             new_comment_dict = {"username": username, "body": body}
#             print(new_comment_dict)
#             list_of_comment_dicts.append(new_comment_dict)
#             # update chat comments
#             chats[int(chat_id)]["messages"] = list_of_comment_dicts
#             # see updated chat data
#             print(chats)    

#             # # require a valid session_token in an authorization header
#             # post a new message to the chat
#             return jsonify({"status" : "successful posting of comment",
#             })
#     # # require a valid session_token in an authorization header
#     # post a new message to the chat
#     return jsonify({"status" : "failed to post comment",
#     })


@app.route('/api/get_messages', methods = ['GET'])
def func3():
    global chats
    ### POST REQUEST
    if request.method == 'GET':
        # require a valid session_token in an authorization header
        # return the messages in the chat.
        # take optional param that only returns new messages

        print("ARRIVED: MESSAGES")

        # access global chats dict datastructure
        

        # receive request
        content = request.get_json()
        print(content)

        # validate user token
        user_token = request.headers.get("user_token")
        chat_id = request.headers.get("chat_id")
        print(user_token)
        print(chat_id)

        if user_token in chats[int(chat_id)]["authorized_users"].keys():
            print("token validated!: "+user_token)

            print("now: "+ str(datetime.utcnow()))
            expiration = chats[int(chat_id)]["authorized_users"][user_token]["expires"]

            # check if token expired
            if datetime.utcnow() > expiration:
                print("EXPIRED TOKEN")
                print("TO IMPLMEMENT: REMOVE TOKEN")
            else:
                print("expiration: "+str(expiration))
                print("token not expired!")

                # package up and send all the messages
                return jsonify({"messages" : chats[int(chat_id)]["messages"]})
        # return empty dict of messages
        return jsonify({"messages" : dict()})
    ### GET REQUEST
    if request.method == 'POST':
        print("ARRIVED")

        # receive request
        content = request.get_json()
        print(content)

        # validate user token
        user_token = request.headers.get("user_token")

        if user_token in chats[int(chat_id)]["authorized_users"].keys():
            print("token validated!: "+user_token)

            print("now: "+ str(datetime.utcnow()))
            expiration = chats[int(chat_id)]["authorized_users"][user_token]["expires"]

            # check if token expired
            if datetime.utcnow() > expiration:
                print("EXPIRED TOKEN")
                print("TO IMPLMEMENT: REMOVE TOKEN")
            else:
                print("expiration: "+str(expiration))
                print("token not expired!")

                # display comment
                user_comment = content['comment']
                print("user comment: "+user_comment)

                # add comment to data structure on server
                # tracking chat data
                list_of_comment_dicts = chats[int(chat_id)]["messages"]
                new_comment_dict = dict()
                # lookup username
                username = chats[int(chat_id)]["authorized_users"][user_token]["username"]
                body = user_comment
                new_comment_dict = {"username": username, "body": body}
                print(new_comment_dict)
                list_of_comment_dicts.append(new_comment_dict)
                # update chat comments
                chats[int(chat_id)]["messages"] = list_of_comment_dicts
                # see updated chat data
                print(chats)    

                # # require a valid session_token in an authorization header
                # post a new message to the chat
                return jsonify({"status" : "successful posting of comment",
                })
        # # require a valid session_token in an authorization header
        # post a new message to the chat
        return jsonify({"status" : "failed to post comment",
        })

if __name__ == "__main__":
    app.run(debug=True)