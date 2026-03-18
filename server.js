import express from "express";
import financeRouter from "./routes/finance/financialReport.js"
import cors from "cors";


const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('public'))


app.use('/api/v1/fincanceRecord', financeRouter);


// test route
app.get('/', (req, res)=>{
    res.json({message:"all good"})
})


app.listen(4500, ()=>{
    console.log('sever is running on port 4500');
})