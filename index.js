const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express()
const port = process.env.port || 5000

// mart-place
// mTL7efFGMs5yVsmA

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uma9m7n.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobCollection = client.db('JobDB').collection('jobs')
    const bidCollection = client.db('JobDB').collection('myBids')

    // add jobs
    app.post('/jobs', async (req, res) => {
      // console.log(req.body)
      const job = req.body
      const result = await jobCollection.insertOne(job)
      res.send(result)
    })

    app.get('/jobs', async (req, res) => {
      const cursor = jobCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/jobs/:category', async (req, res) => {
      const category = req.params.category
      // console.log('hello', category)
      const query = { category: category };
      const cursor = jobCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/jobDetails/:id', async (req, res) => {
      const id = req.params.id;
      // console.log('hi', id)
      const query= {_id: new ObjectId(id)}
      const result = await jobCollection.findOne(query)
      res.send(result)
    })

    // my bids
    app.post('/myBid', async (req, res) => {
      const bid = req.body
      console.log('hit from job details', bid)
      const result = await bidCollection.insertOne(bid)
      res.send(result)
    })

    app.get('/myBid', async (req, res) => {
      const cursor = bidCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('MY MartPlace server side is running')

})

app.listen(port, () => {
  console.log(`MY MAartPlace running on the port: ${port}`)
})