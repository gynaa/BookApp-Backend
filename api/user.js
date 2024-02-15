const express = require('express');
const router = express.Router();
const cors = require('cors');
const mongoose = require('mongoose');
const multer =require('multer');
const fs = require('fs');
const path = require('path');


const Storage = multer.memoryStorage();

{/* const Storage = multer.memoryStorage({
    destination: "uploads",
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    },});*/}

const upload = multer({
    storage:Storage
}).single('testImage')

//mongodb user model
const User = require('./../models/user')

//Password handler
const bcrypt = require('bcrypt');

//Signup
router.post('/signup', (req, res) => {
    let{name, email, password, location} = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    location = location.trim();

    if (name == "" || email == "" || password == "" || location == "") {
        res.json({
            status: "FAILED",
            message: "Empty input fields!"
        })
    }else if (!/^[a-zA-Z ]*$/.test(name)){
        res.json({
            status: "FAILED",
            message: "Invalid name entered"
        })
    }else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status: "FAILED",
            message: "Invalid email entered"
        })
    }else if(password.length < 8){
        res.json({
            status: "FAILED",
            message:"Password is too short!"
        })
    }else{
        //check if user already exists

        User.find({email}).then(result => {
            if(result.length){
                res.json({
                    status: "FAILED",
                    message: "User with this email already exists."
                })
            }else{
                 //Try to create new user
                 const saltRounds = 10;
                 bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword,
                        location
                    });

                    newUser.save().then(result => {
                        res.json({
                            status: "SUCCESS",
                            message: "Signup successful",
                            data: result,
                        })
                    })
                    .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "Error while saving user account!"
                        })

                    })

                 })
                 .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "Error while hashing password!"
                    })
                 })
            }
        }).catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                message: "Something went wrong during signup."
            })
        })
    }
})

//Login
router.post('/signin', (req, res) => {
    let{email, password} = req.body;
    email = email.trim();
    password = password.trim();

    if (email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty input fields!"
        })
    }else{
        //check if user exists
        User.find({email})
        .then(data => {
            console.log('Retrieved data from MongoDB:', data);
            if (data.length){

               
                const userId = data[0]._id;
                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword).then(result => {
                    if (result) {
                        res.json({
                            status: "SUCCESS",
                            message: "Signin successful",
                            data
                        })
                    }else{
                        res.json({
                            status: "FAILED",
                            message: "Invalid password entered!"
                        })
                    }
                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "Error occured while comparing passwords."
                    })
                })
            } else {
                res.json({
                    status: "FAILED",
                    message: "Invalid credentials entered!"
                })
            }
        })
        .catch(err => {
            res.json({
                status: "FAILED",
                message: "Error occured while checking for existing user."

            })
        })
    }

})

//Profile

router.patch('/profile', async (req, res) => {

    let { email, bio, favoriteAuthor, favoriteBook } = req.body;
    let updating = {email: email};
    let new_bio = {bio, bio};
    let new_author = {favoriteAuthor, favoriteAuthor};
    let new_book = {favoriteBook, favoriteBook};

    try {
        const updatedUser = await User.findOneAndUpdate(updating, new_bio);
        const updatedUser2 = await User.findOneAndUpdate(updating, new_author);
        const updatedUser3 = await User.findOneAndUpdate(updating, new_book);
        res.status(200).json({ message: 'SUCCESS', user: updatedUser3 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }    
});


// GET route to retrieve favorite book info
router.post('/profile/userinfo', async (req, res) => {
    let { email } = req.body; // Assuming you're passing email as a query parameter
    //console.log(email)

    try {
        const user = await User.findOne({email});
        //console.log(email)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = {
        favoriteBook: user.favoriteBook,
        favoriteAuthor: user.favoriteAuthor,
        bio: user.bio,
        name: user.name,
        location: user.location
        };

        res.status(200).json({ userData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//post image

router.post('/uploadImage', upload.single('testImage'), (req, res) => {

    // Handle image upload
    console.log('UGH');
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ message: "Error uploading image", error: err });
        }
        console.log(req.file);
        let { email } = req.body; 
        //let email = 'ginahesham@gmail.com';
        //let {email_casual} = {email: email};
        try {
            // Find the logged-in user by ID
            const user = await User.findOne({email});
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            //console.log("Req of upload image:", req)

            // Update the user's profileImage with the uploaded image data
            user.profileImage = {
                name: req.file.originalname,
                image: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                }
            };

            // Save the user with the updated profileImage
            await user.save();
            
            return res.status(200).json({ message: "Image uploaded successfully" });
        } catch (error) {
            return res.status(500).json({ message: "Error uploading image", error: error });
        }
    });
});

//for fetching
router.post('/userinfoimage', async (req, res) => {
    let { email } = req.body; // Assuming you're passing email as a query parameter

    //let email = 'ginahesham@gmail.com';
    //let email_casual = {email: email};

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const imageBuffer = user.profileImage.image.data;
        const imageName = user.profileImage.name;

        //console.log("imageBuffer", imageBuffer);

        //const imagePath = path.join('C:\\Users\\Gina Abdelhalim\\Desktop\\login_server', 'uploads', imageName); // Change the directory path as per your requirement

        //fs.writeFileSync(imagePath, imageBuffer);
        const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
        res.status(200).json({ base64Image });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;
