import School from '../../models/School.js';
import Student from '../../models/Student.js';

// Controller function to get all schools
const getAllSchools = async (req, res) => {
    try {
        const schools = await School.find();
        res.status(200).json({ status: "SUCCESS", data: schools });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};

const createSchool = async (req, res) => {
    try {
        const school = await School.create(req.body);
        res.status(201).json({ status: "SUCCESS", data: school });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};

const updateSchool = async (req, res) => {
    try {
        const school = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!school) {
            return res.status(404).json({ status: "FAILED", message: "School not found." });
        }
        res.status(200).json({ status: "SUCCESS", data: school, details: req.body });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};


const getSchoolById = async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        if (!school) {
            return res.status(404).json({ status: "FAILED", message: "School not found." });
        }

        const students = await Student.find({ school: req.params.id });

        res.status(200).json({
            status: "SUCCESS",
            data: {
                school,
                students
            }
        });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};




export {
    getAllSchools,
    createSchool,
    updateSchool,
    getSchoolById
};