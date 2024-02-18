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
    const post = await Post.findOne({email});
    if (!post) {
        try {
            const newPost = new Post({
                email,
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
        
        
    } else{
        const newPost = {
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
        };

        post.push(newPost);
        await user.save();

        res.json({
            status: "SUCCESS",
            message: "Posting successful",
            data: newPost,
        });
    } 
    })

    
});

//for fetching
router.post('/fetchpost', async (req, res) => {
    let { email } = req.body; 
    const post = await Post.findOne({email});
    if (!post) {
        return res.status(404).json({ message: "User not found" });
    }

    try {
       
        const imageBuffer = post.postData.imageBuffer;
        const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

        const postData = {
            postbio: post.postbio,
            posttitle: post.posttitle,
            postauthor: post.postauthor,
            imageBuffer: base64Image
            };
    
        res.status(200).json({ postData });

        //const imageBuffer = user.profileImage.image.data;

        //console.log("imageBuffer", imageBuffer);

        //const imagePath = path.join('C:\\Users\\Gina Abdelhalim\\Desktop\\login_server', 'uploads', imageName); // Change the directory path as per your requirement

        //fs.writeFileSync(imagePath, imageBuffer);
        //res.status(200).json({ base64Image });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;

