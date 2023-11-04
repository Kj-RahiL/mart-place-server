const express = require('express');
const app = express()
const port = process.env.port || 5000

app.get('/', (req,res)=>{
    res.send('MY MartPlace server side is running')

})

app.listen(port, ()=>{
    console.log(`MY MAartPlace running on the port: ${port}`)
})