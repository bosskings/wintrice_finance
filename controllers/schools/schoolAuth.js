import jwt from "jsonwebtoken";
import Schools from "../../models/School.js";
import sendEmail from "../../utils/sendEmail.js";


const verifySchool = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ 
                status: "FAILED", 
                message: "Email is required." 
            });
        }
        // Find the school using accessId
        const school = await Schools.findOne({ email });
        if (!school) {
            return res.status(404).json({ status: "FAILED", message: "School not found." });
        }

        // Generate random 6 digit code
        const authCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Send email with the code
        try {
            await sendEmail(
                school.email,
                "Wintrice Authentication",
                `Your authentication code is: <b>${authCode}</b>`
            );
        } catch (emailError) {
            return res.status(500).json({ status: "FAILED", message: "Failed to send authentication email." });
        }

        // Save authCode to the school record
        school.authCode = authCode;
        await school.save();

        return res.status(200).json({ status: "SUCCESS", message: "Authentication code sent to school email." });
    } catch (error) {
        console.error("School login error:", error);
        return res.status(500).json({ status: "FAILED", message: "Internal server error." });
    }
};


const login = async(req, res) => {

    try {
        const { accessId, authCode } = req.body;
        if (!accessId || !authCode) {
            return res.status(400).json({ 
                status: "FAILED", 
                message: "Access ID and Auth Code are required." 
            });
        }

        // Find school with matching accessId and authCode
        const school = await Schools.findOne({ accessId, authCode });
        if (!school) {
            return res.status(401).json({ 
                status: "FAILED", 
                message: "Invalid Access ID or Auth Code." 
            });
        }

        // After authentication, update authCode field to "000000"
        school.authCode = "000000";
        await school.save();

        // Generate JWT token for school
        const token = jwt.sign(
            {
                schoolId: school._id,
                accessId: school.accessId,
                email: school.email,
                type: "SCHOOL"
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            status: "SUCCESS",
            message: "School logged in successfully.",
            token,
            school: {
                id: school._id,
                name: school.name,
                email: school.email,
                accessId: school.accessId,
                status: school.status
            }
        });
    } catch (error) {
        console.error("School login error:", error);
        return res.status(500).json({ status: "FAILED", message: "Internal server error." });
    }
}


export {
    verifySchool,
    login
}