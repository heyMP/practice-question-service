const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

// routes
require("./createQuestion.js")(app)
require("./auth.js")(app)

app.listen(PORT);
