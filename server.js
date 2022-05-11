const express = require('express');
const app = express();
const hostname = 'localhost';
const port = 3000;
const mysql = require('mysql');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

const con = mysql.createConnection({
    host: "localhost",
    user: "watthanandh",
    password: "a123456",
    database: "futshop-db"
})

con.connect(err => {
    if(err) throw(err);
    else{
        console.log("MySQL connected");
    }
})

const queryDB = (sql) => {
    return new Promise((resolve,reject) => {
        // query method
        con.query(sql, (err,result, fields) => {
            if (err) reject(err);
            else
                resolve(result)
        })
    })
}

app.post('/register', async (req,res) => {
    let password = req.body.password;
    console.log(password[0]);
    console.log(password[1]);
    if(password[0] == password[1])
    {
        let sqlDB = "CREATE TABLE IF NOT EXISTS userInfo (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(100))";
        let result = await queryDB(sqlDB);
        sqlDB = `INSERT INTO userInfo (username, password) VALUES ("${req.body.username}","${password[0]}")`;
        result = await queryDB(sqlDB);
        return res.redirect('Login.html');
    }
    else
    {
        return res.redirect('Register.html?error=1');
    }
})

app.post('/login',async (req,res) => {
    let username = req.body.username;
    let password = req.body.password;

    let userData = `SELECT username, password FROM userInfo WHERE username = '${username}'`;
    let result = await queryDB(userData);

    result = Object.assign({},result);
    console.log(result);
    let keys = Object.keys(result);
    console.log(result[keys[0]].password);
    if(result[keys[0]].password == password)
    {
        res.cookie('username', username);
        return res.redirect('Home.html');
    }
    return res.redirect('Login.html?error=1');
})

app.listen(port, hostname, () => {
    console.log(`Server running at   http://${hostname}:${port}/Register.html`);
});