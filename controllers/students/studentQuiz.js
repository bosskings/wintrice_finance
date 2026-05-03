import Quiz from '../../models/Quiz.js';

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
            answers: q.answers
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


export {
    quizIntro,
    quizQuestions
}