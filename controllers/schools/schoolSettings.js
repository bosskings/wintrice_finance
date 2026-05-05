import nodemailer from 'nodemailer';
import School from '../../models/School.js';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";



const updateSchoolProfile = async (req, res) => {
    try {
        // Get schoolId from req (e.g., set in middleware/authentication)
        const schoolId = req.schoolId;
        // Everything else from req.body
        const updateFields = { ...req.body };

        if (!schoolId) {
            return res.status(400).json({ error: 'schoolId is required.' });
        }

        // Prevent users from attempting to update email or password via this endpoint
        if ('email' in updateFields || 'password' in updateFields) {
            return res.status(400).json({ 
                status:"FAILED", 
                message: 'Updating email or password is not allowed via this endpoint.' 
            });
        }

        // Only allow updating certain top-level and nested fields for security
        const allowedFields = ['name', 'address', 'schoolLogo', 'colorTheme', 'settings'];
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
const sendAndUpdateAuthCode = async (schoolId) => {
    // Generate the 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Find the school's email
    const school = await School.findById(schoolId).lean();
    if (!school || !school.email) {
        throw new Error('School not found or missing email.');
    }

    // Send email with code
    const transporter = nodemailer.createTransport({
        // Configure your transporter accordingly
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: school.email,
        subject: 'Your School Authentication Code',
        text: `Your authentication code is: ${code}`
    };

    await transporter.sendMail(mailOptions);

    // Update the school authCode in DB
    await School.findByIdAndUpdate(schoolId, { $set: { authCode: code } });

    return code;
};



const updateSchoolEmail = async (req, res) => {
    try {
        const schoolId = req.schoolId;
        const { newEmail, authCode } = req.body;

        // Validate input
        if (!newEmail || !authCode) {
            return res.status(400).json({ error: "Missing required fields: newEmail and authCode are required." });
        }

        // Get the current school from DB
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ error: "School not found." });
        }

        // Check if an auth code has been sent and is pending verification
        if (school.authCode === "000000") {
            return res.status(400).json({ error: "No verification has been initiated for email update (auth code not set)." });
        }

        // Check the provided auth code matches the one stored
        if (school.authCode !== authCode) {
            return res.status(401).json({ error: "Invalid authentication code." });
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
        const schoolId = req.schoolId;
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
    updateSchoolEmail,
    updateSchoolPassword
}