const dbRoute = require("express").Router();
var httpStatus = require('http-status-codes');
var logger = require("../utils/loghelper").logger;


var DB:any;


dbRoute.route('/table/:name/item/:key')
    .get(function(req:any, res:any) {

        var params = {
            TableName : req.params.name,
            Key: {
                "key_value" : { N : req.params.key}
            }
        };

        DB.getItem(params, function(err:any, data:any) {
            if (err) {
                logger.info("db get %s key %s error %o", req.params.name, req.params.key, err);
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            }
            else {
                logger.info("db get objects bucket %s %s success %o", req.params.name, req.params.key, data);
                res.json(data);
            }
        });
    })
    .post(function(req:any, res:any) {

        var params = {
            TableName : req.params.name,
            Item: req.body
        }
 
        DB.putItem(params, function(err:any, data:any) {
            if (err) {
                logger.info("db put %s key %s error %o", req.params.name, req.params.key, err);
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            }
            else {
                logger.info("db put objects bucket %s %s success %o", req.params.name, req.params.key, data);
                res.json(data);
            }
        });
    })

var wrapper = function(aws:any) {

    DB = new aws.DynamoDB({apiVersion: '2012-08-10'});
    return dbRoute;
}


module.exports = wrapper;
