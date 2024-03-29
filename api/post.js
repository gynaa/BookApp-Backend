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

    let{email, postbio, posttitle, postauthor, genre, dowhat} = req.body;
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
                genre,
                dowhat,
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
                genre: post.allposts.genre,
                dowhat: post.allposts.dowhat,
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
    const { postid, postbio, posttitle, postauthor } = req.body;
    const filter = {_id: postid};
    const new_authorpost = {allposts:
        {postauthor: postauthor,
        postbio: postbio,
        posttitle: posttitle
    }
    };

    try {
        const updatedPost = await Post.findOneAndUpdate(filter, new_authorpost, {new: true} );
        
        res.status(200).json({ message: 'SUCCESS', post: updatedPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }    
});

router.delete('/deletepost', async (req, res) => {
    const { postid} = req.body;
    const filter = {_id: postid};
    
    try {
        const updatedPost = await Post.findOneAndDelete(filter);
        
        res.status(200).json({ message: 'SUCCESS', post: updatedPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }    
});

router.post('/discover', async (req, res) => {
    let { email } = req.body; 

    const posts = await Post.find({ email: {$ne: email }});    

    try {
        const postData = posts.map(post => {
            const imageBuffer = post.allposts.bookImage.image.data;
            const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

            return {
                id: post._id,
                email: post.email,
                postbio: post.allposts.postbio,
                posttitle: post.allposts.posttitle,
                postauthor: post.allposts.postauthor,
                genre: post.allposts.genre,
                dowhat: post.allposts.dowhat,
                imageBuffer: base64Image
            };
        });
    
    
        res.status(200).json({ postData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/findall', async(req, res) => {

    try {
        const { keyword } = req.body;
        
        // Await the execution of the query
        const posts = await Post.find({ $or: [
            { 'allposts.postbio': { $regex: keyword, $options: 'i' } },
            { 'allposts.posttitle': { $regex: keyword, $options: 'i' } },
            { 'allposts.postauthor': { $regex: keyword, $options: 'i' } },
            { 'allposts.genre': { $regex: keyword, $options: 'i' } },
            { 'allposts.dowhat': { $regex: keyword, $options: 'i' } }
        ] });
        
        const postData = posts.map(post => {
            const imageBuffer = post.allposts.bookImage.image.data;
            const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

            return {
                id: post._id,
                email: post.email,
                postbio: post.allposts.postbio,
                posttitle: post.allposts.posttitle,
                postauthor: post.allposts.postauthor,
                genre: post.allposts.genre,
                dowhat: post.allposts.dowhat,
                imageBuffer: base64Image
            };
        });

        if (!posts || posts.length === 0) {
            return res.status(404).json({ message: "No posts found for this keyword" });
        }

        // Send the posts as response
        res.status(200).json(postData);
    } catch (error) {
        console.error('Error searching posts:', error);
        // Handle error response
        res.status(500).json({ message: "Internal server error" });
    }
    
});


module.exports = router;

