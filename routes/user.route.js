const express = require('express')
require('../db/mongoose')
const User = require('../model/user.model')
const auth = require('../middlewares/auth')



const router = express.Router()


router.post('/createUser',async(req,res)=>{
    const user= new User(req.body)
    try {
        
        await user.save()
        
        res.status(201).send({user})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/loginUser',async(req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        
        if(!user){
            res.status(404).send("invalid user")
        }
        const token = await user.generateAuthToken()
        res.cookie('token',token,{maxAge: 1000*60*60 , httpOnly: true}).json({success: true, data: token})

        res.send({user,token})
    } catch (error) {
        res.status(500).send(error)
    }  
})

router.post('/logoutUser',auth,async(req,res)=>{
    try {
        // req.user.tokens = req.user.tokens.filter((token)=>{
        //     return token.token !== req.token
        // })
        res.clearCookie('token')
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




module.exports = router