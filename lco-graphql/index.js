import express from 'express'


const app=express()

app.get('/',(req,res) => {
    res.send("Get Request ")

})

app.listen(8082,()=> console.log("Running at 8082"))