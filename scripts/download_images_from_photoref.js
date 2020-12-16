const fs = require('fs');
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

downloadFile("https://googlechrome.github.io/samples/picture-element/images/kitten-small.png", "kat")
function downloadFile(url, destFile) {
    if (fs.existsSync(destFile)) throw "FILE EXISTS!! NOT DOWNLOADING" + destFile
    if (fs.existsSync(destFile+".jpg")) throw "FILE EXISTS!! NOT DOWNLOADING" + destFile
    if (fs.existsSync(destFile+".png")) throw "FILE EXISTS!! NOT DOWNLOADING" + destFile
    const file = fs.createWriteStream(destFile);
    console.log("download begins: " + url)
    const request = http.get(url, function (response) {
        let ext = ""
        if (response.headers['content-type'].includes("jpeg")) ext = ".jpg"
        if (response.headers['content-type'].includes("png")) ext = ".png"
        response.pipe(file);
        console.log("download ends:" + destFile)
        if (ext.length > 0) {
            console.log("adding extension: " + destFile + "  ->" + ext)
            fs.renameSync(destFile, destFile + ext)
        }
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