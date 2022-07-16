import { io } from "socket.io-client"
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
        USER=new Handler(cos.uid)
        console.log(USER.userId)
    })
}
searchUser=()=>{
    let mail=document.getElementById('user-search').value
    if (mail!=""){
        let ob={
            umail:mail
        }
        fetch('/search',{
            method:'post',
            headers:{'Content-Type':'application/json'},
            data:JSON.stringify(ob)
        })
        .then(res=>res.json())
        .then(cos=>{
            if (USER.friendlist.has(cos.username)==false){
                USER.friendlist.set(cos.username,true)
                let list=document.getElementById('contacts')
                let child=document.createElement('li')
                let dp=document.createElement('img')
                let div=document.createElement('div')
                let h2=document.createElement('h2')
                h2.innerHTML=cos.username
                let h3=document.createElement('h3')
                let span=document.createElement('span')
                h3.appendChild(span)
                div.appendChild(h2)
                div.appendChild(h3)
                child.appendChild(dp)
                child.appendChild(div)
                child.setAttribute('name',cos.uniqueid)
                list.appendChild(child)
            }
        })
    }
}

