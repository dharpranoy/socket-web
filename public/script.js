const URL = "localhost:7600"
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
        socket.auth={user:USER.userId}
        socket.connect()
    })
}
prs=()=>{
    let txt=document.getElementById('msg')
    let chatlog=document.getElementById('chat')
    console.log('here')
    if (txt.value!=""){
        let item=document.createElement('li')
        item.setAttribute('class','me')
        let cont=`
                <div class="entete">
					<span class="status green"></span>
					<h2 id='from'>Me</h2>
					<h3 id='dataq'></h3>
				</div>
			    <div class="triangle"></div>
				<div class="message">
				${txt.value}
				</div>
        `
        item.innerHTML=cont
        chatlog.appendChild(item)
        console.log(USER)
        let ob={
            content:txt.value,
            to:USER.selected
        }
        console.log(ob)
        socket.emit('client-to-server',ob)
        txt.value=''
    }

}
$(document).ready(()=>{
	$('#user-search').keyup(()=>{
	    let ele=document.getElementById('user-search')
	    let mail=ele.value
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
			    par.setAttribute('name', cos[0].username)
			    par.setAttribute('uid',cos[0].uniqueid)
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
			    par.addEventListener('click',()=>{
			        $('#curr').text(cos[0].username)
			        USER.selected=cos[0].uniqueid
			        $('#chat').text('')
		    	})
		    }
		})
	    }
	})
})
socket.on('server-to-client',(ob)=>{
    console.log(ob)
    if (ob.f==USER.selected){
        let chatlog=document.getElementById('chat')
        let item=document.createElement('li')
        item.setAttribute('class','you')
        let cont=`
                <div class="entete">
				    <span class="status green"></span>
				    <h2 id='from'>you</h2>
				    <h3 id='dataq'></h3>
			    </div>
			    <div class="triangle"></div>
			    <div class="message">
			    ${ob.content}
			    </div>
        `
        item.innerHTML=cont
        chatlog.appendChild(item)
    }
})
