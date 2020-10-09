const express = require('express')
require('./db/mongoose')
const userRouter= require('./routers/user')
const subscribeRouter=require('./routers/subscribe')
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');

const router = express.Router();

const app = express();
app.set('view engine', 'html');
app.engine('html', nunjucks.render);
nunjucks.configure('views', { noCache: true });

app.use(express.static(__dirname));
app.use('/styles', express.static('styles'));
app.use(bodyParser());
app.use('/', router);

//PORT
app.listen(5000, () => {
    console.log("Listening at :5000...");
});

app.use(express.json())
app.use(userRouter)
app.use(subscribeRouter)


