import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/authMiddleware.js";
import { verifySchool, login } from "../controllers/schools/schoolAuth.js";
import { 
    schoolOverview, 
    getAllStudents, 
    getStudentById, 
    getQuizStatsForSchool, 
    addNewStudent
} from "../controllers/schools/schoolsStudents.js";
import { 
    updateSchoolProfile, 
    updateSchoolEmail, 
    updateSchoolPassword 
} from "../controllers/schools/schoolSettings.js";


const schoolsRouter = express.Router();

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

schoolsRouter.post('/verify', verifySchool);
schoolsRouter.post('/login', login);

// Apply authentication middleware for subsequent routes
schoolsRouter.use(requireAuth);

// Students endpoints
schoolsRouter.get('/overview', schoolOverview);
schoolsRouter.get('/students', getAllStudents);
schoolsRouter.post('/students', addNewStudent)
schoolsRouter.get('/students/:id', getStudentById);

// Quizzes endpoints
schoolsRouter.get('/quizzes/stats', getQuizStatsForSchool);

// School profile/settings endpoints
schoolsRouter.put('/profile', upload.single('image'), updateSchoolProfile);
schoolsRouter.put('/profile/email', updateSchoolEmail);
schoolsRouter.put('/profile/password', updateSchoolPassword);



export default schoolsRouter; 