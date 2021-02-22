import { writable } from 'svelte/store';

export const AuthStore = writable({loggedIn:false});
export const SERVER_URL = ""; // "http://localhost:3000";