var express = require("express"),
    bodyParser =  require("body-parser"),
    mongoose = require("mongoose"),
    app = express(),
    flash = require("connect-flash"),
    methodOverride = require("method-override"),
    Stock = require("./models/stock"),
    DeliveryOrder = require("./models/deliveryOrder");
   
    

mongoose.connect('mongodb://localhost/stock_app', { useMongoClient: true });
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({extended: true}));    
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());

app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));



app.use(function(req, res, next){
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});
// RESTFUL ROUTES

// basic route
app.get("/", function(req, res){
    res.redirect("/stocks");
});

app.get("/stocks", function(req, res){
    

    Stock.find({}, function(err, stocks){
       if(err){
           console.log(err);
       } else {
          
          res.render("index", {stocks: stocks});
          

           
           
       }
       
       
    });
    
    
    
});

//Create Route

app.get("/stocks/new", function(req, res){
    Stock.find({}, function(err, stocks){
       if(err){
           console.log("ERR");
       } else {
           res.render("new", {stocks: stocks});
       }
    });
});

app.post("/stocks", function(req, res){
    req.body.stock.kgs = req.body.stock.pkgs * req.body.stock.wpkgs;
    req.body.stock.bpkgs = req.body.stock.pkgs;
    req.body.stock.bkgs = req.body.stock.kgs;
    
    Stock.create(req.body.stock, function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect("/stocks/new");
        }
    });   
});


//edit form
app.get("/stocks/:id/edit", function(req, res) {
   Stock.findById(req.params.id, function(err, foundStock){
       if(err){
           res.redirect("back");
       } else {
           res.render("edit", {stock: foundStock});
       }
    }); 
});


// Put update
app.put("/stocks/:id", function(req, res){
   req.body.stock.kgs = req.body.stock.pkgs * req.body.stock.wpkgs;
    req.body.stock.bpkgs = req.body.stock.pkgs;
    req.body.stock.bkgs = req.body.stock.kgs;
   
   Stock.findByIdAndUpdate(req.params.id, req.body.stock, function(err,updatedStock){
      if(err){
          res.redirect("/stocks");
          
      }  else {
          res.redirect("/stocks");
          
      }
   }); 
});


app.delete("/stocks/:id", function(req, res){
   Stock.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/stocks");
       } else {
           res.redirect("/stocks");
       }
   });
    
});


///////////////////////////////
// D/O ROUTES
///////////////////////////////


//DO NEW
app.get("/stocks/:id/do", function(req, res) {
   Stock.findById(req.params.id, function(err, foundStock){
       if(err){
           res.redirect("/stocks");
       } else {
           res.render("do", {stock: foundStock});
       }
    }); 
});

// D/O Create
app.post("/stocks/:id/do", function(req, res){
    //lookup stocks using ID
    Stock.findById(req.params.id, function(err, foundStock) {
       if(err || !foundStock){
           req.flash("erro", "stock not found")
           res.redirect("back")
       }else {
           DeliveryOrder.create(req.body.do, function(err, createdDO){
              if(err){
               req.flash("error", "Something went wrong");
               res.redirect("back");
              } else {
                  foundStock.deliveryOrder.push(createdDO);
                  foundStock.bpkgs -= req.body.do.bag;
                  foundStock.bkgs -= (req.body.do.bag * foundStock.wpkgs);
                  foundStock.save();
                 
                  res.render('doDisplay', {stock:foundStock, dos:createdDO});
              } 
           });
       } 
    });
});


app.listen(process.env.PORT, process.env.IP, function(){
  console.log("Stockapp Server has started!!!");
});



// pdf maker

 
