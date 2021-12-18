require('dotenv').config({ path: '../.env' });
require('module-alias/register');

const path = require('path');
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const express = require('express');
const app = express();

const routes = require('./routes')

app.use(cors())

/** Without this 2 middlewares req.body is undefined */
app.use(express.json());

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(require('../swagger.json')))

/** Static storage folder for images */
const dir = path.join(process.env.PWD, process.env.STORAGE_FOLDER);
app.use(express.static(dir));

/** Main routes */
app.use('/api', routes)

/**** Home page (TEST) ****/
app.get('/', (req, res) => {
  res.json({ success: req.body });
});

const PORT = process.env.API_PORT

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})