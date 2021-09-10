const s3Route = require("express").Router();
var httpStatus = require('http-status-codes');
var logger = require("../utils/loghelper").logger;


var S3:any;

s3Route.route('/bucket/:name/list')
    .get(function(req:any, res:any) {

        var bucketParams = {
            Bucket : req.params.name,
          };
        
        S3.listObjects(bucketParams, function(err:any, data:any) {
            if (err) {
                logger.info("s3 list objects bucket %s error %o", req.params.name, err);
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            }
            else {
                logger.info("s3 list objects bucket %s success %o", req.params.name, data);
                res.json(data);
            }
        });
    })

s3Route.route('/bucket/:name/add/:key')
    .post(function(req:any, res:any) {

        var bucketParams = {
            Bucket : req.params.name,
            Key : req.params.key,
            Body: req.Body
          };
        var options = {partSize: 10 * 1024 * 1024, queueSize: 1};

        
        S3.upload(bucketParams, options, function(err:any, data:any) {
            if (err) {
                logger.info("s3 upload objects %s bucket %s key error %o", req.params.name, req.params.key, err);
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            }
            else {
                logger.info("s3 list objects %s bucket %s key success %o", data, req.params.name, req.params.key);
                res.json(data);
            }
        });
    })

var wrapper = function(aws:any) {

    S3 = new aws.S3({apiVersion: '2006-03-01'});
    return s3Route;
}


module.exports = wrapper;
