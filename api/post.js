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
    console.log(req.file);

    //let email = 'ginahesham@gmail.com';
    //let {email_casual} = {email: email};
    try {

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
        // Save the user with the updated profileImage
        await newPost.save();
        
        return res.status(200).json({ message: "Image uploaded successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error uploading image", error: error });
    }
    });
});

{/*router.post('/postupload', async (req, res) => {
    let{email, postbio, posttitle, postauthor} = req.body;

    console.log(req)


    try {
        const newPost = new Post({
            email,
            postbio,
            posttitle, 
            postauthor
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
}); */}

module.exports = router;

