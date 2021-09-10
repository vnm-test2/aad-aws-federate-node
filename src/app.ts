const express = require("express");
var logHelper = require("./utils/loghelper");
const awsinit = require("./utils/awsinit");
var s3Router = require("./api/s3route");
var dbRouter = require("./api/dbroute");

require('dotenv').config();

var port = process.env.PORT || 3001;

var app = express();
//
// initialize the logger
//
logHelper.init(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("aws init calling");
awsinit()
.then(function(aws:any) {
    logHelper.logger.info("aws init done %o", aws);
    logHelper.logger.info("aws creds are %o", aws.config.credentials);

    app.use("/api/s3", s3Router(aws));
    app.use("/api/db", dbRouter(aws));

    // we publish 2 apis: one to get a secret and the other to get a secret using a particular managed identity


    app.listen(port);
    logHelper.logger.info("express now running on poprt %d", port);
})
.catch(function(error:any) {
    logHelper.logger.info("express failed %o", error);
});
