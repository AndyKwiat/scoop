<script>
    export let item;
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

    
</style>
<tr><td>
<div class="container">
    <div class="name">{item.name} <div class="vicinity">{item.vicinity}</div> <div class="business_status">Status:{item.business_status}</div></div>
   
    <div class="types">
        {#each item.types as tag }
            <span>{tag}</span>
        {/each}
      </div>
    <div class="pic">
        {#if item.photos?.length > 0 }
        <img height="125px" max-width="20%" src={  "https://www.stirfrygames.com/img/" + item.photos[0].photo_reference + ".jpg" }
           alt={item.name}/>
           {/if}
        </div>

</div>
</td>
</tr>


