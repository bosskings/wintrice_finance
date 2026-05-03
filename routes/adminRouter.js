import express from 'express';
import multer from 'multer';

import { createAnnouncement, getAllAnnouncements } from '../controllers/admin/adminAnnouncement.js';
import {
    getCoursesOverview,
    getAllCourses,
    getCourseById,
    updateCourseStatus,
    createCourse,
} from '../controllers/admin/adminCourses.js';
import {
    getStudentOverview,
    getAllSchools,
    createSchool,
    updateSchool,
    getSchoolById,
} from '../controllers/admin/adminSchools.js';
import {
    getStudentsOverview,
    getAllStudents,
    getStudentById,
    updateStudentStatus,
} from '../controllers/admin/adminStudents.js';
import {
    getSupportOverview,
    getAllSupportTickets,
    updateSupportStatus,
} from '../controllers/admin/support.js';
import adminOverview from '../controllers/admin/adminHome.js';
import adminLogin from '../controllers/admin/adminAuth.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createQuiz } from '../controllers/admin/adminQuiz.js';

const adminRouter = express.Router();

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

adminRouter.post('/login', adminLogin);

// Apply authentication middleware for subsequent routes
adminRouter.use(requireAuth);

// Announcements
adminRouter.post('/createAnnouncements', createAnnouncement);
adminRouter.get('/announcements', getAllAnnouncements);

// Courses
adminRouter.get('/courses/overview', getCoursesOverview);
adminRouter.get('/courses', getAllCourses);
adminRouter.post('/courses', createCourse);
adminRouter.get('/courses/:id', getCourseById);
adminRouter.patch('/courses/:id/status', updateCourseStatus);

// overview
adminRouter.get('/overview', adminOverview);

// Schools
adminRouter.get('/schools/overview', getStudentOverview);
adminRouter.get('/schools', getAllSchools);
adminRouter.post('/schools', upload.fields([{ name: 'image', maxCount: 1 }]), createSchool);
adminRouter.get('/schools/:id', getSchoolById);
adminRouter.put('/schools/:id', upload.fields([{ name: 'image', maxCount: 1 }]), updateSchool);

// Students
adminRouter.get('/students/overview', getStudentsOverview);
adminRouter.get('/students', getAllStudents);
adminRouter.get('/students/:id', getStudentById);
adminRouter.patch('/students/:id/status', updateStudentStatus);

// Support
adminRouter.get('/support/overview', getSupportOverview);
adminRouter.get('/support', getAllSupportTickets);
adminRouter.get('/support/:id', getAllSupportTickets);
adminRouter.patch('/support/:id/status', updateSupportStatus);

// quiz 
adminRouter.post('/quiz', createQuiz)

export default adminRouter;
