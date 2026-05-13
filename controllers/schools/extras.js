import Course from '../../models/Course.js';
import Quiz from '../../models/Quiz.js';

// Function to display all courses from the DB
export async function allCourses(req, res) {
    try {
        const allCourses = await Course.find();
        res.status(200).json(allCourses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
}

// Function to display all quizzes from the DB
 async function allQuizes(req, res) {
    try {
        const allQuizes = await Quiz.find();
        res.status(200).json(allQuizes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch quizes' });
    }
}