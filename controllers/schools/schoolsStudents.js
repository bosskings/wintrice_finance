import bcrypt from 'bcryptjs';
import Quiz from "../../models/Quiz.js";
import School from '../../models/School.js';
import Student from '../../models/Student.js';
import sendEmail from '../../utils/sendEmail.js';

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
        const schoolId = req.user.id;
        console.log(schoolId);
        
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
        const { email, grade, dob, name } = req.body;
        const schoolId = req.user.id;


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
        // Encrypt password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create student
        const student = new Student({
            email,
            grade,
            name,
            dob,
            password: hashedPassword,
            school: schoolId,
            status: 'ACTIVE'
        });

        await student.save();

        // Update the school's logged-in document with this student's ID
        // (Assuming School model exists and has a "students" array. Change as appropriate per your schema.)
        await School.findByIdAndUpdate( schoolId,
            { $addToSet: { students: student._id } } // Add only if not present
        );

        // Prepare email content and send notification to new student
        const toEmail = email;
        const emailSubject = "Your Wintrice Student Account Created";
        const emailHtml = `
            <div style="background-color: #1E90FF; color: #fff; padding: 24px; font-family: Arial, sans-serif; border-radius: 8px;">
                <div style="background-color: #fff; color: #1E90FF; padding: 24px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(30,144,255,0.12);">
                    <h1 style="color: #1E90FF; margin-bottom: 16px;">Welcome to Wintrice E-learning!</h1>
                    <p style="font-size: 18px; color: #1E90FF;">
                        Your student account has been created.
                    </p>
                    <p style="margin: 24px 0 8px 0; color: #1E90FF;">
                        <strong>Your Login Details:</strong>
                    </p>
                    <div style="font-size: 18px; color: #1E90FF; background: #f6faff; border-radius: 4px; padding: 12px; display: inline-block;">
                        Email: <strong style="word-break: break-all;">${email}</strong><br/>
                   
                        Password: <strong>${password}</strong>
                    </div>
                    <p style="margin: 24px 0 0 0; color: #1E90FF;">
                        Please login and change your password after first login.
                    </p>
                </div>
            </div>
        `;

        if (toEmail) {
            await sendEmail(toEmail, emailSubject, emailHtml);
        }


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

        // Fetch all quizzes that this student has participated in
        // Quiz.students: [{ studentId, ... }]
        const quizzes = await Quiz.find({ "students.studentId": id }).lean();

        // Prepare quiz details for this student
        const quizzesForStudent = quizzes.map(quiz => {
            // Find this student's entry within the quiz
            const studentQuizEntry = quiz.students.find(s =>
                (s.studentId.equals ? s.studentId.equals(id) : String(s.studentId) === String(id))
            );
            
            // Return summary for each quiz relevant to this student
            return {
                quizId: quiz._id,
                title: quiz.title,
                score: studentQuizEntry ? studentQuizEntry.score : null,
                completionTime: studentQuizEntry ? studentQuizEntry.completionTime : null,
                complete: studentQuizEntry ? studentQuizEntry.complete : null,
                totalQuestions: quiz.questions.length,
                dateWritten: quiz.dateWritten
            };
        });

        res.status(200).json({
            status: "SUCCESS",
            student,
            quizzes: quizzesForStudent
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


/**
 * Allows a school to update a student's details (name, grade, age, status, etc.)
 * Only the school that owns the student is authorized.
 * 
 * Expects:
 *   - req.params.id: the studentId
 *   - req.body: the fields to update (name, grade, age, status, etc.)
 */
const updateStudent = async (req, res) => {
    try {
        const schoolId = req.schoolId;
        const { id: studentId } = req.params;
        const allowedFields = ["name", "grade", "dob", "status", "enrolled"];

        // Fetch student and check school ownership
        const student = await Student.findOne({ _id: studentId, school: schoolId });
        if (!student) {
            return res.status(404).json({
                status: "FAILED",
                message: "Student not found or not part of your school."
            });
        }

        let updated = false;
        allowedFields.forEach(field => {
            if (Object.prototype.hasOwnProperty.call(req.body, field) && req.body[field] != null) {
                student[field] = req.body[field];
                updated = true;
            }
        });

        if (!updated) {
            return res.status(400).json({
                status: "FAILED",
                message: "No valid fields provided for update."
            });
        }

        student.updatedAt = new Date();
        await student.save();

        res.status(200).json({
            status: "SUCCESS",
            message: "Student details updated.",
            student: {
                _id: student._id,
                name: student.name,
                grade: student.grade,
                age: student.age,
                status: student.status,
                enrolled: student.enrolled,
                email: student.email
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            message: "An error occurred while updating student.",
            error: error.message
        });
    }
};




export {
    schoolOverview,
    getAllStudents,
    addNewStudent,
    getStudentById,
    getQuizStatsForSchool,
    updateStudent
}