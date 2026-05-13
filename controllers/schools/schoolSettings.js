import sendEmail from '../../utils/sendEmail.js';
import School from '../../models/School.js';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";


// Function to return all details of the logged-in school
const getSchoolDetails = async (req, res) => {
    try {
        // School ID from req.user, based on auth middleware
        const schoolId = req.user && (req.user._id || req.user.id);
        if (!schoolId) {
            return res.status(401).json({
                status: "FAILED",
                message: "School ID not found in request user context."
            });
        }

        // Fetch the school from DB
        const school = await School.findById(schoolId).lean();
        if (!school) {
            return res.status(404).json({
                status: "FAILED",
                message: "School not found."
            });
        }

        // Optionally exclude sensitive fields (like password, authCode)
        const { password, authCode, ...schoolData } = school;

        return res.status(200).json({
            status: "SUCCESS",
            school: schoolData
        });
    } catch (error) {
        return res.status(500).json({
            status: "FAILED",
            message: "Failed to fetch school details.",
            details: error.message
        });
    }
};



const updateSchoolProfile = async (req, res) => {
    try {
        // Get schoolId from req.user, according to authMiddleware
        const schoolId = req.user && (req.user._id || req.user.id);
        if (!schoolId) {
            return res.status(401).json({
                status: "FAILED",
                message: "School ID not found in request user context."
            });
        }
        // Everything else from req.body
        const updateFields = { ...req.body };
    
        // Prevent users from attempting to update email or password via this endpoint
        if ('email' in updateFields || 'password' in updateFields) {
            return res.status(400).json({ 
                status:"FAILED", 
                message: 'Updating email or password is not allowed via this endpoint.' 
            });
        }

        // Only allow updating certain top-level and nested fields for security
        const allowedFields = ['name', 'address', 'schoolLogo', 'colorTheme', 'settings', 'description', 'phone'];
        const updates = {};

        allowedFields.forEach(field => {
            if (updateFields[field] !== undefined) {
                updates[field] = updateFields[field];
            }
        });

        // Handle image upload if present in req.file (using multer, upload.single('image'))
        if (req.file && req.file.buffer) {
            // Convert image to webp
            const webpBuffer = await sharp(req.file.buffer).webp().toBuffer();
            // Prepare S3 (Cloudflare R2) client
            const s3 = new S3Client({
                region: "auto",
                endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: process.env.R2_ACCESS_KEY,
                    secretAccessKey: process.env.R2_SECRET_KEY,
                },
            });

            const imageKey = `wintrice-images/school-logos/${Date.now()}-${Math.round(Math.random()*10000)}.webp`;
            const putCommand = new PutObjectCommand({
                Bucket: "wintrice-images",
                Key: imageKey,
                Body: webpBuffer,
                ContentType: "image/webp",
                ACL: "public-read"
            });
            await s3.send(putCommand);
            // Set schoolLogo to url
            updates.schoolLogo = `https://wintrice.com/${imageKey}`;
        }

        const updatedSchool = await School.findByIdAndUpdate(
            schoolId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedSchool) {
            return res.status(404).json({ error: 'School not found.' });
        }

        res.status(200).json({ message: 'School profile updated successfully.', school: updatedSchool });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update school profile.', details: error.message });
    }
};



// Helper function to generate a random 6-digit code as a string with leading zeros if necessary
const sendAndUpdateAuthCode = async (req, res) => {
    // Get schoolId from req.user, per auth middleware
    const schoolId = req.user && (req.user._id || req.user.id);
    if (!schoolId) {
        return res.status(401).json({
            status: "FAILED",
            message: "School ID not found in request user context."
        });
    }
    // Generate the 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Find the school's email
    const school = await School.findById(schoolId).lean();
    if (!school || !school.email) {
        return res.status(404).json({
            status: "FAILED",
            message: "School not found or missing email."
        });
    }

    // Send email with code using standard sendEmail utility
    const emailSubject = 'Your School Authentication Code';
    const emailHtml = `
        <div style="background-color:#f6faff;padding:24px;font-family:Arial,sans-serif;border-radius:8px;">
            <div style="background:#fff;padding:24px;border-radius:8px;box-shadow:0 2px 8px rgba(30,144,255,0.12);text-align:center;">
                <h2 style="color:#1E90FF;">Authentication Code</h2>
                <p style="font-size:18px;color:#222;">Your Wintrice authentication code is:</p>
                <div style="font-size:36px;margin:24px 0;color:#1E90FF;font-weight:bold;letter-spacing:8px;">${code}</div>
                <p style="color:#444;">Enter this code to verify your email update request.<br/>If you did not make this request, please ignore this email.</p>
            </div>
        </div>
    `;
    await sendEmail(school.email, emailSubject, emailHtml);

    // Update the school authCode in DB
    await School.findByIdAndUpdate(schoolId, { $set: { authCode: code } });

    return res.status(200).json({
        status: "SUCCESS",
        message: "Authentication code sent to school email.",
        code: code
    });
};



const updateSchoolEmail = async (req, res) => {
    try {
        // Get schoolId from req.user, per auth middleware
        const schoolId = req.user && (req.user._id || req.user.id);
        if (!schoolId) {
            return res.status(401).json({
                status: "FAILED",
                message: "School ID not found in request user context."
            });
        }
        const { newEmail, authCode } = req.body;

        // Validate input
        if (!newEmail || !authCode) {
            return res.status(400).json({ status: "FAILED", message: "Missing required fields: newEmail and authCode are required." });
        }

        // Get the current school from DB
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ status: "FAILED", message: "School not found." });
        }

        // Check if an auth code has been sent and is pending verification
        if (school.authCode === "000000") {
            return res.status(400).json({ status: "FAILED", message: "No verification has been initiated for email update (auth code not set)." });
        }

        // Check the provided auth code matches the one stored
        if (school.authCode !== authCode) {
            return res.status(401).json({ status: "FAILED", message: "Invalid authentication code." });
        }

        // Update email only
        school.email = newEmail;
        school.authCode = "000000";

        await school.save();

        return res.status(200).json({ message: "Email updated successfully.", email: newEmail });
    } catch (error) {
        return res.status(500).json({ error: "Failed to update email.", details: error.message });
    }
};



const updateSchoolPassword = async (req, res) => {
    try {
        // Get schoolId from req.user, per auth middleware
        const schoolId = req.user && (req.user._id || req.user.id);
        if (!schoolId) {
            return res.status(401).json({
                error: "School ID not found in request user context."
            });
        }
        const { newPassword, authCode } = req.body;

        // Validate input
        if (!newPassword || !authCode) {
            return res.status(400).json({ error: "Missing required fields: newPassword and authCode are required." });
        }

        // Get the current school from DB
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ error: "School not found." });
        }

        // Check if an auth code has been sent and is pending verification
        if (school.authCode === "000000") {
            return res.status(400).json({ error: "No verification has been initiated for password update (auth code not set)." });
        }

        // Check the provided auth code matches the one stored
        if (school.authCode !== authCode) {
            return res.status(401).json({ error: "Invalid authentication code." });
        }

        // Update the password (hash if required!)
        school.password = newPassword; // Remember to hash before saving in production
        school.authCode = "000000";

        await school.save();

        return res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        return res.status(500).json({ error: "Failed to update password.", details: error.message });
    }
};




export {
    updateSchoolProfile,
    sendAndUpdateAuthCode,
    updateSchoolEmail,
    getSchoolDetails,
    updateSchoolPassword
}