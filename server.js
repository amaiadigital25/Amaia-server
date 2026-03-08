const express = require("express")
const { exec } = require("child_process")

const app = express()

app.get("/", (req,res)=>{
res.send("🚀 Servidor AmaiaDigital funcionando")
})

app.get("/bot/start",(req,res)=>{
exec("node bots/whatsapp-bot/index.js")
res.send("Bot iniciado")
})

app.listen(3000,()=>{
console.log("Servidor corriendo en puerto 3000")
})

