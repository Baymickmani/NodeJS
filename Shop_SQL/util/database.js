// For SQL
// const mysql = require('mysql2');

// //create a connection pool
// const pool = mysql.createPool({
//     host: 'localhost',
//     user:'root',
//     database:'node-complete',
//     password: 'Baymick2@'
// });

// module.exports = pool.promise();


// For Sequelize
const Sequilize = require('sequelize');

const sequelize = new Sequilize('node-complete','root','Baymick2@',{
    dialect: 'mysql', host:'localhost'
});

module.exports = sequelize;