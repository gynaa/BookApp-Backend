const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = mongoose.Schema({
    name:{
        type:String,
        required: false
    },
    image:{
        data:Buffer,
        contentType: String
    }
})
const SubPostSchema = mongoose.Schema({
        postbio: { type: String, required: false },
        posttitle: { type: String, required: false } ,
        postauthor: { type: String, required: false },
        genre: { type: String, required: false },
        dowhat: { type: String, required: false },
        bookImage: ImageSchema
   
});
const PostSchema = new Schema({
    email: { type: String, required: true },
    allposts: SubPostSchema
    
},
    {timestamps: true}
);



const Post = mongoose.model('Post', PostSchema);

module.exports = Post;