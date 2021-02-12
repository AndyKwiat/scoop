<style>
    div {
        border-radius:11px;
        background-color: rgb(27, 50, 50);
        padding:30px;
        color:white;
        /*display: flex;*/
  justify-content: center;
  position: fixed; /* or absolute */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  border-color:rgb(9, 9, 9);
  border-style: solid;
  border-width: 0.1px;
  box-shadow:5px 5px 5px rgba(62, 62, 62, 0.29);
    }
    
</style>

<div><slot/></div>