<script>
    const COOKIE = "auth";
    
    import Frame from "./Frame.svelte";
    import { AuthStore } from "./stores.js";

    let username = "";
    let password = "";

    let fetchPromise = null;
    let msg = "";

    let cook = getCookie(COOKIE);
    console.log ("GOT THE COOKIE: " + cook );
    if (cook.length > 0) {
        AuthStore.set({ loggedIn: true, key: cook });
    }

    AuthStore.subscribe( as =>{
		if ( as.loggedIn == false ) {
            createCookie(COOKIE,"" ) // delete
        }
	})

    function onLoginClicked() {
        msg = "Logging in...";
        fetchPromise = fetchCredentials();
        fetchPromise
            .then((res) => {
                res.text().then((txt) => {
                    // console.log(txt + " " + res.status +  " RESPONSE")
                    if (res.ok) {
                        createCookie(COOKIE, txt, 2);
                        AuthStore.set({ loggedIn: true, key: txt });
                    } else {
                        msg = txt + " " + res.status;
                    }
                });
            })
            .finally(() => {
                fetchPromise = null;
            });
    }
    function fetchCredentials() {
        let p = fetch(SERVER_URL + "/editor/login", {
            method: "get",
            headers: new Headers({
                Authorization:
                    "Basic +" + btoa(btoa(username + ":" + password)),
            }),
        });
        return p;
    }

    function createCookie(name, value, days) {
        var expires;
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = "; expires=" + date.toGMTString();
        } else {
            expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    function getCookie(c_name) {
        if (document.cookie.length > 0) {
            let c_start = document.cookie.indexOf(c_name + "=");
            if (c_start != -1) {
                c_start = c_start + c_name.length + 1;
                let c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) {
                    c_end = document.cookie.length;
                }
                return unescape(document.cookie.substring(c_start, c_end));
            }
        }
        return "";
    }
//DEV
  
</script>

<Frame>
    <h1>Scoop it Up</h1>
    <label>
        username:
        <input bind:value={username} />
    </label>
    <label>
        password:
        <input type="password" bind:value={password} />
    </label>
    {#if fetchPromise == null}
        <button on:click={onLoginClicked}>Log in</button>
    {/if}
    <p style="color: white">{msg}</p>
</Frame>

<style>
    button {
        border-radius: 10px;
    }
</style>
