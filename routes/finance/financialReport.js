import { signUp, login } from '../../controllers/financeReport/auth.js';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { generateReport, generateReportJSON } from '../../controllers/financeReport/financialReport.js';
import express from 'express';

const financeRouter = express.Router();

// Auth routes
financeRouter.post('/signup', signUp);
financeRouter.post('/login', login);

// Apply authentication middleware for subsequent routes
financeRouter.use(requireAuth);

    financeRouter.post('/downloadReport', generateReport);
    financeRouter.post('/generateReport', generateReportJSON);


export default financeRouter;
