var express = require("express"),
    bodyParser =  require("body-parser"),
    mongoose = require("mongoose"),
    app = express(),
    flash = require("connect-flash"),
    methodOverride = require("method-override"),
    async = require('async'),
    Stock = require("./models/stock"),
    DeliveryOrder = require("./models/deliveryOrder"),
    Warehouse = require("./models/warehouse");
   
var doNbr = 1;
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
    req.body.stock.wh = req.body.stock.wh.toUpperCase();
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
app.get("/stocks/:id/do", function(req, res){
   Stock.findById(req.params.id).populate("deliveryOrder").exec(function(err, foundStock){
       if(err || !foundStock){
           req.flash("error", "Something went wrong please try again")
           res.redirect("back");
       } else {
           res.render("do", {stock: foundStock});
       }
    }); 
});

// D/O Create
app.post("/stocks/:id/do", function(req, res){
   
   
   var arr = req.body.do.bag.split("+");
    console.log(arr);
      //lookup stocks using ID
        
               
               async.eachSeries(arr, function(x, next){
                 Stock.findById(req.params.id, function(err, foundStock){
                      
                       if(err || !foundStock){
                           req.flash("erro", "stock not found")
                           res.redirect("back")
                    }else {
                        x = parseInt(x.replace(/[^0-9.]/g, ""));
                       console.log("x is :" + x)
                       
                        var dos = {do_nbr: doNbr, buyer: req.body.do.buyer, broker: req.body.do.broker, validity: req.body.do.validity, rate:req.body.do.rate, modeOfPayment:req.body.do.modeOfPayment, bag: x};
                        DeliveryOrder.create(dos, function(err, createdDO){
                          if(err){
                           req.flash("error", "Something went wrong");
                           res.redirect("back");
                          } else {
                              console.log("bags are : " + createdDO.bag)
                            // console.log(x + ": " + createdDO)             
                              console.log("bpkgs : " + foundStock.bpkgs)
                              foundStock.bpkgs -= createdDO.bag;
                              console.log("bpkgs after: "+ foundStock.bpkgs)
                              foundStock.bkgs -= (createdDO.bag * foundStock.wpkgs);
                              foundStock.deliveryOrder.push(createdDO);
                              foundStock.save(function(err, result){
                                  if(!err){
                                      doNbr++;
                                      next();
                                  }
                              });
                              console.log(foundStock.deliveryOrder)
                              
                              
                              
                              //res.render('doDisplay', {stock:foundStock, dos:createdDO});
                          } 
                       });
                   
                                    }
                              
                       
              
               
                   
           
           
            }); 
       });
        req.flash("success", "D/O created successfully");
           res.redirect("/stocks/" + req.params.id + "/do")
    
});


//DO VIEW

app.get("/stocks/:id/:d_id/display" , function(req, res) {
    Stock.findById(req.params.id).populate("deliveryOrder").exec(function(err, foundStock){
       if(err || !foundStock){
           req.flash("error", "Stock not found please try again")
           res.redirect("back");
       } else {
           DeliveryOrder.findById(req.params.d_id, function(err, foundDO){
              if(err || !foundDO){
                  req.flash("error", "DeliveryOrder not found")
                  res.redirect("back");
              } else {
                  Warehouse.findOne({short: foundStock.wh.toUpperCase()}, function(err, foundWH) {
                      if(err || !foundWH){
                          req.flash("error", "Warehouse not found")
                          res.redirect("back");
                      }else {
                          res.render('doDisplay', {stock:foundStock, dos:foundDO, wh: foundWH});
                      }
                  })
                  
              } 
           });
       }
    }); 
});



//DO DESTROY

app.delete("/stocks/:id/:d_id", function(req, res){
    //findByIdAndRemove
    Stock.findById(req.params.id, function(err, foundStock) {
        
        if(err || !foundStock){
            req.flash("error", "Something went wrong, Please try");
            res.redirect("back");  
        }else {
            DeliveryOrder.findById(req.params.d_id, function(err, foundDO){
               if(err){
                   req.flash("error", "Something went wrong, Please try");
                   res.redirect("back");
               } else {
                   DeliveryOrder.findByIdAndRemove(req.params.d_id, function(err){
                      if(!err){
                            foundStock.bpkgs += foundDO.bag;
                            foundStock.bkgs += (foundDO.bag * foundStock.wpkgs);
                            foundStock.save();
                            req.flash("success", "DeliveryOrder Deleted");
                            res.redirect("/stocks/" + foundStock._id + "/do");       
                      } 
                   });
                   
               }
            });    
        }
            
    });
    
});

//*******************************************
//*******************************************
// WAREHOUSE
//*******************************************
//*******************************************


// view route

app.get("/warehouse/new", function(req, res) {
    
    Warehouse.find({}, function(err, foundWarehouse){
       if(err){
           req.flash("error", "Something went wrong");
           res.redirect("back");
       } else {
            res.render("warehouse", {warehouse: foundWarehouse});       
       }
    });
    
});


//post
app.post("/warehouse/new", function(req, res){
    req.body.warehouse.short = req.body.warehouse.short.toUpperCase();
    Warehouse.create(req.body.warehouse, function(err){
        if(err){
            req.flash("error", "Something went error please try again");
            res.redirect("back")
        } else {
            req.flash("success", req.body.warehouse.name +  " added successfully");
            res.redirect("/warehouse/new" );
        }
    });  
});


//edit form
app.get("/warehouse/:id/edit", function(req, res) {
   Warehouse.findById(req.params.id, function(err, foundWarehouse){
       if(err){
           req.flash("error", "Warehouse not found! Please try again");
           res.redirect("back");
       } else {
           
           res.render("warehouseEdit", {warehouse: foundWarehouse});
       }
    }); 
});


// Put update
app.put("/warehouse/:id", function(req, res){
   req.body.warehouse.short = req.body.warehouse.short.toUpperCase();
   Warehouse.findByIdAndUpdate(req.params.id, req.body.warehouse, function(err,updatedWarehouse){
      if(err){
          req.flash("error", "Please try again");
          res.redirect("back");
          
      }  else {
          req.flash("success", updatedWarehouse.name +  " updated!");
          res.redirect("/warehouse/new");
          
      }
   }); 
});

// delete route

app.delete("/warehouse/:id", function(req, res){
   Warehouse.findByIdAndRemove(req.params.id, function(err){
       if(err){
          req.flash("error", "Please try again");
          res.redirect("back");
       } else {
           req.flash("success", "Warehouse deleted!");
          res.redirect("/warehouse/new");
       }
   });
    
});

app.listen(process.env.PORT, process.env.IP, function(){
  console.log("Stockapp Server has started!!!");
});

//newVal.replace(/[^0-9.]/g, "");

// pdf maker

/*seedDB();
 
function seedDB(){
    var warehouse = [
            {
              short: "GB",
              name: "Javaid Chai Pati",
              address: "Gulbai",
              keeper: "Naveed",
              number: 030012345678
            },
            
            {
              short: "MM",
              name: "MM GODOWN",
              address: "SITE",
              keeper: "Shehzad",
              number: 030012345678
            },
            {
              short: "JA",
              name: "J/ABAD",
              address: "123 NAWAZ STREET",
              keeper: "BAZ MOHD",
              number: 030012345678
            }
            
        ]
    
    
    warehouse.forEach(function(obj){
       Warehouse.create(obj, function(err, created){
           if(!err){
               console.log("warehouse added successfully")
           }
       }) 
    });
        
        
}*/

