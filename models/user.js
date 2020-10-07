const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt =require('bcryptjs')
const jwt = require('jsonwebtoken')


const userScheme = new mongoose.Schema({
    email:{
        type:String,
        required: true,
        unique: true,
        trim: true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is not valid')
            }
        }
    },
    password:{
        type:String,
        trim:true,
        minlength:8,
        required: true
    },
    enable2FA:{
        type: Boolean,
        default: false
    },
    secret2FA:{
        type: String,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    tokens:[{
        token:{
            type:String,
            required: true
        }
    }]
})

userScheme.methods.generateAuthToken = async function(){
    const user = this
    const token = await jwt.sign({_id : user._id.toString()}, 'John')

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userScheme.statics.findByCredentials = async(email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('given valid email')
    }
    const check = await bcrypt.compare(password,user.password)
    if(!check){
        throw new Error('wrong password')
    }
    return user
}

userScheme.pre('save', async function (next){
    const user = this 
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model('userDetails',userScheme)

module.exports = User