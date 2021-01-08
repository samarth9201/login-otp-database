const router = require('express').Router()
const nodemailer = require('nodemailer')
const User = require('../models/users')
const bcrypt = require('bcrypt')
const { generateKeyPair } = require('crypto');
require('dotenv').config()

let transporter = nodemailer.createTransport({
    host: "smtp.google.com",
    port: 465,
    secure: true,
    service: 'Gmail',

    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

let OTP
let EMAIL = {
    verified: false,
    email: ""
}

router.route('/verify').post((req, res) => {
    try {
        console.log(req.body.otp);

        if (OTP === parseInt(req.body.otp)) {
            EMAIL.verified = true
            res.send(EMAIL)
        }
        else{
            throw new Error("Wrong OTP")
        }
    }
    catch (error) {
        console.log(err);
        res.status(500).send(err.message)
    }
})

router.route('/register').post((req, res) =>{
    try{
        if(EMAIL.verified === true){
            generateKeyPair('rsa', {
                modulusLength: 4096,
                namedCurve: 'secp256k1',   // Options 
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'der'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'der',
                }
            },
                async (err, publicKey, privateKey) => { // Callback function 
                    if (!err) {
                        const hash = await bcrypt.hash(req.body.password, 10)
                        const newUser = new User({
                            name: req.body.name,
                            email: EMAIL.email,
                            password: hash,
                            publicKey: publicKey
                        })
                        await newUser.save()
    
                        console.log("Public Key is: ",
                            publicKey.toString('hex'));
                            console.log();
                        console.log("Private Key is: ",
                            privateKey.toString('hex'));
    
                        res.json({
                            "User": newUser,
                            "Public Key": publicKey.toString('hex'),
                            "Private Key": privateKey.toString('hex')
                        })
                    }
                    else {
                        throw err
                    }
    
                });
        }
        else{
            throw new Error("Email not verified")
        }
    }
    catch(error){
        console.log(error);
        res.status(400).send(eror.message)
    }
})

router.route('/send').post(async (req, res) => {
    try {
        var otp = Math.random();
        otp = otp * 1000000;
        otp = parseInt(otp);

        EMAIL.email = req.body.email

        var mailOptions = {
            to: req.body.email,
            subject: "Otp for registration",
            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
            try {
                console.log('Message sent: %s', info.messageId);
                OTP = otp
                res.send("Email Sent")
            }
            catch (error) {
                console.log(err);
                res.status(500).send(err.message)
            }
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err.message)
    }
})

module.exports = router