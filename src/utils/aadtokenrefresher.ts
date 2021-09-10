var identity = require("@azure/identity");
var logger = require("./loghelper").logger;
const jwt = require("jsonwebtoken");

const ONE_MINUTE_DELAY=60*1000;

class AzureADRefreshingCredential  {
    private clientId:string;
    private audience:string;
    private credential: any;
    private tokenExpiry: any;
    private creds:any;

    constructor(clientId:string, audience:string) {
        this.clientId = clientId;
        this.audience = audience;
        this.tokenExpiry = Date.now();
        this.creds = null;

        this.credential = new identity.DefaultAzureCredential(
             { ManagedIdentityClientId : this.clientId });
    }

    //
    // use arrow functions since typescript needs this to binding "this".
    //
    public getToken = async() => {
        return this.credential.getToken(this.audience)
        .then ((response:any) => {
            if (response) {
                logger.info("token response %o", response);
                this.tokenExpiry = response.expiresOnTimestamp;
                var decoded = jwt.decode(response.token, {complete : true});
                logger.info("decoded AAD token %o", decoded.payload);
                return response.token;
            }
            else {
                logger.error("response empty in getToken"); 
                throw(new Error("no token in getToken"));
            }
        })
        .catch((error:any) => {
            logger.error("error in getToken %o", error); 
            throw(error); 
        });
    }


    public setRefresh = async (creds:any) => {
        this.creds = creds;
        var delay = this.tokenExpiry  - Date.now();
        if (delay < ONE_MINUTE_DELAY) delay = ONE_MINUTE_DELAY;
        setTimeout(this.tokenRefresh, delay);
    }

    private tokenRefresh = async() =>{
        var delay = ONE_MINUTE_DELAY;

        return this.getToken()
        .then ((token:any) => {
            this.creds.params.WebIdentityToken = token;    
            delay = this.tokenExpiry  - Date.now();
            if (delay < ONE_MINUTE_DELAY) delay = ONE_MINUTE_DELAY;
            setTimeout(this.tokenRefresh, delay);
        })
        .catch((error:any) => {
            logger.error("error in getToken %o", error);  
            setTimeout(this.tokenRefresh, delay);              
        });
    }
}

module.exports= {AzureADRefreshingCredential};