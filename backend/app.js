import express from 'express';

const app = express();
app.get("/" , (req,res)=>{
    res.send("Welcome to IdealFounders")
})
let PORT = 3000;
app.listen(PORT , ()=>{
    console.log(`Server running on ${PORT}`)
})