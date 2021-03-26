const fs = require('fs');
const path = require('path')
const http = require('https');
const Jimp = require("jimp")
const imgFolder = './images/';


let img_processed = 0;
let concurrent = 0;
fs.readdirSync(imgFolder).forEach(file => {


    let filename = file.split('.').slice(0, -1).join('.')
    let extension = file.split('.').slice(-1).join('.')
    // console.log("FILE KEY: " + filename )
    // console.log("extension" + extension )

    if (extension.toLocaleLowerCase() != "jpg" ) return;
    if (filename.endsWith("-125")) return;
   downsample( imgFolder+file, imgFolder+filename+ "-125" + ".jpg", 125 )
   
});

async function downsample( src, dst, height ){
  img_processed++;
 
   if ( fs.existsSync(dst) ) return;
  
   if ( concurrent > 5 ){
     setTimeout(()=>{downsample(src,dst,height)}, 2000 )
     return;
   }
   concurrent++;
   console.log("DOWNSAMPLING PIC\n" + src + "\n----> " + dst );
   const image = await Jimp.read(src);
   await image.resize(Jimp.AUTO, height);
   await image.writeAsync(dst);
   concurrent--;
  
    
}

console.log("DOWNSAMPLE COUNT: " + img_processed );

