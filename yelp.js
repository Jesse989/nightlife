var oauthSignature = require("oauth-signature");
var n = require('nonce')();
var request = require("request");
var qs = require("querystring");
var _ = require("lodash");


var request_yelp = function(default_parameters, callback) {
    
    //type of request
    var httpMethod = 'GET';
    
    //url for request
    var url = 'http://api.yelp.com/v2/search';
    
    //set parameters
    var set_parameters = { 
        term: 'bars', 
        limit: 12
    };
    
    //require parameters
    var required_parameters = {
        oauth_consumer_key : process.env.oauth_consumer_key,
        oauth_token : process.env.oauth_token,
        oauth_nonce : n(),
        oauth_timestamp : n().toString().substr(0,10),
        oauth_signature_method : 'HMAC-SHA1',
        oauth_version : '1.0'
    };
    
    //combine parameters in order of importance
    var parameters = _.assign(default_parameters, set_parameters, required_parameters);
    
    //set secret here
    var consumerSecret = process.env.consumerSecret;
    var tokenSecret = process.env.tokenSecret;
    
    //call yelp and get a signature that lasts for 300 seconds
    var signature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret, {encodeSignature: false});
    
    //add signature to list of params
    parameters.oauth_signature = signature;
    
    //turn params into query string
    var paramURL = qs.stringify(parameters);
    
    //add the query string to search url
    var apiURL = url+'?'+paramURL;
    //send request
    request(apiURL, function(error, response, body) {
        
        callback(error,response, body);
    });
};

module.exports = request_yelp;