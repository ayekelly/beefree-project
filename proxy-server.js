import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

const BEE_CLIENT_ID = process.env.BEE_CLIENT_ID
const BEE_CLIENT_SECRET = process.env.BEE_CLIENT_SECRET

app.post('/proxy/bee-auth', async (req, res) => {
  if (!BEE_CLIENT_ID || !BEE_CLIENT_SECRET) {
    res.status(500).json({ error: 'Missing BEE_CLIENT_ID or BEE_CLIENT_SECRET in .env' })
    return
  }

  try {
    const { uid } = req.body
    const response = await axios.post(
      'https://auth.getbee.io/loginV2',
      {
        client_id: BEE_CLIENT_ID,
        client_secret: BEE_CLIENT_SECRET,
        uid: uid || 'demo-user',
      },
      { headers: { 'Content-Type': 'application/json' } },
    )
    res.json(response.data)
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data ?? error.message
      : 'Unknown error'
    console.error('Auth error:', message)
    res.status(500).json({ error: 'Failed to authenticate' })
  }
})

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`)
})
