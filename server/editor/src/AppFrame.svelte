<script>
    import {AuthStore,SERVER_URL, StatusLog} from './stores'
    let flushCacheBtnText = "Flush Cache3"
    let menuOpen = false;
    function OnFlushCacheClicked(){
        flushCacheBtnText = "Flushing..."
        fetch(SERVER_URL + '/flushcache',
		{
			method: 'get', 
        headers: new Headers({
        'Authorization': $AuthStore.key
		})}).then ( (resp)=>{
            if ( resp.ok ){
                flushCacheBtnText = "Flushed!"
            }else {
                flushCacheBtnText = "Failed Flushing"
                console.error("Failed flushing: " + resp.statusText )
            }
        }).catch( e =>{
            flushCacheBtnText = "Failed Flushing"
            console.error("Failed flushing: " + e.message )
        })
    }
</script>
<style>
    div {
        background:white;
        padding: 40px;
        margin:50px;
    }
    .admin {
        float:right;
        font-size:200%;
    }
    .admin button {
        font-size:50%;
    }
    .statusLog{
        position: fixed;
  bottom: 0;
  right: 0;
  width: 100px;
  padding:5px;
  border: 3px solid #73AD21;
    
    }
</style>
{#if $StatusLog.status?.length > 0 }
<div class="statusLog">{$StatusLog.status}</div>
{/if}
<div>
    <span class="admin" on:click={()=>{menuOpen = !menuOpen}}>&#9881;
        {#if menuOpen }
        <button on:click|stopPropagation={OnFlushCacheClicked}>{flushCacheBtnText}</button>
        {/if}
        
    </span>
      
    <slot></slot>
    
</div>