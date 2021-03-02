import { writable } from 'svelte/store';

export const AuthStore = writable({loggedIn:false});
export const SERVER_URL = window.location.hostname.includes("localhost") ?"http://localhost:3000":""