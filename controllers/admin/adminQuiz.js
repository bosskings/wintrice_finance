import Quiz from '../../models/Quiz.js';
import Course from '../../models/Course.js';


// Controller function to create a new quiz
const createQuiz = async (req, res) => {
    try {
        const { title, timeInMinutes, questions, grade, course } = req.body;

        // Validate input
        if (!title || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ status: "FAILED", message: "Title and questions are required." });
        }

        // Validate questions schema as in Quiz.js (questions: [{ question, answers, correctAnswer }])
        for (const [index, q] of questions.entries()) {
            if (
                !q.question ||
                !q.answers ||
                typeof q.answers.a !== 'string' ||
                typeof q.answers.b !== 'string' ||
                typeof q.answers.c !== 'string' ||
                typeof q.answers.d !== 'string' ||
                !['a', 'b', 'c', 'd'].includes(q.correctAnswer)
            ) {
                return res.status(400).json({
                    status: "FAILED",
                    message: `Invalid question format at index ${index}. Each question must have 'question', 'answers' (with a, b, c, d), and 'correctAnswer' (one of a, b, c, d).`
                });
            }
        }

        // First, create the quiz
        const newQuiz = new Quiz({
            title,
            timeInMinutes,
            questions,
            grade,
            course
        });

        const savedQuiz = await newQuiz.save();

        // Now, update the Course document to push this quiz's _id to its quizzes array
        if (course) {
            await Course.findByIdAndUpdate(
                course,
                { $push: { quizzes: savedQuiz._id } },
                { new: true }
            );
        }

        res.status(201).json({
            status: "SUCCESS",
            message: "Quiz created successfully.",
            data: savedQuiz
        });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};

// Get all quizzes
const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        res.status(200).json({
            status: "SUCCESS",
            message: "Quizzes fetched successfully.",
            data: quizzes
        });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};

// Get quiz by ID
const getQuizById = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ status: "FAILED", message: "Quiz not found." });
        }
        res.status(200).json({
            status: "SUCCESS",
            message: "Quiz fetched successfully.",
            data: quiz
        });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};

// Update quiz by ID
const updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, timeInMinutes, questions, grade } = req.body;

        // Validate input
        if (title !== undefined && (typeof title !== "string" || !title.trim())) {
            return res.status(400).json({ status: "FAILED", message: "Title must be a non-empty string." });
        }
        if (questions && (!Array.isArray(questions) || questions.length === 0)) {
            return res.status(400).json({ status: "FAILED", message: "Questions must be a non-empty array." });
        }

        if (Array.isArray(questions)) {
            for (const [index, q] of questions.entries()) {
                if (
                    !q.question ||
                    !q.answers ||
                    typeof q.answers.a !== 'string' ||
                    typeof q.answers.b !== 'string' ||
                    typeof q.answers.c !== 'string' ||
                    typeof q.answers.d !== 'string' ||
                    !['a', 'b', 'c', 'd'].includes(q.correctAnswer)
                ) {
                    return res.status(400).json({
                        status: "FAILED",
                        message: `Invalid question format at index ${index}. Each question must have 'question', 'answers' (with a, b, c, d), and 'correctAnswer' (one of a, b, c, d).`
                    });
                }
            }
        }

        const updateFields = {};
        if (title !== undefined) updateFields.title = title;
        if (timeInMinutes !== undefined) updateFields.timeInMinutes = timeInMinutes;
        if (questions !== undefined) updateFields.questions = questions;
        if (grade !== undefined) updateFields.grade = grade;

        const updatedQuiz = await Quiz.findByIdAndUpdate(id, updateFields, { new: true });

        if (!updatedQuiz) {
            return res.status(404).json({ status: "FAILED", message: "Quiz not found." });
        }

        res.status(200).json({
            status: "SUCCESS",
            message: "Quiz updated successfully.",
            data: updatedQuiz
        });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};

// Delete quiz by ID
const deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedQuiz = await Quiz.findByIdAndDelete(id);
        if (!deletedQuiz) {
            return res.status(404).json({ status: "FAILED", message: "Quiz not found." });
        }
        res.status(200).json({
            status: "SUCCESS",
            message: "Quiz deleted successfully."
        });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};

export { createQuiz, getAllQuizzes, getQuizById, updateQuiz, deleteQuiz };