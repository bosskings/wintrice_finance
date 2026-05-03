import express from 'express';
import { studentsLogin } from '../controllers/students/studentsAuth';
import studentsOverview from '../controllers/students/studentsOverview';
import { coursesOverview, viewCourse } from '../controllers/students/studentsCourses';

const studentsRouter = express.Router();


studentsRouter.post('/login', studentsLogin);

// Apply authentication middleware for subsequent routes
studentsRouter.use(requireAuth);

studentsRouter.get('/student-overview', studentsOverview);
studentsRouter.get('/student-courseOVerview', coursesOverview);
studentsRouter.get('/student-viewcourse', viewCourse);


// quiz



export default studentsRouter