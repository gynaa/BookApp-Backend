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

const PostSchema = new Schema({
    email: { type: String, required: true },
    postbio: { type: String, required: false },
    posttitle: { type: String, required: false },
    postauthor: { type: String, required: false },
});



const Post = mongoose.model('Post', PostSchema);

module.exports = Post;