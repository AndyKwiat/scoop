const fs = require('fs');
const path = require('path')
const http = require('https');
const Jimp = require("jimp")
const imgFolder = './images/';


let png_count = 0
let new_jpg_count = 0
fs.readdirSync(imgFolder).forEach(file => {


    let filename = file.split('.').slice(0, -1).join('.')
    let extension = file.split('.').slice(-1).join('.')
    // console.log("FILE KEY: " + filename )
    // console.log("extension" + extension )

    if (extension.toLocaleLowerCase() == "png" ){
        png_count++;
        if (!fs.existsSync(imgFolder + filename + ".jpg")){
            convertPNG( imgFolder + filename + "." + extension, imgFolder + filename + ".jpg" )
        }
    }
});

function convertPNG( src, dst ){
    console.log("CONVERTING PNG" + src + "----> " + dst );
    new_jpg_count++;

    Jimp.read(src, function (err, image) {
        if (err) {
          console.log(err)
        } else {
          image.write(dst)
        }
      })
}

console.log("PNG COUNT: " + png_count );
console.log("NEW JPG: " + new_jpg_count);
