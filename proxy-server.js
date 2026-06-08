import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 3001

app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }))
app.use(express.json())

const BEE_CLIENT_ID = process.env.BEE_CLIENT_ID
const BEE_CLIENT_SECRET = process.env.BEE_CLIENT_SECRET
const CS_API_TOKEN = process.env.CS_API_TOKEN

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

app.post('/proxy/export/html', async (req, res) => {
  if (!CS_API_TOKEN) {
    res.status(500).json({
      error:
        'Missing CS_API_TOKEN in .env. Create an API key in the Beefree Developer Console under Content Services API.',
    })
    return
  }

  try {
    const response = await axios.post(
      'https://api.getbee.io/v1/message/html',
      req.body,
      {
        headers: {
          Authorization: `Bearer ${CS_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        responseType: 'text',
      },
    )
    res.status(200).send(response.data)
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data ?? error.message
      : 'Unknown error'
    console.error('Export error:', message)
    res.status(500).json({ error: 'Failed to export HTML' })
  }
})

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`)
})
