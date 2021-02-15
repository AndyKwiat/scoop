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
        grid-template-columns: 20% auto auto;
        grid-template-rows: auto auto;
        row-gap: 5px;
    }
    .name{
        grid-row:1;
        grid-column:2;
        font-style:italic;
        font-weight: bolder;
        
    }
    .vicinity{
        font-style:normal;
        font-weight: normal;
    }
    .types{
        grid-column:3;
        grid-row: 1/3
    }
    .pic{
        grid-column:1;
        grid-row:1/3;
    }

    
</style>
<tr><td>
<div class="container">
    <div class="name">{item.name} <div class="vicinity">{item.vicinity}</div></div>
   
    <div class="types">{item.types}</div>
    <div class="pic">
        {#if item.photos?.length > 0 }
        <img height="125px" max-width="20%" src={  "https://www.stirfrygames.com/img/" + item.photos[0].photo_reference + ".jpg" }
           alt={item.name}/>
           {/if}
        </div>

</div>
</td>
</tr>


