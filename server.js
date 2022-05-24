const express=require('express')
const app=express()
const bodyparser=require('body-parser')
const server = require('http').createServer(app)
const path=require('path')
app.use(express.static(path.join(__dirname,'/public')))
const io=require('socket.io')(server)
app.get('/',(req,res)=>{
	res.sendFile(__dirname+'/public/home.html')
})	
io.on('connection',(socket)=>{
	socket.conn.once('upgrade',()=>{console.log('socket connected')})
	const users=[]
	for (let [id,username] of io.of("/").sockets){
		users.push({
			userId:id,
			username:socket.username,
		})
	}
	socket.emit("users",users)

	socket.broadcast.emit('server-to-client','An user joined the chat')
	socket.on('client-to-server',(msg)=>{
		io.emit('server-to-client',msg)
	})
	socket.on('disconnect',(socket)=>{
		io.emit('server-to-client','An user left chat')
	})
})


const PORT=7600
server.listen(PORT,()=>{console.log('server started on port',`${PORT}`)})

