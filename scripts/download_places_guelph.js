const API_KEY = process.env.PLACESAPI

const fs = require('fs');
const path = require('path')
const http = require('https');
const LOCATION_DOWNTOWN_GUELPH = "43.538708,-80.246738"
const FILE_PREFIX = "GUELPH_"
const OUTPUT_DIR = "places_raw/";

const tagsToDownload = ["park"]
function log(str ){
    console.log(str)
}
for ( let i=0; i < tagsToDownload.length ; i++ ){
    downloadByTag( tagsToDownload[i] )
}

function downloadByTag( tag ){
    let suffix = Math.floor(Math.random() * 900000) + 100000;
    let downloadTime = (new Date()).toString();
    log("Downloading Tag: " + tag)
    let uri = makeDownloadByTagUri(tag, LOCATION_DOWNTOWN_GUELPH, 25 )
    let pageNum = 1;
    while ( uri ){
        try {
        let data = await downloadPage(uri);
      
        let filename = OUTPUT_DIR + FILE_PREFIX + tag + "_page" + pageNum + "_R"+suffix+ ".json";
        log("writing file: " + filename )
        fs.writeFileSync(filename, JSON.stringify(data) )
        
        uri = makeNextPageUri ( data.next_page_token )
        pageNum+=1
        }catch( er ){
            log ( "ERROR DOWNLOADING: " + uri )
            break;
        }
    }
}
async function  downloadPage(uri ){
    const response = await self.fetch(uri ) 
		if (response.ok) {
  			return response.json();
			
		} else {
		
			throw new Error("Something went wrong" + response.statusText);
		}
}
function makeNextPageUri ( next_page_token ){
    if ( !next_page_token ) {
        return null;
    }
    return "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key="
    + API_KEY + "&pagetoken="+next_page_token;
}
function makeDownloadByTagUri( tag, location_coords, dist_km ){
    let dist_meters = dist_km*1000
    let uri ="https://maps.googleapis.com/maps/api/place/nearbysearch/json?key="
    + API_KEY + "&type="+ tag + "&radius="+dist_meters+
    "&location="+ location_coords;
}



