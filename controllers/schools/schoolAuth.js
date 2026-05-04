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

        // Send a visually-appealing authentication code email like adminSchools.js
        const emailHtml = `
            <div style="background-color: #1E90FF; color: #fff; padding: 24px; font-family: Arial, sans-serif; border-radius: 8px;">
                <div style="background-color: #fff; color: #1E90FF; padding: 24px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(30,144,255,0.12);">
                    <h1 style="color: #1E90FF; margin-bottom: 16px;">Wintrice Authentication Code</h1>
                    <p style="font-size: 18px; color: #1E90FF;">
                        Please use the following authentication code to proceed with your login.
                    </p>
                    <p style="margin: 24px 0 8px 0; color: #1E90FF;">
                        <strong>Your Authentication Code:</strong>
                    </p>
                    <div style="font-size: 26px; font-weight: bold; letter-spacing: 2px; background: #1E90FF; color: #fff; padding: 16px 32px; border-radius: 8px; display: inline-block;">
                        ${authCode}
                    </div>
                    <p style="margin: 24px 0 0 0; color: #1E90FF;">
                        This code expires soon. Do not share it with anyone.
                    </p>
                </div>
            </div>
        `;
        try {
            await sendEmail(
                school.email,
                "Wintrice Authentication Code",
                emailHtml
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