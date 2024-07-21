const express=require("express")
const app=express()
const path=require("path")
const hbs=require("hbs")
const { addUser, checkUserLogin,connection } = require("./mysql");

const { error } = require("console");
const tempelatePath=path.join(__dirname,'../tempelates')

app.use(express.json())
app.set("view engine","hbs")
app.set("views",tempelatePath)
app.use(express.static('public'));
app.use(express.urlencoded({extended:false}))

app.get("/login",(req,res)=>{
    res.render("login")
})

app.get("/signup",(req,res)=>{
    res.render("signup")
})

app.get("/search",(req,res)=>{
  res.render("search")
})

app.get("/home",(req,res)=>{
  res.render("home")
})

app.get("/update",(req,res)=>{
  res.render("update")
})

app.get("/recommd",(req,res)=>{
  res.render("recommd")
})

app.get("/about",(req,res)=>{
  res.render("about")
})


app.post("/signup", async (req, res) => {
    const { name, password } = req.body;
  
    try {
      const addedId = await addUser(name, password);
      if (addedId) {
        res.render("login");
      } else {
        res.render("signup", { error: "Failed to create account." });
      }
    } catch (error) {
      res.render("signup", { error: "An error occurred while creating the account." });
    }
  });

app.post("/login", async (req, res) => {
    const { name, password } = req.body;
    

    const loggedIn = await checkUserLogin(name, password);
    if (loggedIn) {
       
        res.render("home", { username: name });
    } else {
        res.render("login", { error: 'Login failed. Incorrect password or username.' });
    }
    
});

app.get('/search1',function(req,res){

  const userLocation = req.query.location;

    

      var sql = `select gadget.name from search.gadget,search.stocks where gadget.gadget_id=stocks.gid and avail='y'  and reg='${userLocation}'`;

      connection.query(sql,function(error,result){
        if(error){ console.log(error);}
        res.render('search1',{search1:result});
      });

    });





app.post('/update', function(req, res) {
  const numbersSold = req.body.textbox1;
  const gadgetID = req.body.textbox2;
  const location = req.body.textbox3;
 
  
  var sqli = `SELECT class FROM search.area WHERE name = '${location}'`;

  connection.query(sqli, function(error, result) {
    if (error) {
      console.log(error);
      res.status(500).send('Error retrieving data');
    } else if (result.length > 0) {
      var k = result[0].class;
      console.log(k); // Check the value of 'k' in the console

      if (k === 'rural') {
        var sqlrf = `update search.rural set sales_point= search.rural.sales_point + 0.01*'${numbersSold}'where search.rural.gadget_id='${gadgetID}'`;
        const sqlsales = `update search.sales set sold=sold+'${numbersSold}' where search.sales.gadget_id='${gadgetID}' and region= 'Rural'`;
        connection.query(sqlrf, function(error, result) {
          if (error) {
            console.log(error);-
            res.status(500).send('Error retrieving rural data');
          } else {
            console.log('sucess');
            //res.render("update", { : result });
            connection.query(sqlsales,  function(error, result) {
              if (error) {
                console.log(error);
                res.status(500).send('Error updating sales');
              } else {
                res.render("update", { update: 'Successfully Updated' });
              }
            });
          }
        });
      } 
      else if(k==='urban'){
        var sqlrf = `update search.urban set sales_point= search.urban.sales_point + 0.01*'${numbersSold}'where search.urban.gadget_id='${gadgetID}'`;
        const sqlsales = `update search.sales set sold=sold+'${numbersSold}' where search.sales.gadget_id='${gadgetID}' and region= 'Urban'`;
        connection.query(sqlrf, function(error, result) {
          if (error) {
            console.log(error);-
            res.status(500).send('Error retrieving urban data');
          } else {
            console.log('sucess');
            //res.render("update", { : result });
            connection.query(sqlsales,  function(error, result) {
              if (error) {
                console.log(error);
                res.status(500).send('Error updating sales');
              } else {
                res.render("update", { update: 'Successfully Updated' });
              }
            });
          }
        });

      }
      else {
        console.log('Value of k is not rural');
        // Handle cases where k is not 'rural'
      }
    } else {
      console.log("No result found for the location");
      res.status(404).send('No result found for the location');
    }
  });
  
 });



app.listen(4000,()=>{
    console.log("port connected");
});



app.get('/recommd1', function(req, res) {
  const userLocation = req.query.location;

  var sql = `SELECT class FROM search.area WHERE name = '${userLocation}'`;

  connection.query(sql, function(error, result) {
    if (error) {
      console.log(error);
      res.status(500).send('Error retrieving data');
    } else if (result.length > 0) {
      var k = result[0].class;
      console.log(k); // Check the value of 'k' in the console

      if (k === 'rural') {
        var sqlr = `SELECT gadget.name, gadget.gadget_id, gadget.price, gadget.availability,gadget.manufacturer FROM search.gadget, search.area, search.sales, search.urban, search.rural WHERE region = class AND rural.gadget_id = sales.gadget_id AND urban.gadget_id = sales.gadget_id AND gadget.gadget_id = sales.gadget_id AND area.name = '${userLocation}' ORDER BY rural.sales_point DESC LIMIT 2`;

        connection.query(sqlr, function(error, result) {
          if (error) {
            console.log(error);
            res.status(500).send('Error retrieving rural data');
          } else {
            res.render("recommd1", { recommd1: result });
          }
        });
      } 
      else if(k==='urban'){
        var sqlr = `SELECT gadget.name, gadget.gadget_id, gadget.price, gadget.availability,gadget.manufacturer FROM search.gadget, search.area, search.sales, search.urban, search.rural WHERE region = class AND rural.gadget_id = sales.gadget_id AND urban.gadget_id = sales.gadget_id AND gadget.gadget_id = sales.gadget_id AND area.name = '${userLocation}' ORDER BY urban.sales_point DESC LIMIT 2`;

        connection.query(sqlr, function(error, result) {
          if (error) {
            console.log(error);
            res.status(500).send('Error retrieving rural data');
          } else {
            res.render("recommd1", { recommd1: result });
          }
        });

      }
      else {
        console.log('Value of k is not rural');
        
      }
    } else {
      console.log("No result found for the location");
      res.status(404).send('No result found for the location');
    }
  });
});