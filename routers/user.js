const express = require('express')
require('../db/mongoose')
const User = require('../models/user')
const auth = require('../middleware/auth')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')

const router = express.Router()


router.post('/createUser',async(req,res)=>{
    const user= new User(req.body)
    try {
        //const secret = speakeasy.generateSecret({length:20})
       // console.log(secret)
       // user.secret2FA = secret.base32
       const { email } = req.body;

        // Make sure this account doesn't already exist
         await User.findOne({ email });

        if (user) return res.status(401).json({message: 'The email address you have entered is already associated with another account.'});

        await user.save()
        
        res.status(201).send({user})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/loginUser',async(req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        if(!user){
            res.status(404).send("invalid user")
        }
        res.send({user,token})
    } catch (error) {
        res.status(500).send(error)
    }  
})

router.post('/logoutUser',auth,async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send('logout success')
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/getAllUser',auth ,async(req,res)=>{
    try {
        const allUser = await User.find({})
        res.status(200).send(allUser)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/qrcode',auth, async(req, res)=>{
    try {
        const user = req.user
        if(user.enable2FA === true){
                    
            qrcode.toDataURL('otpauth://totp/SecretKey?secret='+user.secret2FA,(err,data)=>{
                if(err){
                    throw Error(err)
                }
                res.send(data)
                console.log(data)
            })
        }else{
            res.send("enable2fa was false check it")
        }     
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/verify2FA',auth,async(req, res)=>{
    try {
        const user = req.user
        console.log(user.secret2FA)
        
        let result = speakeasy.totp.verify({
            secret: user.secret2FA,
            encoding: 'base32',
            token: req.body.otp 
        })
        console.log(result)
        if(result === true){
            return res.send('verified successfully')
        }else{
            return res.send('opt wrong')
        }
    } catch (error) {
        res.status(500).send(error)
    }
});

module.exports = router;