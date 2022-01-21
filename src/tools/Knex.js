const Knex = require('knex')({
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  },
  // TODO: Look to set the default timezone tunisia!
  // pool: {
  //   afterCreate: function (connection, callback) {
  //     connection.query('SET time_zone = timezone;', function (err) {
  //       callback(err, connection);
  //     });
  //   }
  // }
})

module.exports = Knex;
