import Student from '../../models/Student.js';
import Course from '../../models/Course.js';

const studentsOverview = async (req, res) => {
    try {
        const studentId = req.studentId || req.id || req.userId || (req.user && req.user._id) || (req.student && req.student._id);
        if (!studentId) {
            return res.status(400).json({ status: "FAILED", message: "Student id not found in request." });
        }

        // 1. Get student info and populate courses
        const student = await Student.findById(studentId).populate('courses').lean();
        if (!student) {
            return res.status(404).json({ status: "FAILED", message: "Student not found." });
        }

        const courseCount = student.courses ? student.courses.length : 0;

        // 2. Get 2 other courses of same grade level (excluding the ones the user has already taken)
        let grade = student.grade;
        let takenCourseIds = student.courses ? student.courses.map(c => c._id) : [];

        // Find 2 courses from the same grade the student hasn't taken
        const sameGradeCourses = await Course.find({
            gradeLevel: grade,
            _id: { $nin: takenCourseIds }
        })
        .sort({ createdAt: -1 })
        .limit(2)
        .lean();

        // 3. Calculate 'rate at which the student is taking courses with respect to time'
        // We'll count courses by month in which they were "taken" (added to 'courses' array)
        // Here, let's assume student.updatedAt increases as they add courses, but actually we lack timestamps for each enrolment. 
        // If Course completion/enrolment timestamps existed, we'd use those.
        // As an approximation, gather the dates when current courses were created.
        const coursesWithDates = (student.courses || []).map(course => ({
            courseId: course._id,
            courseName: course.name,
            enrolledAt: course.createdAt // using course creation date as a proxy
        }));

        // Aggregate by month, e.g.: {'2024-02': 3, ...}
        const monthlyRate = {};
        for (const entry of coursesWithDates) {
            if (!entry.enrolledAt) continue;
            const dt = new Date(entry.enrolledAt);
            const label = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
            monthlyRate[label] = (monthlyRate[label] || 0) + 1;
        }
        // Make sorted array for charting
        const rateOverTime = Object.entries(monthlyRate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => ({ month, count }));

        res.status(200).json({
            status: "SUCCESS",
            numCoursesDone: courseCount,
            exampleSameGradeCourses: sameGradeCourses,
            courseRateOverTime: rateOverTime // [{month, count}, ...]
        });
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            message: "An error occurred while fetching student overview.",
            error: error.message
        });
    }
};

export default studentsOverview;