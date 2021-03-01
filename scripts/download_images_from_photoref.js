const fs = require('fs');
const path = require('path')
const http = require('https');
const imgFolder = './images/';

var myArgs = process.argv.slice(2);

if (myArgs.length != 1) {
    console.error("Need exactly one argument, json file containing photorefs")
    return
}
sourceFile = myArgs[0];
console.log('reading sourceFile: ', sourceFile);
data = JSON.parse(fs.readFileSync(sourceFile))
console.log("done.")

allRefs = getNestedValuesByKey(data, "photo_reference")
console.log("photosFound", Object.keys(allRefs).length)

let dupes = 0
fs.readdirSync(imgFolder).forEach(file => {
    let key = file.split('.').slice(0, -1).join('.')

    if (key in allRefs) {
        dupes++
        delete allRefs[key]
    }
});


console.log("removed " + dupes + " exisiting images")
let download_tokens = 2;
for (ref in allRefs) {
    let uri = createGETUri("https://maps.googleapis.com/maps/api/place/photo", {
        maxwidth: 16000,
        photoreference: ref,
        key: process.env.PLACESAPI
    })
    console.log("URI: " + uri )
    
    downloadFile(uri, imgFolder + ref )
}

function pingTimer(){
    console.log("PING TIMER----------->" + download_tokens + " download tokens")
    setTimeout(pingTimer, 1000)
}
pingTimer();

function createGETUri(base, params) {

    let first = true
    for (k in params) {
        if (first) {
            base += "?"
        } else {
            base += "&"
        }
        base += k + "=" + params[k]
        first = false
    }
    return base
}
function downloadFile(url, destFile) {
    if (fs.existsSync(destFile)) throw "FILE EXISTS!! NOT DOWNLOADING" + destFile
    if (fs.existsSync(destFile + ".jpg")) throw "FILE EXISTS!! NOT DOWNLOADING" + destFile
    if (fs.existsSync(destFile + ".png")) throw "FILE EXISTS!! NOT DOWNLOADING" + destFile
    
    if ( download_tokens <=0 ){
        setTimeout ( ()=>{downloadFile( url, destFile )} ,1000 )
        return;
    }
    download_tokens--;

    console.log("download begins: " + url)
    const request = http.get(url, function (response) {
        if ( response.statusCode == 302 ){ // moved
            download_tokens++;
            console.log(JSON.stringify(response.headers))
            let newUri = response.headers.location; //"https://" + response.req.socket._host + response.req.path
           console.log("OK: 302: " + newUri )
           fs.appendFileSync("download302list.txt","\n" +url + " ---> " + newUri)
            downloadFile( newUri, destFile  )
            return
        }

        if ( response.statusCode != 200 ){
            console.log("OOPS: STATUSCODE: " + response.statusCode)
            return
        }
       
        let ext = ""
        if (response.headers['content-type'].includes("jpeg")) ext = ".jpg"
        if (response.headers['content-type'].includes("png")) ext = ".png"
        destFile += ext
        const file = fs.createWriteStream(destFile);
        response.pipe(file);     
        download_tokens++;  
    });
}


function getNestedValuesByKey(theObject, searchKey) {
    var results = {}
    if (theObject instanceof Array) {
        for (var i = 0; i < theObject.length; i++) {
            Object.assign(results, getNestedValuesByKey(theObject[i], searchKey))
        }
    }
    else {
        for (var prop in theObject) {
            if (prop == searchKey) {
                results[theObject[prop]] = true;

            }
            if (theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
                Object.assign(results, getNestedValuesByKey(theObject[prop], searchKey))

            }
        }
    }
    return results;
}