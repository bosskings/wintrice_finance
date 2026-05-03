import Quiz from '../../models/Quiz.js';

// Controller function to create a new quiz
const createQuiz = async (req, res) => {
    try {
        const { title, questions } = req.body;

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

        const newQuiz = new Quiz({
            title,
            questions
        });

        const savedQuiz = await newQuiz.save();

        res.status(201).json({
            status: "SUCCESS",
            message: "Quiz created successfully.",
            data: savedQuiz
        });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};

export { createQuiz };