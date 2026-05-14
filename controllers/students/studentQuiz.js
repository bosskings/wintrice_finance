import Quiz from '../../models/Quiz.js';
import Student from '../../models/Student.js';

/**
 * Get all quizzes available for the logged-in student's grade.
 * Assumes req.user is set by auth middleware and contains a "grade" property.
 */
const getQuizzes = async (req, res) => {
    try {
        const student = req.user;
        if (!student || typeof student.grade === "undefined") {
            return res.status(400).json({
                status: "FAILED",
                message: "Student grade not available."
            });
        }

        const gradeLevel = student.grade;

        // Find quizzes that match this grade
        const quizzes = await Quiz.find({ grade: gradeLevel })
            .sort({ dateWritten: -1 })
            .lean();

        res.status(200).json({
            status: "SUCCESS",
            quizzes: quizzes.map(q => ({
                id: q._id,
                title: q.title,
                timeInMinutes: q.timeInMinutes,
                numQuestions: q.questions.length,
                dateWritten: q.dateWritten
            }))
        });
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            message: "An error occurred while fetching quizzes for grade.",
            error: error.message
        });
    }
};

const quizIntro = async (req, res) => {
    try {
        const quizId = req.params.id;
        if (!quizId) {
            return res.status(400).json({
                status: "FAILED",
                message: "Quiz ID not provided."
            });
        }

        const quiz = await Quiz.findById(quizId).lean();
        if (!quiz) {
            return res.status(404).json({
                status: "FAILED",
                message: "Quiz not found."
            });
        }

        res.status(200).json({
            status: "SUCCESS",
            quiz: {
                title: quiz.title,
                numQuestions: quiz.questions.length,
                timeInMinutes: quiz.timeInMinutes,
                dateWritten: quiz.dateWritten
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            message: "An error occurred while fetching quiz intro.",
            error: error.message
        });
    }
};



const quizQuestions = async (req, res) => {
    try {
        const quizId = req.params.id;
        if (!quizId) {
            return res.status(400).json({
                status: "FAILED",
                message: "Quiz ID not provided."
            });
        }

        const quiz = await Quiz.findById(quizId).lean();
        if (!quiz) {
            return res.status(404).json({
                status: "FAILED",
                message: "Quiz not found."
            });
        }

        // Map questions to provide question and possible answers only (not correct answer)
        const questions = (quiz.questions || []).map((q, idx) => ({
            number: idx + 1,
            question: q.question,
            answers: q.answers,
            correctAnd: q.correctAnswer
        }));

        res.status(200).json({
            status: "SUCCESS",
            questions: questions
        });
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            message: "An error occurred while fetching quiz questions.",
            error: error.message
        });
    }
};


const quizResults = async (req, res) => {
    try {
        const quizId = req.params.id;
        if (!quizId) {
            return res.status(400).json({
                status: "FAILED",
                message: "Quiz ID not provided."
            });
        }

        // Get latest quiz info (lean not needed, as we'll update later)
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                status: "FAILED",
                message: "Quiz not found."
            });
        }

        const student = req.user;
        if (!student) {
            return res.status(400).json({
                status: "FAILED",
                message: "Student not found."
            });
        }

        // Save quiz result using embedded quiz subdocument on the student schema
        const { score, completionTime } = req.body;
        let result = req.body.result;

        // Determine pass/fail if not provided
        if (!result) {
            // For demonstration: passing is 50% or above. Can adjust as per business rules.
            const totalQuestions = quiz.questions.length;
            result = (score / totalQuestions) >= 0.5 ? 'PASSED' : 'FAILED';
        }

        // Add or update the quiz entry in the student's quizzes array
        const updatedStudent = await Student.findOneAndUpdate(
            { _id: student._id, "quizzes.quiz": { $ne: quizId } },
            {
                $push: {
                    quizzes: {
                        quiz: quiz._id,
                        dateTaken: new Date(),
                        score,
                        completionTime,
                        result
                    }
                }
            },
            { new: true }
        ).lean();

        // If already exists, update existing quiz result
        let quizResult;
        if (!updatedStudent) {
            quizResult = await Student.findOneAndUpdate(
                { _id: student._id, "quizzes.quiz": quizId },
                {
                    $set: {
                        "quizzes.$.dateTaken": new Date(),
                        "quizzes.$.score": score,
                        "quizzes.$.completionTime": completionTime,
                        "quizzes.$.result": result
                    }
                },
                { new: true }
            ).lean();
        } else {
            quizResult = updatedStudent;
        }

        // Update the Quiz document by adding the student's id to the "students" array if not already present
        // Add with details if desired, or just the studentId
        // Check if already present
        const hasStudent = quiz.students && quiz.students.some(
            s =>
                (typeof s.studentId !== "undefined" && (
                    (typeof s.studentId.equals === "function" && s.studentId.equals(student._id)) ||
                    String(s.studentId) === String(student._id)
                ))
        );
        if (!hasStudent) {
            quiz.students = quiz.students || [];
            quiz.students.push({
                studentId: student._id,
                score: score,
                completionTime: completionTime,
                complete: true,
                dateWritten: new Date()
            });
            await quiz.save();
        }

        res.status(200).json({
            status: "SUCCESS",
            quizResult: quizResult
        });
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            message: "An error occurred while submitting quiz results.",
            error: error.message
        });
    }
};

export {
    getQuizzes,
    quizIntro,
    quizQuestions,
    quizResults
}