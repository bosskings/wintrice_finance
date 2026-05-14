import Quiz from '../../models/Quiz.js';
import Student from '../../models/Student.js';
import sendEmail from '../../utils/sendEmail.js'; 

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
            correctAns: q.correctAnswer
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

        // --- Send email with results using shared sendEmail utility ---

        try {
            const studentName = student.name || student.firstName || 'Student';
            const quizTitle = quiz.title || 'the quiz';

            // Format completionTime, assuming it's in seconds
            function formatTime(sec) {
                if (!sec && sec !== 0) return '-';
                const mins = Math.floor(sec / 60);
                const secs = sec % 60;
                return `${mins}m ${secs}s`;
            }

            // Compose the email HTML, consistent style with schoolsStudents.js
            const emailHtml = `
                <div style="background-color: #1E90FF; color: #fff; padding: 24px; font-family: Arial, sans-serif; border-radius: 8px;">
                    <div style="background-color: #fff; color: #1E90FF; padding: 24px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(30,144,255,0.12);">
                        <h1 style="color: #1E90FF; margin-bottom: 16px;">Quiz Result</h1>
                        <p style="font-size: 18px; color: #1E90FF;">
                            Dear <strong>${studentName}</strong>,<br/>
                            Thank you for completing <span style="color:#16a085">${quizTitle}</span>.
                        </p>
                        <div style="font-size: 16px; color: #1E90FF;">
                            <strong>Score:</strong> ${score} / ${quiz.questions.length} <br/>
                            <strong>Time Completed:</strong> ${formatTime(completionTime)} <br/>
                            <strong>Result:</strong>
                            <span style="font-weight:bold; color: ${result === 'PASSED' ? '#27ae60' : '#e74c3c'};">
                                ${result}
                            </span><br/>
                        </div>
                        <p style="margin: 24px 0 0 0; color: #1E90FF;">
                            ${result === 'PASSED'
                                ? 'Congratulations on passing your quiz! Keep up the great work.'
                                : 'You did not pass this time. Don’t give up—keep practicing!'}
                        </p>
                    </div>
                </div>
            `;

            const emailSubject = `Your Result for ${quizTitle}`;
            if (student.email) {
                await sendEmail(student.email, emailSubject, emailHtml);
            }
        } catch (mailError) {
            // Do not block response on mail failure, but log it
            console.error('Email sending failed:', mailError);
        }
        // --- END email results ---

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