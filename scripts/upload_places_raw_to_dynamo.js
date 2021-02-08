var AWS = require("aws-sdk");const fs = require('fs');
let inputFile = "places_raw/ideas.bars.json"
AWS.config.update({
    region: "ca-central-1",
});

data = readAndCleanupData(inputFile)

console.log("DataCount: " , data.length)
console.log (JSON.stringify(data[0]))

uploadToTable( "scoop-prod-places",data)


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
            Item:  item
            
        };
    
        docClient.put(params, function(err, data) {
           if (err) {
               console.error("Unable to add item", item.id, ". Error JSON:", JSON.stringify(err, null, 2));
           } else {
               console.log("PutItem succeeded:", item.id);
           }
        });
    });
}