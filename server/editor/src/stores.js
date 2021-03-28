import { writable } from 'svelte/store';

export const AuthStore = writable({loggedIn:false});
export const SERVER_URL = window.location.hostname.includes("localhost") ?"http://localhost:3000":""
export const StatusLog =  writable({status:""})

export function addStatus( str ){
    StatusLog.set({status:str})
}

let AuthKey="invalid"
AuthStore.subscribe(value => {
    AuthKey = value.key;
});

export function SaveItem( item ){
    addStatus( "Saving item...")
    saveItemPromise(item).then(
        addStatus("Saved!")
    ).catch(e=>{
        console.log(e.message)
        addStatus("-save failed-")
    })
}

async function saveItemPromise(item) {
		
    const response = await self.fetch(SERVER_URL + '/saveItem',
    {
       
        method: 'post', 
        headers: new Headers({
            'Authorization': AuthKey,
            'Accept': 'application/json',
      'Content-Type': 'application/json'
            }),
            body: JSON.stringify(item)
    })

    if (response.ok) {		
          return response.json();
        
    } else {
        if ( response.status == 401 ){
            AuthStore.set( {loggedIn:false})

        }
        throw new Error("Something went wrong" + response.statusText);
    }
}


 export  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2,unit="K") {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist;
    }
}