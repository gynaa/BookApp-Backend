const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    image:{
        data:Buffer,
        contentType: String
    }
})

const UserSchema = new Schema({
    name: { type: String, required: false },
    email: { type: String, required: false },
    password: { type: String, required: false },
    location: { type: String, required: false },
    bio: { type: String, required: false },
    favoriteAuthor: { type: String, required: false },
    favoriteBook: { type: String, required: false },
    profileImage: ImageSchema,
});



const User = mongoose.model('User', UserSchema);

module.exports = User;