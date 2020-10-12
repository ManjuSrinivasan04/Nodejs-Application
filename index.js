require('dotenv').config();
const express = require('express')
require('./db/mongoose')
const userRouter= require('./routes/user.route')
const subscribeRouter=require('./routes/subscribe')
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const path = require("path");
const app = express();

let cookieParser = require('cookie-parser');
let session=require('express-session');
let morgan=require('morgan');
app.use(cookieParser());

/*app.use(session({
    secret:"userdata",
    saveUninitialized:false,
    resave:false
}));
app.use('/',function(req,res)
{
    res.send('Express cookies');
    console.log(req.cookies);
    console.log("===================");
    console.log(req.session,{ maxAge: 900000, httpOnly: true });
})*/

app.get('/setcookie', function(req, res){
    // setting cookies
    res.cookie('username', 'manju', { maxAge: 900000, httpOnly: true });
    return res.send('Cookie has been set');
});

app.get('/getcookie', function(req, res) {
    var username = req.cookies['username'];
    if (username) {
        return res.send(username);        
    }

    return res.send('No cookie found');
});

const cors = require('cors');
const passport = require("passport");

const router = express.Router();

app.use(express.json())
app.use(userRouter)
app.use(subscribeRouter)

app.set('view engine', 'html');
app.engine('html', nunjucks.render);
nunjucks.configure('views', { noCache: true });



app.use(express.static(__dirname));
app.use('/styles', express.static('styles'));
app.use(bodyParser());
app.use('/', router);

app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(passport.initialize());
require("./middlewares/jwt")(passport);
require('./routes/index')(app);

//PORT
app.listen(5000, () => {
    console.log("Listening at :5000...");
});

app.use(express.json())
app.use(userRouter)
app.use(subscribeRouter)


