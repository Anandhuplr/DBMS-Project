
const mysql= require('mysql')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'loginsignup'
  });

connection.connect((err)=>{
  if(err){
    console.error('Failed to connect',err);
    return;
  }
  console.log('connected to mysql database');
});

connection.query(`CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
)`, (err, results) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Users table created or already exists');
  }
});

const addUser = (name, password) => {
  return new Promise((resolve, reject) => {
    connection.query(
      'INSERT INTO users (name, password) VALUES (?, ?)',
      [name, password],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.insertId);
        }
      }
    );
  });
};


const checkUserLogin = (name, password) => {
  return new Promise((resolve, reject) => {
    connection.query(
      'SELECT * FROM users WHERE name = ? AND password = ?',
      [name, password],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length > 0);
        }
      }
    );
  });
};

module.exports = {
  addUser,
  checkUserLogin,
  connection
};


