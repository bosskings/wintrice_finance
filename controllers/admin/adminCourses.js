import Course from '../../models/Course.js';

// Controller function to display an overview of courses
const getCoursesOverview = async (req, res) => {
    try {
        const totalCourses = await Course.countDocuments();
        const activeCourses = await Course.countDocuments({ status: 'ACTIVE' });
        const distinctCategories = await Course.distinct('category');
        res.status(200).json({
            status: "SUCCESS",
            data: {
                totalCourses,
                activeCourses,
                distinctCategories
            }
        });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};

const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        if (!courses || courses.length === 0) {
            return res.status(200).json({ status: "SUCCESS", message: "No courses yet", data: [] });
        }
        res.status(200).json({ status: "SUCCESS", data: courses });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};

const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        res.status(200).json({ status: "SUCCESS", data: course });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};

const updateCourseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedCourse = await Course.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedCourse) {
            return res.status(404).json({ status: "FAILED", message: "Course not found." });
        }
        res.status(200).json({ status: "SUCCESS", data: updatedCourse });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};
export { 
    getCoursesOverview,
    getAllCourses,
    getCourseById,
    updateCourseStatus
};