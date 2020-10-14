const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt =require('bcryptjs')
const jwt = require('jsonwebtoken')

const userScheme = new mongoose.Schema({
    email :{
        type:String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('enter valid email address')
            }
        }
    },

    username: {
        type: String,
        unique: true,
        required: false,
        index: true,
        sparse: true
    },

   
    firstName: {
        type: String,
        required: false,
        max: 100
    },

    lastName: {
        type: String,
        required: false,
        max: 100
    },

    address:{
       type:String,
       required:false
    },
    
    resetPasswordToken: {
        type: String,
        required: false
    },

    resetPasswordExpires: {
        type: Date,
        required: false
    },
    password:{
        type:String,
        trim:true,
        minlength: 8,
        required:true,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    tokens:[{
        token:{
            type:String,
            required:true     
        }
    }]
})

userScheme.methods.generateAuthToken = async function(){
    const user = this
    const token = await jwt.sign({_id : user._id.toString()}, 'john')
    //await user.save()
    console.log(token)
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

userScheme.pre('save',async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})


userScheme.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

userScheme.methods.generateJWT = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    let payload = {
        id: this._id,
        email: this.email,
        username: this.username,
        firstName: this.firstName,
        lastName: this.lastName,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: parseInt(expirationDate.getTime() / 1000, 10)
    });
};

userScheme.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

userScheme.methods.generateVerificationToken = function() {
    let payload = {
        userId: this._id,
        token: crypto.randomBytes(20).toString('hex')
    };

    return new Token(payload);
};

const User = mongoose.model('userDetails',userScheme)

module.exports = User;