const fs = require('fs');
var AWS = require("aws-sdk");
const got = require('got');
const { PutItemCommand } = require('@aws-sdk/client-dynamodb');

const API_KEY = process.env.PLACESAPI

AWS.config.update({
    region: "ca-central-1",
});
var docClient = new AWS.DynamoDB.DocumentClient();
let sourceFile = "all_places.json"

console.log('reading sourceFile: ', sourceFile);
data = JSON.parse(fs.readFileSync(sourceFile))
console.log("done.")


var params = {
    TableName: "scoop-prod-places"
  
 };
 var docClient = new AWS.DynamoDB.DocumentClient();
function log (str){
    console.log(str);
}

 let places = data.Items;
 for ( let i=0; i < places.length; i++ ){
     log( "reading details for " + places[i].name + " id: " + places[i].id)
     let prom =  fetchDetails( places[i].id );
     prom.then( (data)=>{
     log("DOWNLOADED DETAILS" );
        Object.assign(places[i], JSON.parse(data).result )
        putItem( places[i] )
        // log( JSON.stringify(places[i]) );
     })
     
 }

 async function fetchDetails( id ){
    let uri = "https://maps.googleapis.com/maps/api/place/details/json?key="+
    API_KEY + "&fields=name,formatted_address,photo,opening_hours,formatted_phone_number,website&place_id="+
    id;    
    const response = await got(uri, { reponseType: "json" } )
    return response.body;
 }

 function putItem( item ){
        let params = {
            TableName: "scoop-prod-places",
            Item:  item,
       
        };
    
        docClient.put(params, function(err, data) {
           if (err) {
               console.error("Unable to add item", item.id, ". Error JSON:", JSON.stringify(err, null, 2));
           } else {
               console.log("PutItem succeeded:", item.id);
           }
        });
 }

 
 