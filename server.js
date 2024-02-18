//mongodb

require('./config/db');

const app = require('express')();
const port = process.env.PORT || 3000;


const UserRouter = require('./api/user');
const PostRouter = require('./api/post');


const bodyParser = require('express').json;
app.use(bodyParser());
const cors = require("cors");
app.use(cors());

app.use('/user', UserRouter)
app.use('/post', PostRouter)


app.listen(port, () => {
    console.log('Server running on port $(port)');
})
