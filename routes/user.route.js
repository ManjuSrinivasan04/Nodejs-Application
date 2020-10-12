const express = require('express')
require('../db/mongoose')
const User = require('../model/user')
const auth = require('../middlewares/auth');
const dotenv = require('dotenv')
dotenv.config();

const router = express.Router()

router.post('/createUser',async(req,res)=>{
    //const user= new User(req.body)
    try {

       const { email,password } = req.body;
        // Make sure this account doesn't already exist
        const user = await User.findOne({ email });

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
        let token1 = await user.generateAuthToken();

        //const verifyToken = async (req, res, next) => {
            let token = req.cookies.token || '';
            try {
              if (!token) {
                return res.status(401).json('You need to Login')
              }
              const decrypt = await jwt.verify(token, process.env.JWT_SECRET);
              req.user = {
                id: decrypt.id,
                firstname: decrypt.firstname,
              };
              next();
            } catch (err) {
              return res.status(500).json(err.toString());
            }
         // };
        if(!user){
            res.status(404).send("invalid user")
        }
        res.send({user,token1})
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
        res.clearCookie('Userdata');
        res.send('logout success')
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/getAllUser',async(req,res)=>{
    try {
        const allUser = await User.find({});
        res.send(req.cookies);
        res.status(200).send(allUser)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router;