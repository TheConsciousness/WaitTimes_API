require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const https = require('https');
const fs = require('fs');
var cors = require('cors');

const app = express();

mongoose.set('debug', true);
const connString = 'mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PASS+'@'+process.env.MONGO_HOST+"/"+process.env.MONGO_DBNAME+"?authMechanism=SCRAM-SHA-1&authSource=admin&w=1";

mongoose.connect(connString, {useNewUrlParser: true, useUnifiedTopology: true});


const db = mongoose.connection;
db.on('error', (error) => console.log("db.on.error: "+error));
db.once('open', () => {
	console.log("DB Connected");
});

app.use(cors())
app.use(express.json());

const MainRouter = require("./routes/Main");
app.use("/", MainRouter);


https.createServer({
    key: fs.readFileSync('../certs/jordanbrinkman.dev.key'),
    cert: fs.readFileSync('../certs/jordanbrinkman_dev.crt'),
    ca: fs.readFileSync('../certs/jordanbrinkman_dev.ca-bundle'),
    passphrase: process.env.CERT_PASSPHRASE
}, app)
.listen(3000);

/*
app.listen(3000, () => {
	console.log("Server started on port 3000");
});
*/
