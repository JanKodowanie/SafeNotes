from flask import Flask, render_template, make_response, request, session, jsonify
from flask_session import Session
from os import getenv
from dotenv import load_dotenv
from bcrypt import checkpw, gensalt, hashpw
from datetime import datetime
from uuid import UUID
import sys
import re
import uuid
import pymongo 


app = Flask(__name__)

load_dotenv()
SECRET_KEY = getenv("SECRET_KEY")
SESSION_COOKIE_HTTPONLY = True
# SESSION_COOKIE_SECURE = True
MONGO_HOST = getenv("MONGO_HOST")
MONGO_DB = getenv("MONGO_DB")
client = pymongo.MongoClient(MONGO_HOST, serverSelectionTimeoutMS=3000)

try:  
    client.server_info() 
except Exception:
    print("Couldn't connect to database. Process will terminate.")
    sys.exit(-1)

db = client[MONGO_DB]
SESSION_TYPE = "mongodb"
SESSION_MONGODB = client
SESSION_MONGODB_DB = MONGO_DB
app.config.from_object(__name__)
ses = Session(app)


def save_user(validated_data):
    salt = gensalt(rounds=12)
    password = validated_data['password'].encode("utf-8")
    hashed_pw = hashpw(password, salt)
    validated_data['password'] = hashed_pw
    validated_data.pop('password2')
    
    try:
        db.users.insert_one(validated_data)
    except Exception:
        return False

    return True


def get_user_by_email(email):
    return db.users.find_one({"email": email})


def get_user_by_username(username):
    return db.users.find_one({"username": username})


def check_if_user_credentials_are_valid(email, password): 
    user = get_user_by_email(email)
    if not user:
        return False

    hashed_pw = user.get('password')
    
    user = None
    if checkpw(password.encode(), hashed_pw):
        user = get_user_by_email(email)
    return user


@app.route('/')
def start():
    return render_template('home.html')


@app.route('/sign-up', methods=['GET'])
def registration_view_get():
    return render_template('registration.html')


@app.route('/sign-up', methods=['POST'])
def registration_view_post():
    data = {}
    data['username'] = request.form.get("username")
    data['email'] = request.form.get("email")
    data['password'] = request.form.get("password")
    data['password2'] = request.form.get("password2")
    
    errors = {}
    for k, v in data.items():
        if not v:
            errors[k] = "field cannot be empty"

    if data['username'] and get_user_by_username(data['username']):
        errors['username'] = "username already taken"
    elif data['username'] and not re.match("^[a-zA-Z0-9]{3,12}$", data['username']):
        errors['username'] = "username must contain 3-12 alphanumeric characters"

    if data['email'] and get_user_by_email(data['email']):
        errors['email'] = "email already taken"
    elif data['email'] and not re.match("^[\w\-\.]+@([\w\-]+\.)+[\w]{1,}$", data['email']):
        errors['email'] = "provide a valid email address"

    if data['password'] and not re.match("^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,72}$", data['password']):
        errors['password'] = "password must consist of between 7-82 characters, including a letter, a number and a special character"

    if data['password'] and data['password2'] and not data['password'] == data['password2']:
        errors['password2'] = "passwords don't match"
    
    if errors:
        return jsonify(errors=errors), 400

    data['date_joined'] = datetime.now()
    save_user(data)
    response = make_response("", 301)
    response.headers["Location"] = "/sign-in"

    return response


@app.route('/sign-in', methods=['GET'])
def login_view_get():
    return render_template('login.html')


@app.route('/sign-in', methods=['POST'])
def login_view_post():
    data = {}
    data['email'] = request.form.get("email")  
    data['password'] = request.form.get("password")
    
    errors = {}
    for k, v in data.items():
        if not v:
            errors[k] = "field cannot be empty"

    if errors:
        return jsonify(errors=errors), 400

    user = check_if_user_credentials_are_valid(data['email'], data['password'])
    if user:
        session["username"] = user['username']
        session["timestamp"] = datetime.now()
        response = make_response("", 301)
        response.headers["Location"] = "/"
        return response

    return jsonify(error=f"Failed to login user with credentials given."), 400    


@app.route('/logout', methods=['GET'])
def logout_view():
    session.clear()
    response = make_response("", 301)
    response.headers["Location"] = "/"
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=False)