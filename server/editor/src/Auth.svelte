<script>
    const SERVER_URL = "http://localhost:3000"
    import Frame from './Frame.svelte'
    let loggedIn=false
    let username=""
    let password=""
    let credentials="invalid"
    let fetchPromise = null
    let msg = ""

    function onLoginClicked(){
        
        
        msg = "Logging in..."
        fetchPromise = fetchCredentials()
        fetchPromise.then((res)=>{ 
            res.text().then((txt)=>
            {
                msg = txt + " " + res.status +  " RESPONSE"
                console.log(txt + " " + res.status +  " RESPONSE")
            }       )
          /*  if ( res.status != 200 ) throw (res)
            msg=val;  
            console.log(val); 
            credentials="superValid"}
            ).catch((val)=>{
                msg=val + " ERROR"
            }).finally(()=>{
                fetchPromise=null
            })*/
        }).finally(()=>{fetchPromise=null})

    }
    function fetchCredentials(){
        

        let p = fetch(SERVER_URL + "/editor/login", {
            method: 'get', 
      headers: new Headers({
        'Authorization': 'Basic +' + btoa(btoa(username + ":" + password))
 
        })})
        return p
    }
</script>
<style>
    button {
        border-radius:10px;
    }
    
</style>

{#if !loggedIn}
<Frame>
    <h1>Scoop it Up</h1>
<label>
    username:
    <input bind:value={username}>
</label>
<label>
    password:
    <input type=password bind:value={password}>
</label>
{#if fetchPromise== null }
<button on:click={onLoginClicked}>Log in</button>
{/if}
<p style="color: white">{msg}</p>
</Frame>
{:else}
<slot auth={credentials}>
</slot>
{/if}

