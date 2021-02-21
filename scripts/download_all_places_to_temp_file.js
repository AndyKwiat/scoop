const fs = require('fs');
var AWS = require("aws-sdk");


AWS.config.update({
    region: "ca-central-1",
});

let outputFile = "all_places.json"

var params = {
    TableName: "scoop-prod-places"
  
 };
 var docClient = new AWS.DynamoDB.DocumentClient();
 console.log("Scanning entire table");
 
      // res.send( data );
       onScanWrapper( params,  docClient)

   

 
 
 
 function onScanWrapper( params, docClient ){
   
    let scanFunc = function onScan(err, data) {
       if (err) {
           console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
       } else {
           // print all the stuff
           console.log("Scan succeeded.");
           fs.writeFileSync(outputFile,JSON.stringify(data))
        
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