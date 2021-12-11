require('dotenv').config();
require('module-alias/register');

const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors())

const routes = require('./routes')

/** Without this 2 middlewares req.body is undefined */
app.use(express.json());

app.use('/api', routes)

/**** Home page (FRONT END) ****/
app.get('/', (req, res) => {
  res.json({ success: req.body });
});

const PORT = process.env.API_PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})