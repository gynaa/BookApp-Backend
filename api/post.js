const express = require('express');
const router = express.Router();
const cors = require('cors');
const mongoose = require('mongoose');
const multer =require('multer');
const fs = require('fs');
const path = require('path');

const Storage = multer.memoryStorage({
    destination: "uploads",
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    },});

const upload = multer({
    storage:Storage
}).single('bookImage')

//mongodb user model
const Post = require('./../models/post')

//Password handler
const bcrypt = require('bcrypt');

router.post('/postuploadImage', async (req, res) => {

    // Handle image upload
    upload(req, res, async (err) => {

    let{email, postbio, posttitle, postauthor} = req.body;
    //const post = await Post.findOne({email});
    {/*if (!post) {
        return res.status(404).json({ message: "User not found" });
    } else{}*/}


    try {


        const newPost = new Post({
            email,
            allposts:{
                postbio,
                posttitle, 
                postauthor,
                bookImage: {
                    name: req.file.originalname,
                    image: {
                        data: req.file.buffer,
                        contentType: req.file.mimetype
                    }
            }
            }
            
        });
        
        newPost.save().then(result => {
            res.json({
                status: "SUCCESS",
                message: "Posting successful",
                data: result,
            })
        })
        .catch(err => {
            res.json({
                status: "FAILED",
                message: "Error while posting post!"
            })
        
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
    
    return res.status(200).json({ message: "Image uploaded successfully" });

    });
});

//for fetching
router.post('/fetchpost', async (req, res) => {
    let { email } = req.body; 

    const posts = await Post.find({ email });
    
    if (!posts || posts.length === 0) {
        return res.status(404).json({ message: "No posts found for this user" });
    }

    try {
        const postData = posts.map(post => {
            const imageBuffer = post.allposts.bookImage.image.data;
            const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

            return {
                id: post._id,
                postbio: post.allposts.postbio,
                posttitle: post.allposts.posttitle,
                postauthor: post.allposts.postauthor,
                imageBuffer: base64Image
            };
        });
    
    
        res.status(200).json({ postData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.patch('/updatepost', async (req, res) => {

    let{postid, postbio, posttitle, postauthor} = req.body;
    let updating = {_id: postid};
    let new_bio = {postbio, postbio};
    let new_author = {posttitle, posttitle};
    let new_book = {postauthor, postauthor};

    try {
        const updatedPost = await Post.findOneAndUpdate(updating, new_bio);
        const updatedPost2 = await Post.findOneAndUpdate(updating, new_author);
        const updatedPost3 = await Post.findOneAndUpdate(updating, new_book);
        res.status(200).json({ message: 'SUCCESS', post: updatedPost3 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }    
});


module.exports = router;

{/*const post = await Post.find({email});
    if (!post) {
        return res.status(404).json({ message: "User not found" });
    }

    try {
        console.log(post)
        const imageBuffer = post.allposts.bookImage.image.data;
        const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

        const postData = {
            postbio: post.allposts.postbio,
            posttitle: post.allposts.posttitle,
            postauthor: post.allposts.postauthor,
            imageBuffer: base64Image
            };*/}