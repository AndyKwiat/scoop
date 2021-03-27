#!/usr/bin/env node


var AWS = require("aws-sdk");
const { NetworkAuthenticationRequire } = require("http-errors");
const { GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuid } = require('uuid');

AWS.config.update({
    region: "ca-central-1",
});

var docClient = new AWS.DynamoDB.DocumentClient();


let cachedData={}
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
   flushCache()
   res.send(200)
})

app.get('/runjob', function(req,res){
   log("RUNNING JOB")
   if ( !cachedData.placesAll ){
      throw new Error("NO CACHE FOR JOB")
   }
   let count = 0;
   log("RUNNING YELLOW PHOTO JOB")
   cachedData.placesAll.forEach( x=>{
      if ( (x.scoop_status=="green" || !x.scoop_status )
         && (!x.photos || x.photos.length <=0) ){
            x.scoop_status = "yellow"
            dbSaveItem(x)
            count++
         }
   })
   console.log("JOB DONE COUNT: ",count)
   /// enter job here
   res.send(200)
})



app.use( express.static("editor/public"))
app.use(express.json());
 
app.post( '/saveItem', function(req, res ){
   
   let item = req.body

   getItemById( item.id ).then( prevItem=>{
    //  console.log( "PREV: \n" + JSON.stringify(prevItem) )
   //   console.log( "NEW: \n" + JSON.stringify(item) )
   
      changes= findChanges( prevItem, item )
      if (changes.length != 1 ){
         sendError( res, "Too many changes", changes)
         return   
      }
      if (changes.key == "id"){
         sendError(res, "Can't change id")
         return
      }

      
   dbSaveItem( item,res )
   })
   
})

function dbSaveItem( item,res ){
   let params = { TableName: "scoop-prod-places", Item:  item}
   docClient.put(params, function(err, data) {
      if (err) {
            console.error("Unable to add item", item.id, ". Error JSON:", JSON.stringify(err, null, 2));
            sendError(res, "Unable to save item", err)
      } else {
            console.log("PutItem succeeded:", item.id);
            if (res )
            res.send(changes)
            flushCache( item )
      }
  });
}

function flushCache( item ){
   if ( item ){
      if (cachedData.placesAll){
         cachedData.placesAll.forEach((x,idx)=>{
            if ( x.id == item.id){
               cachedData[idx]=item
            }
         })
      }
      // surgically replace the cache
      ["placesAll","placesActive"].forEach( (key)=>{
         if (cachedData[key]){
            cachedData[key].forEach((x,idx)=>{
               if ( x.id == item.id){
                  cachedData[key][idx]=item
               }
            })
         }
      })
      
   }
   else{
      log("BIG CACHE FLUSH")
      cachedData = {};
   }
}
function sendError( res, msg, obj ){
   res.status(400).send( {error:msg,data:obj} )
  
}

function findChanges(prevItem, item ){
   let map = deepDiffMapper.map( prevItem, item )
   let changes = []
   findChangesHelper( map, changes )
   return changes
 
}
function findChangesHelper( map , changes ){
   for ( const k in map ){
      if ( !map[k].diff_type ){
         findChangesHelper( map[k], changes )
      }
      else if (map[k].diff_type != "unchanged" ){
         changes.push( {key: k, change: map[k]})
      }
   }
}
async function getItemById( id ){
   let cache = await withCache( "placesAll",async ()=>{
      return await onScanWrapper( { TableName: "scoop-prod-places"})
   })


   for (i=0; i < cache.length; i++ ){
      let item = cache[i];
      if ( item.id === id )
      return item;
   }
   return null
 
}


app.get('/places', function (req, res) {
   console.log("PARAMS: "+ JSON.stringify(req.query))
   if (req.query.all  ){

         withCache( "placesAll", async function(){
            return await onScanWrapper( { TableName: "scoop-prod-places"})})
            .then( data=>res.send(data))
     
   }else{
     
         withCache( "placesActive", async function() {
            data = await onScanWrapper( { TableName: "scoop-prod-places"}) 
            return data.filter ( (p => !p.scoop_status || !p.scoop_status == "green") &&
             p.photos)
         }).then( data=>res.send(data))
      
   }
  
})

var server = app.listen(3000, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Scoop server listening at http://%s:%s", host, port)
})

async function withCache( key,  fetchFunc ){
   return new Promise( async (resolve,reject)=>{
   if ( !( key in cachedData )){
      log("Fetching data: " + key )
      cachedData[key] = await fetchFunc()
   }else{
      log("Cached Data Found: " + key )
   }
   resolve(cachedData[key])
   })
}
async function onScanWrapper( params, dc=docClient ){
   return new Promise( (resolve, reject) => {
   let scanFunc = function onScan(err, data) {
      if (err) {
         throw new Error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          // print all the stuff
          console.log("Scan succeeded.");
          resolve(data.Items)
          return 
         
        
   
          // continue scanning if we have more movies, because
          // scan can retrieve a maximum of 1MB of data
          if (typeof data.LastEvaluatedKey != "undefined") {
              console.log("Scanning for more...");
              params.ExclusiveStartKey = data.LastEvaluatedKey;
              onScanWrapper( params,  dc)
             // docClient.scan(params, scanFunc);
          }
      }
   }
   dc.scan(params, scanFunc);
   })
}

let authKeyEditor = "CHANGE_ME_EDITOR_KEY" ; // uuid()

function checkAuth(req,res,next){
 
  // console.log( "REQ PATH: " + req.path)
  // console.log ( JSON.stringify(req.headers))
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

var deepDiffMapper = function () {
   return {
     VALUE_CREATED: 'created',
     VALUE_UPDATED: 'updated',
     VALUE_DELETED: 'deleted',
     VALUE_UNCHANGED: 'unchanged',
     map: function(obj1, obj2) {
       if (this.isFunction(obj1) || this.isFunction(obj2)) {
         throw 'Invalid argument. Function given, object expected.';
       }
       if (this.isValue(obj1) || this.isValue(obj2)) {
         return {
           diff_type: this.compareValues(obj1, obj2),
           data: obj1 === undefined ? obj2 : obj1
         };
       }
 
       var diff = {};
       for (var key in obj1) {
         if (this.isFunction(obj1[key])) {
           continue;
         }
 
         var value2 = undefined;
         if (obj2[key] !== undefined) {
           value2 = obj2[key];
         }
         temp = this.map(obj1[key], value2);

            diff[key] = temp
       }
       for (var key in obj2) {
         if (this.isFunction(obj2[key]) || diff[key] !== undefined) {
           continue;
         }
         temp = this.map(undefined, obj2[key]);

            diff[key] = temp;
       }
 
       return diff;
 
     },
     compareValues: function (value1, value2) {
       if (value1 === value2) {
         return this.VALUE_UNCHANGED;
       }
       if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
         return this.VALUE_UNCHANGED;
       }
       if (value1 === undefined) {
         return this.VALUE_CREATED;
       }
       if (value2 === undefined) {
         return this.VALUE_DELETED;
       }
       return this.VALUE_UPDATED;
     },
     isFunction: function (x) {
       return Object.prototype.toString.call(x) === '[object Function]';
     },
     isArray: function (x) {
       return Object.prototype.toString.call(x) === '[object Array]';
     },
     isDate: function (x) {
       return Object.prototype.toString.call(x) === '[object Date]';
     },
     isObject: function (x) {
       return Object.prototype.toString.call(x) === '[object Object]';
     },
     isValue: function (x) {
       return !this.isObject(x) && !this.isArray(x);
     }
   }
 }();
 
