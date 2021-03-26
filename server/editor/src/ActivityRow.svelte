<script>
    import { SaveItem } from './stores.js';
    export let item;
  
    let jsRawText=null;
    function OnJSRawClicked( item ){
        jsRawText = JSON.stringify(item, null, 2);
    }
    function OnScoopStatusClicked(it){
        if (item.scoop_status == "red" ) 
        item.scoop_status = "yellow"
        else if ( item.scoop_status == "yellow" )
        item.scoop_status = "green"
        else item.scoop_status = "red"     
        SaveItem(item)      
    }
</script>
<style>
    .container{
        display: grid;
        border-style: solid;
        border-radius: 5px;
        background-color: papayawhip;
        padding:10px;
        margin:10px;
        grid-template-columns: 325px 325px auto;
        grid-template-rows: auto;
        row-gap: 5px;
    }
    .name{
        grid-row:1;
        grid-column:1;
        font-style:italic;
        font-weight: bolder;
        line-height: 1.6;
        
    }
    .vicinity{
        font-style:normal;
        font-weight: normal;
    }
    .types{
        grid-column:2;
        grid-row: 1;
    }
    .types span{
        background-color:lightseagreen;
        border-radius: 5px;
        margin:3px;
        padding:3px;
        font-size:80%;
        color:white;
        display: inline-block;
    }
    .pic{
        grid-column:3;
        grid-row:1;
    }
    .business_status{
        font-style:normal;
        font-weight: normal;
        font-size:80%;
    }
    .scoop_status{
        font-style:normal;
        font-weight: bolder;
        font-size:280%;
        color:rgb(0, 67, 0);
        cursor: pointer;
    }

    .jsraw_button{
        grid-column:3;
        grid-row:1;
        float:right;
        font-size:30%;
        justify-self:right;
    }

    .jsraw_overlay{
        grid-column:1/4;
        grid-row:1/3;
        background-color:white;
    }

    
</style>
<tr><td>
<div class="container" style={ item?.scoop_status=="red"?"background-color:rgb(237, 153, 153)":(item?.scoop_status=="yellow"?"background-color:yellow":"")}>

    <div class="name">{item.name} <div class="vicinity">{item.vicinity}</div> 
    <div class="business_status">Status:{item.business_status}</div>
    <div class="scoop_status"><span  on:click={()=>OnScoopStatusClicked(item)}>
        {#if !item.scoop_status || item.scoop_status == "green" }
        &#9745;
        {:else if item.scoop_status == "red"}
        &#10006;
        {:else}
        &#9888;
        {/if}
     
    </span></div>
    </div>
   
    <div class="types">
        {#each item.types as tag }
            <span>{tag}</span>
        {/each}
      </div>
    <div class="pic">
        {#if item.photos?.length > 0 }
        {#each item.photos as ph}
            <img height="125px" max-width="20%" src={  "https://www.stirfrygames.com/img/125/" + ph.photo_reference + "-125.jpg" }
            alt={item.name}/>
        {/each}
        {/if}
        </div>
    <div class="jsraw_button">
        <button on:click={()=>OnJSRawClicked(item)}>jsRaw</button>
    </div>
{#if jsRawText}
    <div class="jsraw_overlay"><button on:click={()=>{jsRawText=null;}}>X</button><pre>{jsRawText}</pre></div>
    
{/if}
</div>
</td>
</tr>


