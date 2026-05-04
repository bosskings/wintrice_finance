import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
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



const createCourse = async (req, res) => {
    try {
        const {
            title,
            category,
            courseCode,
            duration,
            gradeLevel,
            description
        } = req.body;

        // Validate required fields
        if (!title || !category || !courseCode || !duration || !gradeLevel || !description) {
            return res.status(400).json({ status: "FAILED", message: "Please provide all required fields." });
        }

        // Ensure upload file(s) presence (pdf/word/txt and cover image)
        if (
            !req.files ||
            (!req.files.file && !req.files.coverImage) // At least one of each must be present, check for both below
        ) {
            return res.status(400).json({ status: "FAILED", message: "Please upload both a course file and a cover image." });
        }

        // Prepare S3 (Cloudflare R2) client
        const s3 = new S3Client({
            region: "auto",
            endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY,
                secretAccessKey: process.env.R2_SECRET_KEY,
            },
        });

        // --- 1. Handle cover image ---
        let coverImageUrl = "";
        const coverImageFile = req.files.coverImage && req.files.coverImage[0];

        if (!coverImageFile || !coverImageFile.buffer) {
            return res.status(400).json({ status: "FAILED", message: "Cover image is required and must be a valid file." });
        }

        // Convert cover image to webp
        const webpCoverBuffer = await sharp(coverImageFile.buffer).webp().toBuffer();
        const coverImageKey = `wintrice-images/coursefiles/${Date.now()}-${Math.round(Math.random()*10000)}.webp`;
        const coverPutCommand = new PutObjectCommand({
            Bucket: "wintrice-images",
            Key: coverImageKey,
            Body: webpCoverBuffer,
            ContentType: "image/webp",
            ACL: "public-read"
        });
        await s3.send(coverPutCommand);
        coverImageUrl = `https://wintrice.com/${coverImageKey}`;

        // --- 2. Handle course file (pdf/word/txt) ---
        let fileData = null;
        const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
        const fileFile = req.files.file && req.files.file[0];

        if (!fileFile || !fileFile.buffer || !allowedTypes.includes(fileFile.mimetype)) {
            return res.status(400).json({ status: "FAILED", message: "Course file is required and must be PDF, Word, or TXT format." });
        }

        const extensionMap = {
            "application/pdf": "pdf",
            "application/msword": "doc",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
            "text/plain": "txt"
        };
        const fileExt = extensionMap[fileFile.mimetype] || "file";
        const fileUid = `${Date.now()}-${Math.round(Math.random()*10000)}-${fileExt}`;
        const fileKey = `wintrice-images/coursefiles/{fileUid}.${fileExt}`;

        const filePutCommand = new PutObjectCommand({
            Bucket: "wintrice-images",
            Key: fileKey,
            Body: fileFile.buffer,
            ContentType: fileFile.mimetype,
            ACL: "public-read"
        });
        await s3.send(filePutCommand);
        const fileUrl = `https://wintrice.com/${fileKey}`;

        // Compose the file object for the course
        fileData = {
            type: fileExt === "pdf" ? "pdf" : fileExt === "txt" ? "text" : "word",
            fileURL: fileUrl,
            fileUid
        };

        // --- 3. Create course in DB ---
        const newCourse = await Course.create({
            title,
            category,
            courseCode,
            duration,
            gradeLevel,
            description,
            coverImage: coverImageUrl,
            files: [fileData]
        });

        res.status(201).json({ status: "SUCCESS", data: newCourse });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};


// function to upload course files to cloudflare.

export { 
    getCoursesOverview,
    getAllCourses,
    getCourseById,
    updateCourseStatus,
    createCourse
};