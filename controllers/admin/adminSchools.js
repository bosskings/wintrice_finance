import School from '../../models/School.js';
import Student from '../../models/Student.js';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from 'sharp';


/**
 * Get student overview: total students, active students, and % growth in the last month
 */
const getStudentOverview = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();

        const activeStudents = await Student.countDocuments({ status: "ACTIVE" });

        // Dates for monthly growth calculation
        const now = new Date();
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);

        // Students registered in the last month
        const newStudentsLastMonth = await Student.countDocuments({
            createdAt: { $gte: oneMonthAgo, $lte: now }
        });

        // Students registered in the month before last
        const twoMonthsAgo = new Date(now);
        twoMonthsAgo.setMonth(now.getMonth() - 2);

        const newStudentsPrevMonth = await Student.countDocuments({
            createdAt: { $gte: twoMonthsAgo, $lt: oneMonthAgo }
        });

        // Calculate growth percentage
        let percentGrowth = 0;
        if (newStudentsPrevMonth === 0 && newStudentsLastMonth > 0) {
            percentGrowth = 100;
        } else if (newStudentsPrevMonth > 0) {
            percentGrowth = ((newStudentsLastMonth - newStudentsPrevMonth) / newStudentsPrevMonth) * 100;
            percentGrowth = Math.round(percentGrowth * 100) / 100;
        }

        res.status(200).json({
            status: "SUCCESS",
            data: {
                totalStudents,
                activeStudents,
                percentGrowthLastMonth: percentGrowth
            }
        });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};


// Controller function to get all schools
const getAllSchools = async (req, res) => {
    try {
        const schools = await School.find();
        // Return each school as an individual object in an array of objects
        const result = schools.map(school => ({ school }));
        res.status(200).json({ status: "SUCCESS", data: result });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};


const createSchool = async (req, res) => {
    try {
        // Fix credential error: use 'AWS' keys for the credentials object
        const s3 = new S3Client({
            region: "auto",
            endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY,
                secretAccessKey: process.env.R2_SECRET_KEY,
            },
        });
        
        // Verify file input
        if (!req.files || !req.files.image || !req.files.image[0]) {
            return res.status(400).json({ status: "FAILED", message: "No image file uploaded." });
        }
        const imageFile = req.files.image[0];
        if (!imageFile.buffer) {
            return res.status(400).json({ status: "FAILED", message: "Invalid image file: no buffer." });
        }
        // Convert image to webp
        const webpBuffer = await sharp(imageFile.buffer).webp().toBuffer();

        const key = `${Date.now()}.webp`;
        const command = new PutObjectCommand({
            Bucket: "wintrice-images",
            Key: key,
            Body: webpBuffer,
            ContentType: "image/webp",
            ACL: 'public-read'
        });

        await s3.send(command);

        const imageUrl = `https://wintrice.com/${key}`;

        // Generate random 6 digit int for accessId with prefix WIN-SCH
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        const accessId = `WIN-SCH${randomNum}`;

        const newSchoolData = {
            ...req.body,
            schoolLogo: imageUrl,
            accessId: accessId
        };
        const school = await School.create(newSchoolData);
        res.status(201).json({ status: "SUCCESS", data: school });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
        console.error(error.message);
    }
};

const updateSchool = async (req, res) => {
    try {
        let updatedData = { ...req.body };
        let imageUrl;

        // If there is an image file (via multer or similar middleware)
        if (req.files && req.files.image && req.files.image[0] && req.files.image[0].buffer) {
            
            // S3 (R2) client setup (just like createSchool)
            const s3 = new S3Client({
                region: "auto",
                endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: process.env.R2_ACCESS_KEY,
                    secretAccessKey: process.env.R2_SECRET_KEY,
                },
            });

            const imageFile = req.files.image[0];
            // Convert image to webp format before uploading
            const webpBuffer = await sharp(imageFile.buffer).webp().toBuffer();

            const key = `${Date.now()}.webp`;
            const command = new PutObjectCommand({
                Bucket: "wintrice-images",
                Key: key,
                Body: webpBuffer,
                ContentType: "image/webp",
                ACL: "public-read"
            });

            await s3.send(command);

            imageUrl = `https://wintrice.com/${key}`;
            updatedData.schoolLogo = imageUrl;
        }

        // Update the school with ALL provided fields, possibly including the new `schoolLogo`
        const school = await School.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        if (!school) {
            return res.status(404).json({ status: "FAILED", message: "School not found." });
        }

        res.status(200).json({ status: "SUCCESS", data: school });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
        console.error(error.message);
    }
};


const getSchoolById = async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        if (!school) {
            return res.status(404).json({ status: "FAILED", message: "School not found." });
        }

        // Get total students and number of active students under this school
        const totalStudents = await Student.countDocuments({ school: req.params.id });
        const activeStudents = await Student.countDocuments({ school: req.params.id, status: 'ACTIVE' });

        // Count total courses available under this school
        const totalCourses = school.settings?.courses ? school.settings.courses.length : 0;

        res.status(200).json({
            status: "SUCCESS",
            data: {
                school,
                totalStudents,
                activeStudents,
                totalCourses
            }
        });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};




export {
    getStudentOverview,
    getAllSchools,
    createSchool,
    updateSchool,
    getSchoolById
};