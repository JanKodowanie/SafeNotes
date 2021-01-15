import pymongo
from bcrypt import checkpw, gensalt, hashpw


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