const URL = "http://localhost:7600"
const socket = io(URL,{autoConnect:false})
class Handler{
    constructor(userId){
        this.userId=userId
        this.selected=null
        this.friendlist=new Map()
    } 
}
let USER = null

fetchUser=()=>{
    fetch('/userinfo',{
        method:"get"
    })
    .then(res=>res.json())
    .then(cos=>{
        USER=new Handler(cos[0].uniqueid)
        console.log(USER.userId)
    })
}
$(document).ready(()=>{
	$('#user-search').keyup(()=>{
	    let mail=document.getElementById('user-search').value
	    let regex=/^([\-\.0-9a-zA-Z]+)@([\-\.0-9a-zA-Z]+)\.([a-zA-Z]){2,7}$/
	    if (regex.test(mail)){
		fetch('/search?umail='+mail,{
		    method:'get'
		})
		.then(res=>res.json())
		.then(cos=>{
		    console.log(cos)
		    if (USER.friendlist.has(cos[0].username)==false){
			USER.friendlist.set(cos[0].username,true)
			let list=document.getElementById('contacts')
			let par=document.createElement('li')
			par.setAttribute('name', cos[0].uniqueid)
			let chl=`
				<img>
				<div>
					<h2>${cos[0].username}</h2>
					<h3><span></span></h3>
				</div>
				</li>
			    `
			par.innerHTML=chl
			list.appendChild(par)
		    }
		})
	    }
	})
})
