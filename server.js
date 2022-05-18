const express = require('express');
const app = express();
const fs = require('fs');
const hostname = 'localhost';
const port = 3000;
const mysql = require('mysql');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const { is } = require('express/lib/request');
const res = require('express/lib/response');
const { json } = require('express/lib/response');

var isLoginSuccess = false;

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

app.get('/goToHomePage', (req,res) => {
    return res.redirect('Home.html');
})

app.get('/goToCartPage', (req,res) => {
    return res.redirect('Cart.html');
})

app.get('/goToLoginPage', (req,res) => {
    if (req.cookies.username)
    {
        return res.redirect('Home.html');
    }
    else
    {
        return res.redirect('Login.html');
    }
})

app.get('/goToSignUpPage', async (req,res) => {
    if (req.cookies.username)
    {
        let cartJsonData = await readJson('database/CartItem.json');
        let cartData = JSON.parse(cartJsonData);
        let cartKeys = Object.keys(cartData);

        if(cartKeys.length > 0)
        {
            let sqlDB = "CREATE TABLE IF NOT EXISTS userCartInfo (username VARCHAR(255), cart VARCHAR(16000))";
            let result = await queryDB(sqlDB);
            sqlDB = `INSERT INTO userCartInfo (username, cart) VALUES ("${req.cookies.username}",'${cartJsonData}')`;
            result = await queryDB(sqlDB);
            
            cartKeys.forEach(function(key){
            delete cartData[key];
            });

            let newCartData = JSON.stringify(cartData);
            writeJson(newCartData, 'database/CartItem.json');
        }
        isLoginSuccess = false;
        res.clearCookie('username');
        return res.redirect('Login.html');
    }
    else
    {
        return res.redirect('Register.html');
    }
})

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
        isLoginSuccess = true;

        let cartData = `SELECT cart FROM userCartInfo WHERE username = '${username}'`;
        result = await queryDB(cartData);
        result = Object.assign({},result);
        console.log(result);
        let cartKeys = Object.keys(result);
        console.log(cartKeys.length);

        if(cartKeys.length > 0)
        {
            let cartKeys2 = Object.keys(result[cartKeys[0]]);
            console.log(result[cartKeys[0]][cartKeys2[0]]);
            let dataToWrite = result[cartKeys[0]][cartKeys2[0]];
            let w_data = await writeJson(dataToWrite,'database/CartItem.json');

            let deleteData = `DELETE FROM userCartInfo WHERE username ='${username}'`;
            result = await queryDB(deleteData);
        }
        return res.redirect('Home.html');
    }
    return res.redirect('Login.html?error=1');
})

app.get('/checkLoginStatus',async (req,res) => {
    if(req.cookies.username)
    {
        res.send({"result": true});
    }
    else
    {
        res.send({"result": false});
    }
    // res.send(isLoginSuccess);
})

app.get('/readItemData',async (req,res) => {
    let data = await readJson('database/item.json');
    res.send(data);
})

app.post('/writeItemData',async (req,res) => {
    const itemImgSrc = req.body.itemToAdd;
    console.log(itemImgSrc);
    let data = await readJson('database/item.json');
    let cartData = await readJson('database/CartItem.json');
    let updatedCartData = await updateCart(itemImgSrc,data,cartData);
    console.log(updatedCartData);
    res.send("Successfully Added");
})

app.get('/readItemsCart', async (req,res) => {
    let cartData = await readJson('database/CartItem.json');
    res.send(cartData);
})

// app.get('/updateItemAmount',async(req,res) => {
//     let cartJsonData = await readJson('database/CartItem.json');
//     let cartData = JSON.parse(cartJsonData);
//     let cartItemKeys = Object.keys(cartData);
//     let data = parseInt(cartItemKeys.length);
//     console.log(data);
//     res.send(data);
// })

app.get('/removeAllCartItem', async (req,res) => {
    let cartJsonData = await readJson('database/CartItem.json');
    let cartData = JSON.parse(cartJsonData);
    let itemKeys = Object.keys(cartData);
    
    itemKeys.forEach(function(key){
        delete cartData[key];
    });

    let newCartData = JSON.stringify(cartData);
    writeJson(newCartData, 'database/CartItem.json');

    res.send(newCartData);
})

app.post('/removeCartItem',async (req,res) => {
    const itemName = req.body.itemName;
    let CartData = await readJson('database/CartItem.json');
    let itemCartData = JSON.parse(CartData);
    let itemKeys = Object.keys(itemCartData);

    for(let itemIndex = 0; itemIndex < itemKeys.length; itemIndex++)
    {
        if(itemCartData[itemKeys[itemIndex]].itemName == itemName)
        {
            delete itemCartData[itemKeys[itemIndex]];
            break;
        }
    }

    let newCartData = JSON.stringify(itemCartData, null, 4);
    console.log(newCartData);
    writeJson(newCartData, 'database/CartItem.json');
    res.send(newCartData);
})

app.post('/updateQuantity',async (req,res) => {
    const itemName = req.body.itemName;
    const newQuantity = req.body.amount;
    console.log(itemName);
    console.log(newQuantity);
    let cartJsonData = await readJson('database/CartItem.json');
    let cartData = JSON.parse(cartJsonData);
    let itemsKeys = Object.keys(cartData);

    for(var itemIndex = 0; itemIndex < itemsKeys.length; itemIndex++)
    {
        if(cartData[itemsKeys[itemIndex]].itemName == itemName)
        {
            cartData[itemsKeys[itemIndex]].quantity = newQuantity;
            break;
        }
    }

    let newCartData = JSON.stringify(cartData,null,4);
    console.log(newCartData);
    writeJson(newCartData,'database/CartItem.json');
    res.send(newCartData);
})

app.post('/applyCode',async (req,res) => {
    const codeName = req.body.discountCode;
    var msgToSend = "";
    var CodeJsonData = await readJson('database/promoCode.json');
    var codeData = JSON.parse(CodeJsonData);
    console.log(codeData);
    var codeKeys = Object.keys(codeData);

    for(var codeIndex = 0; codeIndex < codeKeys.length; codeIndex++)
    {
        if(codeData[codeKeys[codeIndex]].code == codeName)
        {
            msgToSend = codeData[codeKeys[codeIndex]].discount;
        }
    }

    if(msgToSend == "")
    {
        msgToSend = "Invalid code";
    }
    
    res.send(msgToSend);
})

app.get('/readAmountOfItemInCart',async (req,res) => {
    let data = await readJson('database/CartItem.json');
    res.send(data);
})

// const updateCartItemQuantity = async(itemName,quantity) => {
//     return new Promise((resolve,reject) => {

//     })
// }

const readJson = (file_name) => {
    return new Promise((resolve,reject) => {
        fs.readFile(file_name,'utf8', (err, data) => {
          if (err) 
              reject(err);
          else
          {
              resolve(data);
          }
        });    
    })
}

const updateCart = (itemImgSrc, dataBase , cartData) => {
    return new Promise((resolve,reject) => { 
    var jsonData = JSON.parse(dataBase);
    var keys = Object.keys(jsonData);
    var cartJsonData = JSON.parse(cartData);
    var cartKeys = Object.keys(cartJsonData);
    var isItemContainInCart = false;
    var cart = {itemName:"", price:"", picName:"", picPath:"", quantity:0};
    
    for (var n = 0 ; n < cartKeys.length ; n++)
    {
        if ("http://localhost:3000/" + cartJsonData[cartKeys[n]].picPath == itemImgSrc)
        {
            isItemContainInCart = true;
        }
    }

    if (cartKeys.length != 0 && isItemContainInCart == true)
    {   
        for (var n = 0 ; n < cartKeys.length ; n++)
        {
            if ("http://localhost:3000/" + cartJsonData[cartKeys[n]].picPath == itemImgSrc)
            {
                cartJsonData[cartKeys[n]].quantity += 1;
                var newCartJsonData = JSON.stringify(cartJsonData);
                let dataToWrite =  writeJson(newCartJsonData,'database/CartItem.json');
                resolve("plusCart!");
            }
        }
    }

    else if (cartKeys.length == 0 || isItemContainInCart == false)
    {
        for (var i = 0 ; i < keys.length ; i++)
        {
            if ("http://localhost:3000/" + jsonData[keys[i]].picPath == itemImgSrc)
            {
                cart.itemName = jsonData[keys[i]].itemName;
                cart.price = jsonData[keys[i]].price;
                cart.picName = jsonData[keys[i]].picName;
                cart.picPath = jsonData[keys[i]].picPath;
                cart.quantity = 1;
                cartJsonData["item" + (cartKeys.length+1)] = cart;
                var newCartJsonData = JSON.stringify(cartJsonData);
                let dataToWrite =  writeJson(newCartJsonData,'database/CartItem.json');
                resolve("created!");
            }
        }
    }
    });
}

const writeJson = (data,file_name) => {
    return new Promise((resolve,reject) => {
        fs.writeFile(file_name, data , (err) => {
          if (err) 
              reject(err);
          else
              resolve("saved!")
      });
    })
}


app.listen(port, hostname, () => {
    console.log(`Server running at   http://${hostname}:${port}/Home.html`);
});