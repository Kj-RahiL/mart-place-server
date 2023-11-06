const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express()
const port = process.env.port || 5000

// mart-place
// mTL7efFGMs5yVsmA

// middleware
app.use(cors())
app.use(express.json())

const uri = "mongodb+srv://mart-place:mTL7efFGMs5yVsmA@cluster0.uma9m7n.mongodb.net/?retryWrites=true&w=majority";

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

    app.post('/jobs', async(req,res)=>{
        // console.log(req.body)
        const job = req.body
        const result = await jobCollection.insertOne(job)
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


app.get('/', (req,res)=>{
    res.send('MY MartPlace server side is running')

})

app.listen(port, ()=>{
    console.log(`MY MAartPlace running on the port: ${port}`)
})