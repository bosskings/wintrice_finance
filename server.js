import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import financeRouter from "./routes/finance/financialReport.js"
import adminRouter from "./routes/adminRouter.js";
import schoolsRouter from "./routes/shoolsRouter.js";
import studentsRouter from "./routes/studentsRouter.js";

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('public'))

app.use('/api/v1/fincanceRecord', financeRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/school', schoolsRouter);
app.use('/api/v1/student', studentsRouter);


// test route
app.get('/', (req, res)=>{
    res.json({message:"all good on wintrice"})
})

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
    app.listen(4500, () => {
        console.log('Server is running on port 4500');
    });
})
.catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
});