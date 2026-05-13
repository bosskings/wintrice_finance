import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/authMiddleware.js";
import { verifySchool, login } from "../controllers/schools/schoolAuth.js";
import { 
    schoolOverview, 
    getAllStudents, 
    getStudentById, 
    getQuizStatsForSchool, 
    addNewStudent,
    updateStudent
} from "../controllers/schools/schoolsStudents.js";
import { 
    updateSchoolProfile, 
    updateSchoolEmail, 
    updateSchoolPassword, 
    sendAndUpdateAuthCode
} from "../controllers/schools/schoolSettings.js";
import { allCourses } from "../controllers/schools/extras.js";
import { getAllQuizzes } from "../controllers/admin/adminQuiz.js";


const schoolsRouter = express.Router();

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

schoolsRouter.post('/verify', verifySchool);
schoolsRouter.post('/login', login);

schoolsRouter.get('/courses', allCourses)
schoolsRouter.get('/quizzes', getAllQuizzes)

// Apply authentication middleware for subsequent routes
schoolsRouter.use(requireAuth);

// Students endpoints
schoolsRouter.get('/overview', schoolOverview);
schoolsRouter.get('/students', getAllStudents);
schoolsRouter.post('/students', addNewStudent)
schoolsRouter.get('/students/:id', getStudentById);
schoolsRouter.put('/students/:id', updateStudent);

// Quizzes endpoints
schoolsRouter.get('/quizzes/stats', getQuizStatsForSchool);

// School profile/settings endpoints
schoolsRouter.put('/profile', upload.single('image'), updateSchoolProfile);
schoolsRouter.post('/profile/email/auth-code', sendAndUpdateAuthCode);
schoolsRouter.put('/profile/email', updateSchoolEmail);
schoolsRouter.put('/profile/password', updateSchoolPassword);



export default schoolsRouter; 