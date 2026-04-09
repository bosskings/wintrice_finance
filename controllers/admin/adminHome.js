import Student from '../../models/Student.js';
import School from '../../models/School.js';
import Course from '../../models/Course.js';


async function adminOverview(req, res) {
  try {
    const [totalStudents, totalSchools, totalCourses] = await Promise.all([
      Student.countDocuments(),
      School.countDocuments(),
      Course.countDocuments()
    ]);

    res.json({
        status:"SUCCESS",
        totalStudents,
        totalSchools,
        totalCourses
    });
  } catch (error) {
    res.status(500).json({ status:"FAILED", message: 'Failed to fetch overview data.' });
  }
}

export default adminOverview;
