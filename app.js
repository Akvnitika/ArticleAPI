//jshint esversion:6

// Starting Server Code

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose'); //ODM - object document mapper allows node js app speaking javaScript to talk to MongoDB which talks language of documents

const app = express(); // create new app using express

const cors = require('cors');
const corsOptions ={
    origin:'http://localhost:3000',   // allowing requests form react front end runnning on local host 3000
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));



app.set('view engine', 'ejs'); // set view engine to use ejs as our templating engine

app.use(bodyParser.urlencoded({ // using body parser to parse our request
  extended: true
}));
app.use(express.static("public")); // using our public directory to store static file such as images


// Set up MongoDB Database using mongoose

mongoose.connect("mongodb://localhost:27017/wikiDB", {
  userNewUrlParser: true
}); // connect to local mongodb instance

// Create schema for our articles collection
const articleSchema = {
  title: String,
  content: String
};

// Create model by specifying the name of our collection and schema
const Article = mongoose.model("Article", articleSchema);



////////////////////////Create chainable routes for request targetting All the Articles///////////////////////
app.route("/articles")

  .get(function(req, res) { // Create GET route to fetches all the articles
    Article.find(function(err, foundAticles) { // inside our call back function query the database to find all of the documents of articles collection

      if (!err) { // if we have an error we could see it on the client side
        res.send(foundAticles);
      } else {
        res.send(err);
      }

    });
  })

  .post(function(req, res) { // Create POST route to create new article

    const newArticle = new Article({ // create new article by grabbing the data from request body coming from client side
      title: req.body.title,
      content: req.body.content
    });
    newArticle.save(function(err) {
      if (!err) {
        res.send("Successfully added a new article.");
      } else {
        res.send(err);
      }
    });
  })

  .delete(function(req, res) { // Create Http DELETE request to delete all the article

    Article.deleteMany(function(err) {
      if (!err) {
        res.send("Successfully deleted all articles");
      } else {
        res.send(err);
      }
    });

  });


//////////////////Create chainable routes for request targetting a specific Article///////////////////////////

app.route("/articles/:articleTitle") //:articleTitle  is the route parameter assigned by the client to their url request

  .get(function(req, res) { // Get request to search for a specific Article inside the database based on the title paramater from the url

    Article.findOne({
      title: req.params.articleTitle
    }, function(err, foundArticle) {
      if (foundArticle) {
        res.send(foundArticle);
      } else {
        res.send("No articles matching that title was found");
      }
    });
  })

  .put(function(req, res) { // PUT request to update a specific Article inside the database based on the title paramater from the url
    // This method is to be used if we want to replace the entire Article. For specific section of Article use PATCH request.

    Article.update({
        title: req.params.articleTitle
      }, // condition
      {
        title: req.body.title,
        content: req.body.content
      }, // New data to be updated
      {
        overwrite: true
      },
      function(err) {
        if (!err) {
          res.send("Successfully updated article.");
        }
      }
    );


  })

  .patch(function(req, res) { // Update specific section of the Article
    Article.update({
        title: req.params.articleTitle
      }, // search condition
      {
        $set: req.body
      }, // Check for fields to be updated
      function(err) {
        if (!err) {
          res.send("Successfully updated article.");
        } else {
          res.send(err);
        }
      }
    );

  })

  .delete(function(req, res) { // delete a spcific Article
    Article.findOneAndDelete({
        title: req.params.articleTitle
      }, // search condition
      function(err, article) {
        if (!err) {
          if (article) {
            res.send("Successfully deleted the article");
          } else {
            res.send("No article found");
          }
        } else {
          res.send(err);
        }
      }
    );
  });



app.listen(3031, function() { // Set our app to listen on port 3031
  console.log("Server started on port 3031");
});
