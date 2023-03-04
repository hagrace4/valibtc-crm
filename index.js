//add dependencies for express
let express = require("express");
let app = express();
let bodyParser = require("body-parser");
let http = require("http").Server(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

//add way for Express app to handle incoming requests and return back
app.get("/", function (req, res) {
  res.sendFile("/index.html", { root: "."});
});

app.get("/create", function (req, res) {
  res.sendFile("/create.html", { root: "."});
});

//post/create function
app.post("/create", function (req, res, next) {
  client.connect((err) => {
    const customers = client.db("crmdb").collection("customers");

    let customer = {
      name: req.body.name,
      address: req.body.address,
      telephone: req.body.telephone,
      note: req.body.note,
    };
    customers.insertOne(customer, function (err, res) {
      if (err) throw err;
      console.log("1 customer inserted");
    });
  });
  res.send("Customer created");
})

//set express server to run
app.set("port", process.env.PORT || 5000);
http.listen(app.get("port"), function () {
  console.log("listening on port", app.get("port"));
});

//add dependency for mongoDB client
//retrieve mongoDB username and password from env variables
//set const uri to cluster
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongo_username = process.env["MONGO_USERNAME"];
const mongo_password = process.env["MONGO_PASSWORD"];

//New Drivers
const uri = `mongodb+srv://${mongo_username}:${mongo_password}@crmdb.7fgtoke.mongodb.net/crmdb?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//check mongoDB connection
let db;

MongoClient.connect(uri, { useNewUrlParser: true }, function (err, client) {
  if (err) {
    console.error("Error connecting to MongoDB cluster", err);
  } else {
    console.log("Connected to MongoDB cluster");
    db = client.db("crmdb");
  }
});