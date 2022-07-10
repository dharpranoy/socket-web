const express=require('express')
const app=express()
const sql=require('mysql')
const bodyparser=require('body-parser')
const session=require('express-session')
const cookie=require('cookie-parser')
const fs=require('fs')
const upl=require('multer')()
const server = require('http').createServer(app)
const path=require('path')
app.set('views','./views')
app.set('view engine','pug')
app.use(express.json())
app.use(bodyparser.urlencoded({extended:true}))
app.use(cookie())
app.use(express.static(path.join(__dirname,'/public')))
app.use(session({
	secret:'Admin@fedora35',
	resave:true,
	saveUninitialized:true
}))
let con = sql.createConnection({
	host:'localhost',
	user:'root',
	password:'mysql#pypi',
	database:'lambda'
})
con.connect(err=>{
	if (err)
		console.log(err)
})
const io=require('socket.io')(server)
app.get('/',(req,res)=>{
	res.sendFile(__dirname+'/public/login.html')
})
app.post('/register',(req,res)=>{
		let uname = req.body.txt
		let email = req.body.email
		let passwd = req.body.pswd
		let valid = 'SELECT "'+uname+'" from reguser'
		con.query(valid,(err,result)=>{
			if (err)
				throw err
			if (Object.keys(result).length===0){
					let unid = email.split("@")[0]
					console.log(unid)
					let query = 'INSERT INTO reguser VALUES('+'"'+uname+'"'+','+'"'+email+'"'+','+'"'+passwd+'"'+','+'"'+unid+'"'+')'
					con.query(query,(err,result)=>{
						if (err)
							console.log('failed to register')
						else
							console.log('Successfully registerd')
					})
			}else{
				res.type('text/html')
				res.send('<h1>user already resgistered</h1>')
			}
		})
		
})
app.post('/signin',(req,res)=>{
	
		let email = req.body.email
		let passwd = req.body.pswd
		let valid = 'SELECT "'+email+'" from reguser'
		con.query(valid,(err,result)=>{
			if (err)
				console.log(err)
			if (Object.keys(result)===1){
				let map = 'SELECT passwd from reguser'
				con.query(map,(error,db)=>{
					if (db.password===passwd){
						res.redirect('/index')
					}
				})
			}
		})
})
io.use((socket,next)=>{
	const username=socket.handshake.auth.ele
	console.log(username)
	socket.username=username
	next()
})
io.on('connection',(socket)=>{
	socket.conn.once('upgrade',()=>{console.log('socket connected')})
	const users=[]
	for (let [id,socket] of io.of("/").sockets){
		users.push({
			userId:id,
			username:socket.username,
		})
	}
	io.emit("users",users)

	socket.broadcast.emit('server-to-client','An user joined the chat')
	socket.on('client-to-server',(msg)=>{
		io.emit('server-to-client',msg)
	})
	socket.on('disconnect',(socket)=>{
		io.emit('server-to-client','An user left chat')
		io.emit("status","offline")

	})
})


const PORT=7600
server.listen(PORT,()=>{console.log('server started on port',`${PORT}`)})

