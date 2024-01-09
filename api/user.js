const express = require('express');
const router = express.Router();
const cors = require('cors');

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
                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword).then(result => {
                    if (result) {
                        res.json({
                            status: "SUCCESS",
                            message: "Signin successful",
                            data: data
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

router.patch('/profile/659d40da3d8353ff0483fa16', (req, res) => {
    try {
        let{bio} = req.body;
        const updatedUser = User.findByIdAndUpdate(
          req.params.userId,
          { bio},
          { new: true }
        );
        res.json(updatedUser);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
})

module.exports = router;
