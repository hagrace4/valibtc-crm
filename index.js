//add dependencies for express
let express = require("express");
let app = express();
let bodyParser = require("body-parser");
let http = require("http").Server(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

//add dependency for mongoDB client
//retrieve mongoDB username and password from env variables
//set const uri to cluster
const MongoClient = require("mongodb").MongoClient;
const mongo_username = process.env["MONGO_USERNAME"];
const mongo_password = process.env["MONGO_PASSWORD"];

const uri = `mongodb+srv://${mongo_username}:${mongo_password}@valibtc-crm-db.7fgtoke.mongodb.net/crmdb?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true });

