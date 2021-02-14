<script>
	import Auth from './Auth.svelte'
	import AppFrame from './AppFrame.svelte'
	let data =null;
	let searchTerm = null
	
	async function fetchData() {
		const response = await self.fetch('http://localhost:3000/places');

		if (response.ok) {
  			return response.json();
			
		} else {
			throw new Error("Something went wrong" + response.statusText);
		}
	}
	let promise = fetchData();
	promise.then((places)=>{
		data = places.Items;
	})

</script>
<style>
	:root{
        background-image: linear-gradient(rgb(53, 31, 247), rgb(19, 12, 69));
    }
</style>
<!-- <Auth> -->
<AppFrame>
{#if data==null}
{#await promise}
	WAITING...
{:then places} 
	{places.Items.length } is how may places yo got..,
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

{:else}

<span style="margin-left:100px;margin-right:20px;font-size:25px">Search   </span>
<input type="text" bind:value={searchTerm} style=" width:50%; height:40px; font-size:29px">

<table>
	<thead><tr><th>Desc</th><th>Id</th></tr></thead>
	{#each data as item }
		{#if ( item.tags?.filter(t=>t.startsWith(searchTerm)).length>0 || searchTerm == null || searchTerm.length <=0)}
			<tr><td>{item.desc}</td><td>{item.id}</td><td>{item.tags.length}</td></tr>
		{/if}
	{/each}
</table>



{/if}

</AppFrame>	
<!-- </Auth> -->