import pymongo
from bcrypt import checkpw, gensalt, hashpw
from Crypto.Random import random
from datetime import datetime, timedelta


class UserManager:

    def __init__(self, db):
        self.db = db
        
    def save_user(self, validated_data):
        salt = gensalt(rounds=12)
        password = validated_data['password'].encode("utf-8")
        hashed_pw = hashpw(password, salt)
        validated_data['password'] = hashed_pw
        validated_data.pop('password2')
        
        try:
            self.db.users.insert_one(validated_data)
        except Exception:
            return False

        return True

    def change_user_password(self, username, new_pass):
        salt = gensalt(rounds=12)
        password = new_pass.encode("utf-8")
        hashed_pw = hashpw(password, salt)
        
        try:
            self.db.users.update_one({'username': username}, {'$set': {'password': hashed_pw}})
        except Exception:
            return False

        return True

    def get_other_users(self, username):
        usernames = []
        for user in self.db.users.find().sort('username'):
            this_username = user['username']
            if this_username != username:
                usernames.append(this_username)
        return usernames

    def get_user_by_email(self, email):
        return self.db.users.find_one({"email": email})

    def get_user_by_username(self, username):
        return self.db.users.find_one({"username": username})

    def check_if_user_credentials_are_valid(self, email, password): 
        user = self.get_user_by_email(email)
        if not user:
            return False

        hashed_pw = user.get('password')
        
        if checkpw(password.encode(), hashed_pw):
            return user
        return None

    def generate_pass_reset_token(self, email):
        alnum = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
        token = ''.join(random.choice(alnum) for _ in range(32))

        expiration_date = datetime.now() + timedelta(hours=24)
        salt = gensalt(rounds=12)
        self.db.reset_tokens.insert_one({
            "token": hashpw(token.encode("utf-8"), salt),
            "expiration_date": expiration_date,
            "email": email
        })

        return token

    def validate_token(self, token):
        tokens = self.db.reset_tokens.find()
        token_db = None
        for t in tokens:
            if checkpw(token.encode("utf-8"), t['token']):
                token_db = t

        if not token_db:
            return False

        if token_db['expiration_date'] < datetime.now():
            self.db.reset_tokens.delete_one({"token": token_db["token"]})
            return False

        return True

    def reset_pass_by_token(self, token, new_pass):
        tokens = self.db.reset_tokens.find()

        token_db = None
        for t in tokens:
            if checkpw(token.encode("utf-8"), t['token']):
                token_db = t

        salt = gensalt(rounds=12)
        password = new_pass.encode("utf-8")
        hashed_pw = hashpw(password, salt)
        
        try:
            self.db.users.update_one({'email': token_db['email']}, {'$set': {'password': hashed_pw}})
        except Exception:
            return False

        self.db.reset_tokens.delete_one({"token": token_db["token"]})
        return True