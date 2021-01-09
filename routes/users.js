const router = require('express').Router()
const nodemailer = require('nodemailer')
const User = require('../models/users')
const bcrypt = require('bcrypt')
const redis = require('redis')
const jwt = require('jsonwebtoken')
const eccrypto = require('eccrypto')
const { promisify } = require('util')
const { generateKeyPairSync } = require('crypto')
require('dotenv').config()

const client = redis.createClient(process.env.REDIS_URL)
client.on('connect', () => {
  console.log('Redis Client Connected')
})
client.on('error', (err) => {
  console.log('Something went wrong ' + err)
})

const redisSet = promisify(client.set).bind(client)
const redisGet = promisify(client.get).bind(client)

const transporter = nodemailer.createTransport({
  host: 'smtp.google.com',
  port: 465,
  secure: true,
  service: 'Gmail',

  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
})

router.route('/verify').post(async (req, res) => {
  try {
    const { otp, email } = req.body
    const OTP = await redisGet(email)
    if (OTP.toString() === otp.toString()) {
      await redisSet(email, 'True')
      res.json({ error: false, message: 'EMAIL VERIFIED SUCCESSFULLY' })
    } else {
      res.status(401).json({ error: true, message: 'WRONG OTP' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(error.message)
  }
})

router.route('/register').post(async (req, res) => {
  try {
    const { email, name, password } = req.body
    const EMAIL = await redisGet(email)
    const exists = await User.findOne({ email: email })
    console.log(exists);
    if (exists) {
      return res.status(409).json({ error: true, message: 'User Already Exists' })
    }
    if (EMAIL === 'True') {

      const privateKey = eccrypto.generatePrivate()
      const publicKey = eccrypto.getPublic(privateKey)

      const hash = await bcrypt.hash(password, 10)
      const newUser = new User({
        name: name,
        email: email,
        password: hash,
        publicKey: publicKey.toString('hex')
      })
      await newUser.save()
      const token = jwt.sign({ _id: newUser._id }, process.env.TOKEN_SECRET)
      res.json({
        Token: token,
        User: newUser,
        'Public Key': publicKey.toString('hex'),
        'Private Key': privateKey.toString('hex')
      })
    } else {
      res.status(401).json({ error: true, message: 'EMAIL NOT VERIFIED' })
    }
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
})

router.route('/send').post(async (req, res) => {
  try {
    const { email } = req.body
    const minim = 10000
    const maxim = 99999
    const otp = Math.floor(Math.random() * (maxim - minim + 1)) + minim
    const mailOptions = {
      to: email,
      subject: 'Otp for registration',
      html: '<h3>OTP for account verification is </h3>' + '<h1 style=\'font-weight:bold;\'>' + otp + '</h1>' // html body
    }
    await transporter.sendMail(mailOptions)
    await redisSet(email, otp)
    res.json({ error: false, message: 'Email Sent' })
  } catch (err) {
    console.log(err)
    res.status(500).send(err.message)
  }
})

router.route('/login').post(async (req, res) => {
  try {
    const {email, password, privateKey } = req.body
    const user = await User.findOne({ email: email })
    bcrypt.compare(password, user.password, (err, result) =>{
      if(err){
        res.status(400).send(err);
      }
      if(result === true){
        const publicKey = eccrypto.getPublic(Buffer.from(privateKey, 'hex'))
        if(publicKey.toString('hex') != user.publicKey){
          throw new Error("Invalid Private Key")
        }
        const token = jwt.sign(
          {
            email: user.email,
            publicKey: user.publicKey
          },
          process.env.TOKEN_SECRET
        )

        res.status(200).json({
          error: false,
          token: token
        })
      }
    })
  }
  catch (error) {
    console.log(err)
    res.status(500).send(err.message)
  }
})

module.exports = router
