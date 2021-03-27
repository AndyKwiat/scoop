<script>
	import { AuthStore ,SERVER_URL} from './stores.js';
	import Auth from './Auth.svelte'
	import AppFrame from './AppFrame.svelte'
	import ActivityRow from './ActivityRow.svelte'
	import {SaveItem } from './stores.js'
	

	let searchTerm = null;
	let promise = null;
	let scoop_status_filter = "all";
	let scoop_status_options = [ "all", "green","yellow","red"]
	let pulledItems = []
	function GreenToRedClicked(){
		let changingItems = filteredItems.filter(x=>x.scoop_status == "green" || !x.scoop_status)
		if ( confirm("Will change " + changingItems.length + " items, are you sure?" )){
			for ( let i=0 ; i < changingItems.length; i++ ){
				let x = changingItems[i]
				setTimeout(()=>{
				x.scoop_status = "red"
				SaveItem(x)},5000*i)
			}
			changingItems.forEach( x=>{
				
			})
		}
	}
	async function fetchData() {
		
		const response = await self.fetch(SERVER_URL + '/places?all=true',
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
			
				d.sort((a,b)=>{
					if (a.name.toLowerCase() > b.name.toLowerCase() ) return 1
					if ( b.name.toLowerCase() > a.name.toLowerCase() ) return -1
					return 0
				})
			
				pulledItems = d
			})
		
		}
	})

	$: filteredItems = pulledItems.filter( item=> searchTerm == null || 
	searchTerm.length <=0 || item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		item.types?.filter(t=>t.includes(searchTerm.toLowerCase())).length>0 
		).filter( x=> scoop_status_filter == "all" || x.scoop_status == scoop_status_filter ||
		(scoop_status_filter == "green" && !x.scoop_status)) // defaults to green
	

</script>
<style>
	:root{
		background-color: cornflowerblue;
    }
	.scoop_filter{
		padding:2px;
		margin:2px;
	}
</style>

{#if !$AuthStore.loggedIn}
 <Auth>
</Auth>
{:else}
<AppFrame>

		{filteredItems.length } is how may places yo got..,
		<select bind:value={scoop_status_filter} >
			{#each scoop_status_options as option}
				<option value={option}>
					{option}
				</option>
			{/each}
		</select>
		<button on:click|stopPropagation={GreenToRedClicked}>Green->Red Selected</button>
		<span style="margin-left:100px;margin-right:20px;font-size:25px">Search name/tags   </span>
	<input type="text" bind:value={searchTerm} style=" width:50%; height:40px; font-size:29px">

	<table>
		{#each filteredItems as item }
			<ActivityRow {item}></ActivityRow>
		{/each}
	</table>


</AppFrame>
{/if} 

