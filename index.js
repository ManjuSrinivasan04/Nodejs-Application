require('dotenv').config();
const express = require('express')
const cookieParser = require('cookie-parser')
require('./db/mongoose')
const userRouter= require('./routes/user.route')
const bodyParser=require('body-parser');


const app = express()
const port = process.env.PORT || 3000

app.get('/',(req,res)=>{
    res.send("And now you are in Home Page");
});

app.use(express.json())
app.use(cookieParser())
app.use(userRouter)


app.listen(port, ()=>{
    console.log('Server Running on the Port '+port)
})




