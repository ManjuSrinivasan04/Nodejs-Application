require('dotenv').config();
const express = require('express')
require('./db/mongoose')
const userRouter= require('./routes/user')
const subscribeRouter=require('./routes/subscribe')
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const path = require("path");

const cors = require('cors');
const passport = require("passport");

const router = express.Router();

const app = express();



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


