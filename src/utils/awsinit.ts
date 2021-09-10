const AWS = require("aws-sdk");
const AADTokens = require("./aadtokenrefresher");
var logger = require("../utils/loghelper").logger;



async function aws_init() {
    var params = {
        RoleArn: process.env.ROLE_ARN,
        WebIdentityToken: null, // token from identity service
        RoleSessionName: process.env.ROLE_SESSION_NAME
    };

    var client_id = process.env.CLIENT_ID;
    var audience = process.env.AUDIENCE;

    AWS.config.update({region: 'us-west-2'});
    const tokenHelper = new AADTokens.AzureADRefreshingCredential(client_id, audience);
    params.WebIdentityToken = await tokenHelper.getToken();
    AWS.config.credentials = new AWS.WebIdentityCredentials(params);
    logger.info("creds in aws init are %o", AWS.config);
    tokenHelper.setRefresh(AWS.config.credentials);

    console.log("returning AWS");

    return AWS;
}

module.exports=aws_init;

