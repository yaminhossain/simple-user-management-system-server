const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// MongoDB setups
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9azss.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

console.log(
  "-------------------------------------------------------------------------------------------------------------------------"
);

// All APIs
app.get("/", (req, res) => {
  res.send("The simple user management server is running");
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const usersCollection = client
      .db("simpleUserManagementSystem")
      .collection("users");
    // GET API for getting users data from MongoBD
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // POST API for sending users data to MongoDB
    app.post("/users", async (req, res) => {
      console.log(req.body);
      const result = await usersCollection.insertOne(req.body);
      res.send(result);
    });

    // PUT API for updating user data to MongoDB
    app.put("/users/:id", async(req, res) => {
      console.log("The put request is hitting");
      console.log(req.params.id);
      console.log(req.body);
      const filter = { _id: new ObjectId(req.params.id) };
      const options = { upsert: true };
      const updatedUserData = {
        $set: {
          name:req.body.name,
          email: req.body.email,
          gender:req.body.gender,
          status:req.body.status
        },
      };
      const result = await usersCollection.updateOne(filter, updatedUserData, options);
      res.send(result);
    });

    // DELETE API for deleting a user from the database
    app.delete("/users/:id", async (req, res) => {
      console.log("The delete api is hitting");
      console.log(req.params.id);
      const query = { _id: new ObjectId(req.params.id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`The application is listening to PORT ${port}`);
});
