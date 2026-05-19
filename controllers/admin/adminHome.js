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


/**
 * Returns dashboard statistics for admin as a JSON object
 * Format:
 * {
 *   status: "SUCCESS",
 *   data: {
 *      students: { total: Number, active: Number, inactive: Number },
 *      schools: { total: Number, withActiveStudents: Number },
 *      courses: { total: Number, published: Number, draft: Number }
 *   }
 * }
 */
async function adminDashboardStats(req, res) {
  try {
    // Get students counts
    const [totalStudents, activeStudents, inactiveStudents] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'ACTIVE' }),
      Student.countDocuments({ status: 'INACTIVE' })
    ]);

    // Get schools counts
    const totalSchools = await School.countDocuments();
    // Schools with at least 1 ACTIVE student - improved definition: school with at least 1 student with status ACTIVE
    const schoolsWithActive = await School.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "school",
          as: "schoolStudents"
        }
      },
      {
        $addFields: {
          hasActive: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$schoolStudents",
                    as: "stu",
                    cond: { $eq: ["$$stu.status", "ACTIVE"] }
                  }
                }
              }, 0
            ]
          }
        }
      },
      { $match: { hasActive: true } },
      { $count: "count" }
    ]).then(arr => (arr[0]?.count || 0));
    
    // Courses counts
    const [totalCourses, publishedCourses, draftCourses] = await Promise.all([
      Course.countDocuments(),
      Course.countDocuments({ status: 'PUBLISHED' }),
      Course.countDocuments({ status: 'DRAFT' })
    ]);

    res.status(200).json({
      status: "SUCCESS",
      data: {
        students: {
          total: totalStudents,
          active: activeStudents,
          inactive: inactiveStudents
        },
        schools: {
          total: totalSchools,
          withActiveStudents: schoolsWithActive
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          draft: draftCourses
        }
      }
    });
  } catch (error) {
    res.status(500).json({ status: "FAILED", message: error.message });
  }
}




export { 
  adminOverview,
  adminDashboardStats
};
