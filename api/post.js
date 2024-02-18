const express = require('express');
const router = express.PostRouter();
const cors = require('cors');
const mongoose = require('mongoose');
const multer =require('multer');
const fs = require('fs');
const path = require('path');

{/*const Storage = multer.memoryStorage({
    destination: "uploads",
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    },});

const upload = multer({
    storage:Storage
}).single('testImage')*/}

//mongodb user model
const Post = require('./../models/post')

//Password handler
const bcrypt = require('bcrypt');


router.post('/postupload', async (req, res) => {
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
});

module.exports = router;

