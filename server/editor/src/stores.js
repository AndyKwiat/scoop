import { writable } from 'svelte/store';

export const AuthStore = writable({loggedIn:false});