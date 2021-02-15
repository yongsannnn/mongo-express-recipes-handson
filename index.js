const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
const mongoUrl = process.env.MONGO_URL;
const MongoUtil = require("./MongoUtil");
const ObjectId = require("mongodb").ObjectId;

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static foldery
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
    express.urlencoded({
        extended: false
    })
);

async function main() {
    let db = await MongoUtil.connect(mongoUrl, "hands-on");

    // MongoDB is connected and alive
    // Setting up Create
    app.get("/cuisine/create", (req, res) => {
        res.render("cuisines/create")
    })
    // Post Create
    app.post("/cuisine/create", async (req, res) => {
        await db.collection("cuisines").insertOne({
            "type": req.body.cuisineType
        })
        res.redirect("/cuisine/all")
    })


    //Reading
    // Display all content under cuisines
    app.get("/cuisine/all", async (req, res) => {
        let cuisines = await db
            .collection("cuisines") //select the ingredients collection
            .find({}) // find all the ingredient with no criteria
            .toArray(); // convert to array
        res.render("cuisines/all", {
            "type": cuisines
        })
    })


    // Setting up Deleting 
    app.get("/cuisine/:cuisine_id/delete", async (req, res) => {
        let cuisineId = req.params.cuisine_id
        let cuisine = await db.collection("cuisines").findOne({
            "_id": ObjectId(cuisineId)
        })

        res.render("cuisines/delete", {
            "cuisine": cuisine
        })

    })

    // Post Delete
    app.post('/cuisine/:cuisine_id/delete', async (req, res) => {
        await db.collection('cuisines').remove({
            '_id': ObjectId(req.params.cuisine_id)
        })
        res.redirect('/cuisine/all')
    })

    // Setting up Update
    app.get('/cuisine/:cuisine_id/update', async (req, res) => {
        let cuisineId = req.params.cuisine_id;
        let cuisine = await db.collection('cuisines').findOne({
            '_id': ObjectId(cuisineId)
        });

        res.render('cuisines/update', {
            'cuisine': cuisine
        })
    })


    // Post Update
    app.post("/cuisine/:cuisine_id/update", (req, res) => {
        let newName = req.body.cuisineName
        let cuisineId = req.params.cuisine_id
        db.collection("cuisines").updateOne({
            "_id": ObjectId(cuisineId)
        },{
            "$set": {
                "type": newName
            }
        })
        res.redirect("/cuisine/all")
    })

    // Setting up create Comment
    // app.get("/cuisine/:cuisine_id/comments/create", async (req,res)=>{
    // })



} // end of main function



main();

app.listen(3000, () => {
    console.log("Sever has started");
})