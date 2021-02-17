#!/usr/bin/env node


var AWS = require("aws-sdk");

const { v4: uuid } = require('uuid');

AWS.config.update({
    region: "ca-central-1",
});
let cache = null;
var docClient = new AWS.DynamoDB.DocumentClient();

var express = require('express');
var app = express();
var cors = require('cors');
function log ( str ){
   console.log( str)
}
app.use(cors());
app.use(checkAuth)
app.get( '/editor/login', function(req,res ) {
   if ( req.headers.authorization == "Basic +CHANGE_ME_EDITOR_LOGIN" ){
      log("logged in noice")
      res.send(authKeyEditor)
   }else{
      log("log in bad " + req.headers.authorization)
      log ( JSON.stringify(req.headers))
      res.send(401)
   }
})
app.get('/flushcache', function (req, res ){
   log ("Flush cache requested..." )
   cache = null;
   res.send(200)
})

app.use( express.static("editor/public"))

app.get('/places', function (req, res) {

var params = {
   TableName: "scoop-prod-places"
  /* ProjectionExpression: "#yr, title, info.rating",
   FilterExpression: "#yr between :start_yr and :end_yr",
   ExpressionAttributeNames: {
       "#yr": "year",
   },
   ExpressionAttributeValues: {
        ":start_yr": 1950,
        ":end_yr": 1959 
   }
   */
};

console.log("Scanning entire table");

     // res.send( data );
      onScanWrapper( params, res, docClient)
    
  
})

var server = app.listen(3000, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})


function onScanWrapper( params, response, docClient ){
   if (cache != null ){
      console.log("CACHED RESPONSE!" )
      response.send(cache);
      return;
   }
   let scanFunc = function onScan(err, data) {
      if (err) {
          console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          // print all the stuff
          console.log("Scan succeeded.");
          cache=data;
          response.send(data)
         return
   
          // continue scanning if we have more movies, because
          // scan can retrieve a maximum of 1MB of data
          if (typeof data.LastEvaluatedKey != "undefined") {
              console.log("Scanning for more...");
              params.ExclusiveStartKey = data.LastEvaluatedKey;
              onScanWrapper( params, response, docClient)
             // docClient.scan(params, scanFunc);
          }
      }
   }
   docClient.scan(params, scanFunc);
;}

let authKeyEditor = "CHANGE_ME_EDITOR_KEY" ; // uuid()

function checkAuth(req,res,next){
  
   console.log( "REQ PATH: " + req.path)
   console.log ( JSON.stringify(req.headers))
   if ( req.path.startsWith("/editor") ){ // just serve static files
      next();
      return;
   }
   if ( req.headers.authorization == "CHANGE_ME_APP_KEY" // the app
      || req.headers.authorization == authKeyEditor
   ) 
      next()
   else
      res.send(401)
}
