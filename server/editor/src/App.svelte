<script>
	let data =[{desc:"kewl",id:1,tags:[]},{desc:"not kewl",id:2,tags:[]},{desc:"noice",id:3,tags:["star","bob"]}]
	let searchTerm = null
</script>
<input bind:value={searchTerm}>
{searchTerm}
<table>
	<thead><tr><th>Desc</th><th>Id</th></tr></thead>
	{#each data as item }
		{#if ( item.tags?.filter(t=>t.startsWith(searchTerm)).length>0 || searchTerm == null || searchTerm.length <=0)}
			<tr><td>{item.desc}</td><td>{item.id}</td><td>{item.tags.length}</td></tr>
		{/if}
	{/each}
</table>
