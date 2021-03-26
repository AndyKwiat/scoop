<script>
	import { AuthStore ,SERVER_URL} from './stores.js';
	import Auth from './Auth.svelte'
	import AppFrame from './AppFrame.svelte'
	import ActivityRow from './ActivityRow.svelte'
	

	let searchTerm = null;
	let promise = null; 
	
//	const visibleFields= [ "id", "name","vicinity", "types", "rating","user_ratings_total",  "business_status"]
	
	async function fetchData() {
		
		const response = await self.fetch(SERVER_URL + '/places',
		{
			
			method: 'get', 
      headers: new Headers({
        'Authorization': $AuthStore.key
		})})

		if (response.ok) {		
  			return response.json();
			
		} else {
			if ( response.status == 401 ){
				AuthStore.set( {loggedIn:false})

			}
			throw new Error("Something went wrong" + response.statusText);
		}
	}
	AuthStore.subscribe( as =>{
		if ( as.loggedIn  ){
			promise=fetchData();
			promise.then(d=>{
			
				d.Items.sort((a,b)=>{
					if (a.name.toLowerCase() > b.name.toLowerCase() ) return 1
					if ( b.name.toLowerCase() > a.name.toLowerCase() ) return -1
					return 0
				})
				d.Items[0].scoop_status="red"
				//console.log( JSON.stringify(d))
				console.log(d.Items.length);
				console.log("LENGTH")
			})
		
		}
	})
	

</script>
<style>
	:root{
		background-color: cornflowerblue;
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

		<span style="margin-left:100px;margin-right:20px;font-size:25px">Search name/tags   </span>
	<input type="text" bind:value={searchTerm} style=" width:50%; height:40px; font-size:29px">

	<table>
		<!-- <thead><tr><th>Desc</th><th>Id</th></tr></thead> -->
		{#each places.Items as item }
		{#if ( searchTerm == null || searchTerm.length <=0 ||
		item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		item.types?.filter(t=>t.startsWith(searchTerm)).length>0 )}
			<ActivityRow {item}></ActivityRow>
			
				
			{/if}
		{/each}
	</table>

	{:catch error}
		<p style="color: red">{error.message}</p>
	{/await}

	

	




</AppFrame>
{/if} 

