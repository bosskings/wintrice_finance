import Quiz from "../../models/Quiz.js";
import School from '../../models/School.js';
import Student from '../../models/Student.js';
import nodemailer from "nodemailer"

const schoolOverview = async(req, res) =>{

    try {
        const schoolId = req.schoolId;

        // Total students in this school
        const totalStudents = await Student.countDocuments({ school: schoolId });

        // Total active students (assuming you have a status or isActive field)

        const totalActiveStudents = await Student.countDocuments({ school: schoolId, status: 'active' });

        // Get the school's status
        const school = await School.findById(schoolId, 'status');
        const schoolStatus = school ? school.status : null;

        // Overview object
        const overview = {
            totalStudents,
            totalActiveStudents,
            schoolStatus,
        };

        // Latest 10 students (sorted by creation date descending)
        const latestStudents = await Student.find({ school: schoolId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        res.status(200).json({
            overview,
            latestStudents,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}


const getAllStudents = async (req, res) => {
    try {
        const schoolId = req.schoolId;

        // Fetch all students belonging to this school
        const students = await Student.find({ school: schoolId }).lean();

        res.status(200).json({
            status: "SUCCESS",
            students
        });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: "Server Error", error: error.message });
    }
}




/**
 * function to create new student from a schools dashboard
*/
const generateRandomPassword = (length = 8) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pwd = '';
    for (let i = 0; i < length; ++i) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
};

const addNewStudent = async (req, res) => {
    try {
        const { email, grade } = req.body;
        const schoolId = req.schoolId;

        if (!email || !grade) {
            return res.status(400).json({
                status: "FAILED",
                message: "Email and grade are required"
            });
        }

        // Check if already exists
        const existing = await Student.findOne({ email, school: schoolId });
        if (existing) {
            return res.status(409).json({
                status: "FAILED",
                message: "A student with this email already exists for this school"
            });
        }

        // Generate password
        const password = generateRandomPassword();

        // Create student
        const student = new Student({
            email,
            grade,
            password,
            school: schoolId,
            status: 'ACTIVE'
        });

        await student.save();

        // Setup nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // set in your env
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Wintrice Student Account Created',
            text: `Your account has been created, view your login details below:\n\nEmail: ${email}\nPassword: ${password}\n\nPlease login and change your password.`
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({
            status: "SUCCESS",
            message: "Student account created and login details sent to email."
        });

    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            message: "Could not add student.",
            error: error.message
        });
    }
};


/**
 * function to get single student details with input ID in the req.param 
 */
const getStudentById = async (req, res) => {
    try {
        const schoolId = req.schoolId;
        const { id } = req.params;

        // Find the student by id and make sure they belong to the requesting school
        const student = await Student.findOne({ _id: id, school: schoolId }).lean();

        if (!student) {
            return res.status(404).json({
                status: "FAILED",
                message: "Student not found."
            });
        }

        res.status(200).json({
            status: "SUCCESS",
            student
        });
    } catch (error) {
        res.status(500).json({ 
            status: "FAILED", 
            message: "Server Error", 
            error: error.message 
        });
    }
}



/**
 * Get quiz details for students under this school.
 * Returns:
 * - quizzes with student details (restricted to students under this school),
 * - average student quiz completion time (if available in data),
 * - percentage of students scoring over 60% per quiz.
 */
const getQuizStatsForSchool = async (req, res) => {
    try {
        const schoolId = req.schoolId;
        // Get all student IDs under this school
        const students = await Student.find({ school: schoolId }, "_id").lean();
        const studentIds = students.map(s => s._id);

        // Find all quizzes where at least one student from this school took the quiz
        const quizzes = await Quiz.find({
            "students.studentId": { $in: studentIds }
        }).lean();

        const quizzesWithStats = quizzes.map(quiz => {
            // Filter students in this quiz to only those belonging to this school
            const relevantQuizStudents = quiz.students.filter(s =>
                studentIds.some(id => id.equals ? id.equals(s.studentId) : String(id) === String(s.studentId))
            );

            // To compute scores, need number of questions per quiz
            const totalQuestions = quiz.questions.length > 0 ? quiz.questions.length : 1;

            // Percentage of students who scored over 60%
            const over60Count = relevantQuizStudents.filter(s =>
                ((s.score / totalQuestions) * 100) > 60
            ).length;
            const percentOver60 = relevantQuizStudents.length > 0
                ? Math.round((over60Count / relevantQuizStudents.length) * 100)
                : 0;

            // Completion time not in data, but if present: assume quiz.students[i].completionTime (milliseconds)
            let avgCompletionTime = null;
            if (relevantQuizStudents.length > 0 && relevantQuizStudents.some(s => s.completionTime != null)) {
                const times = relevantQuizStudents
                    .filter(s => s.completionTime != null)
                    .map(s => s.completionTime);
                avgCompletionTime = times.length > 0
                    ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
                    : null; // ms
            }

            return {
                quizId: quiz._id,
                title: quiz.title,
                dateWritten: quiz.dateWritten,
                numberOfParticipants: relevantQuizStudents.length,
                percentOver60,
                avgCompletionTime, // ms, or null if not present in data
                students: relevantQuizStudents.map(rs => ({
                    studentId: rs.studentId,
                    score: rs.score,
                    // .completionTime if available in schema/data
                    ...(rs.completionTime != null && { completionTime: rs.completionTime })
                }))
            }
        });

        res.status(200).json({
            status: "SUCCESS",
            count: quizzesWithStats.length,
            quizzes: quizzesWithStats
        });

    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            message: "Server Error",
            error: error.message
        });
    }
};




export {
    schoolOverview,
    getAllStudents,
    addNewStudent,
    getStudentById,
    getQuizStatsForSchool
}