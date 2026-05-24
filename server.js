const express = require("express")
const path = require("path")
const { exec } = require("child_process")

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, "web", "panel")))

const users = [
  { email: "admin@amaia.com", password: "amaia123", token: "token-admin-amaia" }
]

function auth(req, res, next) {
  const authHeader = req.headers.authorization || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""
  const valid = users.some((u) => u.token === token)
  if (!valid) return res.status(401).json({ error: "No autorizado" })
  next()
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "web", "panel", "index.html"))
})

app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {}
  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" })
  res.json({ token: user.token })
})

app.post("/api/quote/estimate", auth, (req, res) => {
  const { cliente, vehiculo, tipoDanio, piezas, detalle } = req.body || {}
  if (!cliente || !vehiculo || !tipoDanio || !piezas) {
    return res.status(400).json({ error: "Faltan datos para cotizar" })
  }

  const baseByDamage = {
    raspon: 120,
    abolladura: 280,
    choque: 650
  }

  const pricePerPiece = baseByDamage[tipoDanio] || 180
  const manoDeObra = Math.round(pricePerPiece * piezas)
  const pintura = Math.round(70 * piezas)
  const materiales = Math.round(40 * piezas)
  const diagnosis = `Según IA: ${tipoDanio} detectado, ${piezas} pieza(s) comprometida(s). ${detalle ? "Detalle validado." : "Sin detalle adicional."}`

  const items = [
    { nombre: "Mano de obra chapa/pintura", precio: manoDeObra },
    { nombre: "Pintura y barniz", precio: pintura },
    { nombre: "Materiales de preparación", precio: materiales }
  ]
  const total = items.reduce((sum, i) => sum + i.precio, 0)

  res.json({
    id: Date.now(),
    cliente,
    vehiculo,
    aiAnalysis: diagnosis,
    items,
    total
  })
})

app.get("/bot/start", (req, res) => {
  exec("node bots/whatsapp-bot/index.js")
  res.send("Bot iniciado")
})

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000")
})
