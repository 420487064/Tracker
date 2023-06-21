const express = require('express');

const cors = require('cors');

const app = express();
app.use(express.urlencoded({extended:false}))

app.post('/tracker',(req,res)=>{
    console.log(req.body)
    res.send(200)
})

app.use(cors());

app.listen(9000,() =>{
    console.log("http://localhost:9000");
})