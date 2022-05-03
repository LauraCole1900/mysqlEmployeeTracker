const mysql = require("mysql");
const config = require("./config.json");
const util = require("util");

var connection = mysql.createConnection(config);

// connection.connect(function(err) {
//   if (err) throw err;
//   console.log("connected as id " + connection.threadId + "\n");
// });

connection.query = util.promisify(connection.query);

module.exports = connection;