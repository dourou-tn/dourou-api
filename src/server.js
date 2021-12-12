require('dotenv').config({ path: '../.env' });
require('module-alias/register');

const path = require('path');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors())

const routes = require('./routes')

/** Without this 2 middlewares req.body is undefined */
app.use(express.json());

app.use('/api', routes)

// static file for images
const dir = path.join(process.env.PWD, process.env.STORAGE_FOLDER);
app.use(express.static(dir));

/**** Home page (TEST) ****/
app.get('/', (req, res) => {
  res.json({ success: req.body });
});

const PORT = process.env.API_PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})