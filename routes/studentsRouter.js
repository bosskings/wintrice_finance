import express from 'express';
import { studentsLogin } from '../controllers/students/studentsAuth.js';
import studentsOverview from '../controllers/students/studentsOverview.js';
import { coursesOverview, viewCourse } from '../controllers/students/studentsCourses.js';
import { requireAuth } from '../middleware/authMiddleware.js';


const studentsRouter = express.Router();


studentsRouter.post('/login', studentsLogin);

// Apply authentication middleware for subsequent routes
studentsRouter.use(requireAuth);

studentsRouter.get('/student-overview', studentsOverview);
studentsRouter.get('/student-courseOVerview', coursesOverview);
studentsRouter.get('/student-viewcourse', viewCourse);


// quiz



export default studentsRouter