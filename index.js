//User Auth dependancies
const passport = require('./passport-config');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const User = require('./models/User');

// dependancies
require('dotenv').config()

//add dependencies for express
let express = require("express");
let app = express();
let bodyParser = require("body-parser");
let http = require("http").Server(app);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine("pug", require("pug").__express);
app.set("views", ".");
app.set("view engine", "pug");

//to serve static files
app.use(express.static(__dirname + '/public'));

// middleware config
app.use(passport.initialize());
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: true }));


const authenticateEmployee = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    if (user.role !== 'Employee') return res.status(403).send('Forbidden');

    req.user = user;
    next();
  })(req, res, next);
};


app.get("/", function (req, res) {
  res.sendFile("/index.html", { root: "." });
});

app.get("/login", function (req, res) {
  res.sendFile("/login.html", { root: "." });
});

app.get("/register", function (req, res) {
  res.sendFile("/register.html", { root: "." });
});


//start Routing functions
//add way for Express app to handle incoming requests and return back
app.get('/create', authenticateEmployee, (req, res) => {
  res.sendFile('/create.html', { root: '.' });
});

app.get("/create", function (req, res) {
  res.sendFile("/create.html", { root: "." });
});

// Register route
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const newUser = new User({ username, password, role });
    await newUser.save();
    res.json({ message: 'User registered' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering the user' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const payload = {
      sub: user._id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});


//post/create function
app.post('/create', authenticateEmployee, (req, res, next) => {
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
});


//update function
app.post('/update', authenticateEmployee, (req, res) => {
  client.connect((err) => {
    if (err) throw err;
    let query = {
      name: req.body.oldname,
      address: req.body.oldaddress,
      telephone: req.body.oldtelephone,
      note: req.body.oldnote,
    };
    let newvalues = {
      $set: {
        name: req.body.name,
        address: req.body.address,
        telephone: req.body.telephone,
        note: req.body.note,
      },
    };
    client
      .db("crmdb")
      .collection("customers")
      .updateOne(query, newvalues, function (err, result) {
        if (err) throw err;
        console.log("1 document updated");
        res.render("update", {
          message: "Customer updated!",
          oldname: req.body.name,
          oldaddress: req.body.address,
          oldtelephone: req.body.telephone,
          oldnote: req.body.note,
          name: req.body.name,
          address: req.body.address,
          telephone: req.body.telephone,
          note: req.body.note,
        });
      });
  });
});

//delete function
app.post("/delete", function (req, res) {
  client.connect((err) => {
    if (err) throw err;
    let query = {
      name: req.body.name,
      address: req.body.address ? req.body.address : null,
      telephone: req.body.telephone ? req.body.telephone : null,
      note: req.body.note ? req.body.note : null,
    };
    client
      .db("crmdb")
      .collection("customers")
      .deleteOne(query, function (err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        res.send(`Customer ${req.body.name} deleted`);
      });
  });
});


//set express server to run
app.set("port", process.env.PORT || 5000);
http.listen(app.get("port"), function () {
  console.log("listening on port", app.get("port"));
});

//update and delete routing functions
app.get("/get", function (req, res) {
  res.sendFile("/get.html", { root: "." });
});

app.get("/get-client", function (req, res) {
  client.connect((err) => {
    client
      .db("crmdb")
      .collection("customers")
      .findOne({ name: req.query.name }, function (err, result) {
        if (err) throw err;
        res.render("update", {
          oldname: result.name,
          oldaddress: result.address,
          oldtelephone: result.telephone,
          oldnote: result.note,
          name: result.name,
          address: result.address,
          telephone: result.telephone,
          note: result.note,
        });
      });
  });
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