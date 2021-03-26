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

