const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');
const dotenv = require('dotenv')
dotenv.config();

//const Token = require('../model/token');

const UserSchema = new mongoose.Schema({
    email: {
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

    username: {
        type: String,
        unique: true,
        required: false,
        index: true,
        sparse: true
    },

    password: {
        type:String,
        trim:true,
        minlength:8,
        maxlength:15,
        required: true
    },

    firstName: {
        type: String,
        required: 'First Name is required',
        max: 100
    },

    lastName: {
        type: String,
        required: 'Last Name is required',
        max: 100
    },

    address:{
       type:String,
       required:"Enter your Address"
    },
    
    resetPasswordToken: {
        type: String,
        required: false
    },

    resetPasswordExpires: {
        type: Date,
        required: false
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
},{timestamps: true});

/*UserSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = await jwt.sign({_id : user._id.toString()}, 'John')

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}*/



UserSchema.methods.generateAuthToken = (res, id, firstname) => {
  const expiration = 604800000;
  const token = jwt.sign({ id, firstname }, process.env.JWT_SECRET, {
    expiresIn:'7d',
  });
  return res.cookie('token', token, {
    expires: new Date(Date.now() + expiration),
    secure: false, // set to true if your using https
    httpOnly: true,
  });
};


UserSchema.statics.findByCredentials = async(email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('given valid email')
    }
    const check = await bcrypt.compare(password,user.password)
    if(!check){
        throw new Error('wrong password!')
    }
    return user
}

UserSchema.pre('save', async function (next){
    const user = this 
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

//const User = mongoose.model('userDetails',UserSchema)
//module.exports = User

UserSchema.pre('save',  function(next) {
    const user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateJWT = function() {
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

UserSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

UserSchema.methods.generateVerificationToken = function() {
    let payload = {
        userId: this._id,
        token: crypto.randomBytes(20).toString('hex')
    };

    return new Token(payload);
};

module.exports = mongoose.model('Users', UserSchema);