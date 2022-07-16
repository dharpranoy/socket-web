const express=require('express')
const app=express()
const sql=require('mysql')
const bodyparser=require('body-parser')
const session=require('express-session')
const cookie=require('cookie-parser')
const fs=require('fs')
const bcrypt=require('bcrypt')
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
		let valid = 'SELECT username from reguser where email='+'"'+email+'"'
		console.log(valid)
		con.query(valid,(err,result)=>{
			if (err)
				throw err
			if (Object.keys(result).length===0){
					let unid = email.split("@")[0]
					console.log(unid)
					bcrypt.hash(passwd,10).then(passhash=>{
					let query = 'INSERT INTO reguser VALUES('+'"'+uname+'"'+','+'"'+email+'"'+','+'"'+passhash+'"'+','+'"'+unid+'"'+')'
					console.log(passhash)
					con.query(query,(err,result)=>{
						if (err){
							console.log('failed to register')
						}else{
							let USER = {
									name:`${uname}`,
									email:`${email}`,
									passwd:`${passwd}`
							}
							res.cookie("userdata",USER)
							res.redirect('/index')
						}
						})
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
		let valid = 'SELECT username from reguser where email='+'"'+email+'"'
		console.log(valid)
		con.query(valid,(err,result)=>{
			if (err)
				console.log(err)
			if (Object.keys(result).length!=0){
				let map = 'SELECT username,password from reguser where email='+'"'+email+'"'
				con.query(map,(error,db)=>{
					if (error)
						throw error
					bcrypt.compare(passwd,db[0].password,(errpss,respass)=>{
							console.log(db[0].password,respass)
							if (respass==true){
									let USER = {
											name:`${db.username}`,
											email:`${email}`,
											passwd:`${passwd}`
									}
									res.cookie("userdata",USER)
									res.redirect('/index')
							}else{
								res.redirect('/')
							}
					})
				})
			}
		})
})
app.get('/index',(req,res)=>{
		if (req.cookies.userdata!=null){
			res.sendFile(path.join(__dirname+'/public/main.html'))
		} 
})
app.get('/userinfo',(req,res)=>{
		if (req.cookies.userdata!=null){
				let query='SELECT * FROM reguser where email='+'"'+req.cookies.email+'"'
				con.query(query,(err,result)=>{
					if (err)
						throw err
					res.type('application/json')
					res.send(JSON.stringify(result))
				})
		}else{
			res.redirect('/')
		}
})
app.post('',(req,res)=>{

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

