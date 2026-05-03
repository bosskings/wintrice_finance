import Student from '../../models/Student.js';
import Course from '../../models/Course.js';

const coursesOverview = async (req, res) => {
    try {
        // Extract student ID from request (handles different possible field names)
        const studentId = req.studentId;
        if (!studentId) {
            return res.status(400).json({ status: "FAILED", message: "Student id not found in request." });
        }

        // Populate the student's courses as an array of {course, status}
        const student = await Student.findById(studentId)
            .populate('courses.course')
            .lean();

        if (!student) {
            return res.status(404).json({ status: "FAILED", message: "Student not found." });
        }

        const totalCourses = student.courses ? student.courses.length : 0;
        const completedCoursesArr = (student.courses || []).filter(c => c.status === "COMPLETE");
        const completedCourses = completedCoursesArr.length;

        // Calculate percentage of courses completed
        const percentCompleted = totalCourses > 0 ? ((completedCourses / totalCourses) * 100).toFixed(2) : "0.00";

        // Find ongoing course(s)
        const ongoingCourses = (student.courses || []).filter(c => c.status === "ONGOING" && c.course);

        // Format ongoing courses as summary objects
        const ongoingCourseSummaries = ongoingCourses.map(c => ({
            id: c.course._id,
            name: c.course.name,
            gradeLevel: c.course.gradeLevel,
            status: c.status
        }));

        // Recommend 3 courses from the student's grade not already taken
        const takenCourseIds = new Set((student.courses || []).map(c => c.course && c.course._id.toString()));
        const gradeLevel = student.grade;
        const recommendedCourses = await Course.find({
            gradeLevel: gradeLevel,
            _id: { $nin: Array.from(takenCourseIds) },
            status: "ACTIVE"
        })
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();

        res.status(200).json({
            status: "SUCCESS",
            percentCompleted: percentCompleted,
            numCoursesCompleted: completedCourses,
            ongoingCourses: ongoingCourseSummaries,
            recommendedCourses: recommendedCourses.map(c => ({
                id: c._id,
                name: c.name,
                gradeLevel: c.gradeLevel,
                category: c.category
            }))
        });
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            message: "An error occurred while fetching courses overview.",
            error: error.message
        });
    }
};



const viewCourse = async (req, res) => {
    try {
        const courseId = req.params.id;

        if (!courseId) {
            return res.status(400).json({
                status: "FAILED",
                message: "Course ID not provided."
            });
        }

        // Find course details and populate files
        const course = await Course.findById(courseId).lean();

        if (!course) {
            return res.status(404).json({
                status: "FAILED",
                message: "Course not found."
            });
        }

        res.status(200).json({
            status: "SUCCESS",
            course: {
                id: course._id,
                name: course.name,
                courseCode: course.courseCode,
                gradeLevel: course.gradeLevel,
                duration: course.duration,
                coverImage: course.coverImage,
                files: course.files,
                category: course.category,
                description: course.description,
                status: course.status,
                createdAt: course.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            message: "An error occurred while fetching course details.",
            error: error.message
        });
    }
}

export {
    coursesOverview,
    viewCourse
};