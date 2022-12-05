const express = require("express");
const cors = require("cors");
const config = require("./config");
const routes = require("./routes/routes");
const path = require('path');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'assets')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('/views', path.join(__dirname, 'views'));

// Routes
app.use("/", routes.routes);

app.listen(config.port, () => {
    console.log("Service endpoint= %s", config.url);
});
