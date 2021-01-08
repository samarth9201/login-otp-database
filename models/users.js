const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    publicKey:{
        type: String,
        required: true
    }
},{
    timestamps: true
})

UserSchema.plugin(uniqueValidator)
const User = mongoose.model('user', UserSchema)

module.exports = User