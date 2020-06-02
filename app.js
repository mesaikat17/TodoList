//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://saikat:saikat@cluster001-1exgr.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = {
  name : String
};

const Item = mongoose.model("Item",itemSchema);

const listSchema = {
  name : String,
  item : [itemSchema]
};

const List = mongoose.model("List", listSchema);


const item1 = new Item({
  name : "Welcome Item"
});

// const item2 = new Item({
//   name : "Goodbye"
// });

// const item3 = new Item({
//   name : "Next Time"
// });

const defaultItems = [item1];

// Item.insertMany(defaultItems, function(err){
//   if (err){
//     console.log("Error in entry");
    
//   }
//   else{
//     console.log("Success");
    
//   }
// });


app.get("/", function(req, res) {
const day = date.getDate();


  Item.find({}, function (err, foundItems) {
      var allItem = foundItems;
      //console.log(allItem);
      res.render("list", {listTitle: day, newListItems: allItem});
  });
  
  app.get("/:job", function(req, res){

    const jobRoute =  _.capitalize(req.params.job);

    
    List.findOne({name : jobRoute}, function(err, result){
      if(!result){
        const listInsert = new List ({
          name : jobRoute,
          item : defaultItems
        });
        listInsert.save();
    
        res.redirect("/"+ jobRoute);
      }
      else{
        res.render("list",{listTitle: jobRoute, newListItems: result.item})
      }
    });

});

app.post("/", function(req, res){
  
  const item = req.body.newItem;
  const listTitle = req.body.list;

  const itemInsert = new Item ({
      name : item
  });

  if(listTitle === day){
    //console.log(day);
    
    itemInsert.save();
  res.redirect("/");
  }
  else{
      List.findOne({name : listTitle}, function(err, result){
        result.item.push(itemInsert);
        result.save();
        //console.log("Else Direct");
        
        res.redirect("/"+listTitle);
      });
  }



  
});




app.post("/delete", function (req, res) {
  var deleteItem = req.body.checkbox;
  var deleteList = req.body.listName;

  if(deleteList === day){

  Item.findByIdAndDelete({_id : deleteItem}, function(err){
    if(err){
      //console.log("Delete not Successfull");
          }
          else{
            //consoleconsole.log("Delete Success");
            res.redirect("/")
                      }
  });
  
}else{
    List.findOneAndUpdate({name: deleteList},{$pull :{item: {_id: deleteItem}}}, function(err, found){
      if(!err){
        res.redirect("/"+deleteList);
      }
    })
}
});







});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT | 3000, function() {
  console.log("Server started on port 3000");
});
