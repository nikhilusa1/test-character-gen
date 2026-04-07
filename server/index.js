require('dotenv').config({ path: '../.env' })
const express = require('express')
const cors = require('cors')
const generateImage = require('./routes/generateImage')
const assist = require('./routes/assist')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/generate-image', generateImage)
app.use('/api/assist', assist)

const PORT = process.env.PORT || 3001
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

module.exports = app
