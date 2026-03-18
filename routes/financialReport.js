import express from 'express';
import { generateReport, generateReportJSON } from '../controllers/financialReport.js';

const financeRouter = express.Router();


financeRouter.post('/downloadReport', generateReport);
financeRouter.post('/generateReport', generateReportJSON);


export default financeRouter;
