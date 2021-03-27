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

export function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

