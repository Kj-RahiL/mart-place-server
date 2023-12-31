const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const app = express()
const port = process.env.port || 5000


// middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://mart-place-1d735.web.app',
    'https://mart-place-1d735.firebaseapp.com',
    'https://martplace-kj.netlify.app'
  ],
  credentials:true
}))
app.use(express.json())
app.use(cookieParser())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uma9m7n.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// middlewares
const logger = async(req,res,next)=>{
  console.log('called log', req.method, req.url)
  next()
}

const verifyToken = async(req,res,next)=>{
  const token = req.cookies?.token
  console.log('token in middleware', token)
  if(!token){
    return res.status(401).send({message: 'unAuthorized access'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
    if(err){
      console.log(err)
      return res.status(401).send({message: 'unAuthorized access'})
    }
    console.log('value in the token', decoded)
    req.user = decoded
    next()
  })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const jobCollection = client.db('JobDB').collection('jobs')
    const bidCollection = client.db('JobDB').collection('myBids')

    // auth related api
    app.post ('/jwt', async(req,res)=>{
      const user =req.body
      console.log(user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})

      // .cookie('token', token,{
      //   httpOnly: true,
      //   secure:false,
      //   sameSite: 'none'

      // })
      // .send({success: true})

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',

    }).send({success: true})
    })

    app.post('/logout', async(req,res)=>{
      const user = req.body
      console.log('logging out', user)
      res.clearCookie('token', {maxAge: 0}).send({success:true})
    })

    // add jobs
    app.post('/jobs', async (req, res) => {
      // console.log(req.body)
      const job = req.body
      const result = await jobCollection.insertOne(job)
      res.send(result)
    })

    app.get('/jobs', async (req, res) => {
      let query = {}
      if (req?.query?.email) {
        query = { email: req.query.email }
      }
      const result = await jobCollection.find(query).toArray()
      res.send(result)
    })

    app.get('/jobDetails/:category', async (req, res) => {
      const category = req.params.category
      // console.log('hello', category)
      const query = { category: category };
      const cursor = jobCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      // console.log('hi', id)
      const query = { _id: new ObjectId(id) }
      const result = await jobCollection.findOne(query)
      res.send(result)
    })

    app.delete('/jobs/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await jobCollection.deleteOne(query)
      res.send(result)
    })

    app.patch('/jobs/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updateJob = req.body
      console.log(updateJob, id)
      const updateDoc = {
        $set: {
          status: updateJob.status
        },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc)
      res.send(result)
    })
    app.put('/jobs/:id', async (req, res) => {
      const id = req.params.id
      const job = req.body
      console.log(job.email)
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateProduct = {
        $set: {
         email:job.email,
         title:job.title,
         deadline:job.deadline,
         minPrice:job.minPrice,
         maxPrice:job.maxPrice,
         description:job.description,
        },
      }
      console.log(updateProduct)
      const result = await jobCollection.updateOne(filter, updateProduct, options);
      res.send(result)
    })

    // my bids
    app.post('/myBid', async (req, res) => {
      const bid = req.body
      console.log('hit from job details', bid)
      const result = await bidCollection.insertOne(bid)
      res.send(result)
    })

    app.get('/myBid',logger, verifyToken, async (req, res) => {
   
      console.log('tik tok token', req.cookies.token)
      console.log('..hellooo.', req.query.userEmail)
      console.log('req user', req.user)

    //  if(req.query.userEmail !== req.user.email){
    //   return res.status(403).send({message: "forbidden access"})
    //  }

      let query = {}
      if (req?.query?.userEmail) {
        query = { userEmail: req.query.userEmail }
      }
      if (req?.query?.buyerEmail) {
        query = { buyerEmail: req.query.buyerEmail }
      }
      const result = await bidCollection.find(query).sort({ status: 1 }).toArray()
      res.send(result)
    })


    app.patch('/myBid/:id', async(req,res)=>{
      const id = req.params.id
      const filter = { _id: new ObjectId(id)}
      const update = req.body
      console.log(update)
      const updateDoc = {
          $set: {
              status: update.status
          },
      };
      const result = await bidCollection.updateOne(filter, updateDoc)
      res.send(result)
  })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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