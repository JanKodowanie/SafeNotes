import pymongo
import uuid
from datetime import datetime


class NotesManager:

    def __init__(self, db):
        self.db = db

    def save_note(self, validated_data):
        _id = uuid.uuid4()
        while self.get_note_by_id(_id):
            _id = uuid.uuid4()

        validated_data['_id'] = _id
        validated_data['date_created'] = datetime.now()

        try:
            self.db.notes.insert_one(validated_data)
        except Exception:
            return False

        return True

    def delete_note(self, _id):
        return self.db.notes.delete_one({"_id": _id})

    def update_note(self, _id, validated_data):
        validated_data.pop("_id")
        return self.db.notes.update_one({"_id": _id}, {"$set": validated_data})

    def get_notes_by_author(self, username):
        return self.db.notes.find({"author": username}).sort('date_created', pymongo.DESCENDING)

    def get_public_notes(self):
        return self.db.notes.find({"public": True}).sort('date_created', pymongo.DESCENDING)

    def get_notes_available_to_user(self, username):
        return self.db.notes.find({"$or": [{"public": True}, {"shared_with": username}, {"author": username}]})
            .sort('date_created', pymongo.DESCENDING)

    def get_note_by_id(self, _id):
        return self.db.notes.find_one({"_id": _id})