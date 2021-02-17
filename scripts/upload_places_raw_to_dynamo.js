const fs = require('fs');
var AWS = require("aws-sdk");


AWS.config.update({
    region: "ca-central-1",
});

let inputFolder = "places_raw"
// Loop through all the files in the temp directory
fs.readdir(inputFolder, function (err, files) {
    if (err) {
      console.error("Could not list the directory.", err);
      process.exit(1);
    }
     files.forEach(function(filename){processFile(inputFolder + "/" + filename)})
})

function processFile( inputFile ){
    data = readAndCleanupData(inputFile)

    console.log("DataCount: " , data.length)
    console.log (JSON.stringify(data[0]))

    uploadToTable( "scoop-prod-places",data)
    }

function readAndCleanupData(sourceFile ){
    console.log('reading sourceFile: ', sourceFile);
    data = JSON.parse(fs.readFileSync(sourceFile))["results"]

    for ( k in data ){
        data[k]["id"] = data[k]["place_id"]
     }
     return data
}

function uploadToTable( tableName, data ){
    var docClient = new AWS.DynamoDB.DocumentClient();
    data.forEach(function(item) {
        var params = {
            TableName: tableName,
            Item:  item,
            Key: {"id": item.id }            
        };
    
        docClient.update(params, function(err, data) {
           if (err) {
               console.error("Unable to update item", item.id, ". Error JSON:", JSON.stringify(err, null, 2));
           } else {
               console.log("UpdateItem succeeded:", item.id);
           }
        });
    });
}