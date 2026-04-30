import express from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { verifySchool, login } from "../controllers/schools/schoolAuth.js";
import { 
    schoolOverview, 
    getAllStudents, 
    getStudentById, 
    getQuizStatsForSchool, 
    addNewStudent
} from "../controllers/schools/students.js";
import { 
    updateSchoolProfile, 
    updateSchoolEmail, 
    updateSchoolPassword 
} from "../controllers/schools/schoolSettings.js";


const schoolsRouter = express.Router();



schoolsRouter.post('/verify', verifySchool);
schoolsRouter.post('/login', login);

// Apply authentication middleware for subsequent routes
schoolsRouter.use(requireAuth);

// Students endpoints
schoolsRouter.get('/overview', schoolOverview);
schoolsRouter.get('/students', getAllStudents);
schoolsRouter.post('/students', addNewStudent)
schoolsRouter.get('/students/:id', getStudentById);
schoolsRouter.get('/quizzes/stats', getQuizStatsForSchool);

// School profile/settings endpoints
schoolsRouter.put('/profile', updateSchoolProfile);
schoolsRouter.put('/profile/email', updateSchoolEmail);
schoolsRouter.put('/profile/password', updateSchoolPassword);



export default schoolsRouter; 