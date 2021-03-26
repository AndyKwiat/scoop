import { writable } from 'svelte/store';

export const AuthStore = writable({loggedIn:false});
export const SERVER_URL = window.location.hostname.includes("localhost") ?"http://localhost:3000":""
export const StatusLog =  writable({status:""})

function addStatus( str ){
    StatusLog.set({status:str})
}

export function SaveItem( item ){
    addStatus( "Saving item...")
}