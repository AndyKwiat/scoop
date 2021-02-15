<script>
	import { AuthStore } from './stores.js';
	import Auth from './Auth.svelte'
	import AppFrame from './AppFrame.svelte'

	let searchTerm = null;
	let promise = null; 
	
	async function fetchData() {
		
		const response = await self.fetch('http://localhost:3000/places',
		{
			
			method: 'get', 
      headers: new Headers({
        'Authorization': $AuthStore.key
		})})

		if (response.ok) {
  			return response.json();
			
		} else {
			throw new Error("Something went wrong" + response.statusText);
		}
	}
	AuthStore.subscribe( as =>{
		if ( as.loggedIn  ){
			promise=fetchData();
		
		}
	})
	

</script>
<style>
	:root{
        background-image: linear-gradient(rgb(53, 31, 247), rgb(19, 12, 69));
    }
</style>

{#if !$AuthStore.loggedIn}
 <Auth>
</Auth>
{:else}
<AppFrame>

	
	{#await promise}
		WAITING...
	{:then places} 
		{places.Items.length } is how may places yo got..,

		<span style="margin-left:100px;margin-right:20px;font-size:25px">Search   </span>
	<input type="text" bind:value={searchTerm} style=" width:50%; height:40px; font-size:29px">

	<table>
		<thead><tr><th>Desc</th><th>Id</th></tr></thead>
		{#each places.Items as item }
			{#if ( item.tags?.filter(t=>t.startsWith(searchTerm)).length>0 || searchTerm == null || searchTerm.length <=0)}
				<tr><td>{item.desc}</td><td>{item.id}</td><td>{item.tags.length}</td></tr>
			{/if}
		{/each}
	</table>

	{:catch error}
		<p style="color: red">{error.message}</p>
	{/await}

	

	




</AppFrame>
{/if} 

