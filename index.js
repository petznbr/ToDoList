import Express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from 'lodash';

const app = Express();
const port = process.env.PORT || 3030;
const dayTasks = [];
const workTasks = [];

app.use(Express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://bpetznick:November211989@cluster0.nd9zxri.mongodb.net/todolistDB");

const itemsSchema = mongoose.Schema ({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
    name: "Do dishes!"
});

const item2 = new Item ({
    name: "Wash clothes!"
});

const item3 = new Item ({
    name: "Do homework!"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {

  async function insertItems() {
    try {
      const response = await Item.insertMany(defaultItems);
      console.log(response);
      console.log("Items added succesfully");
    } catch (err) {
      console.log(err);
    }
  };

  async function myitems() {
    try {
        const items= await Item.find({});
        const list2 = await List.find({});
      console.log(list2);
        if (items.length === 0) {
          insertItems();
        }
        res.render("index.ejs", {listTitle: "Today", toDo:items, toDoLists:list2});
        res.render("partials/header.ejs", {toDoLists:list2});
    }  catch (err) {
        console.log(err);
    }
}
myitems();
});

app.get("/favicon.ico", function(req, res){
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  async function myList() {
    try {
      const lists = await List.findOne({name: customListName});
      const list2 = await List.find({});
      console.log(list2);
      if (lists) {
        res.render("index.ejs", {listTitle: customListName, toDo:lists.items, toDoLists:list2});
        res.render("partials/header.ejs", {toDoLists:list2});
      } else {
         const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save();
      }
    }  catch (err) {
        console.log(err);
    }
}
myList();
});

app.post("/", (req, res) => {
    const itemName = req.body.task;
    const listName = req.body.List;

  const item = new Item ({
      name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    async function myList() {
      try {
        const lists= await List.findOne({name: listName}).exec();
        lists.items.push(item);
        lists.save();
        res.redirect("/"+listName);
      }  catch (err) {
          console.log(err);
      }
  }
  myList();
  }
  
});

app.post("/delete", (req, res) => {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    async function deleteItems() {
      try {
        const deleteItem = await Item.findOneAndDelete({ _id: checkedItemId }).exec();
        console.log("Removed successfully!");
        res.redirect("/");
      } catch (err) {
        console.log(err);
      }
    };
    deleteItems();
  } else {
    async function deleteItems() {
      try {
    const itemToDelete = await List.findOne({name:listName});
    console.log(itemToDelete);
    itemToDelete.items.pull({ _id: checkedItemId });
    console.log(checkedItemId);
    itemToDelete.save()
  } catch (err) {
    console.log(err);
  }
};
deleteItems();
res.redirect("/"+listName);
  }
          // Item.findOneAndDelete({ _id: checkedItemId }).then(function() {
          //   console.log("Removed successfully!");
          //   res.redirect("/");
          // }).catch(function(err) {
          //   console.log(err);
          // });
});
  
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});