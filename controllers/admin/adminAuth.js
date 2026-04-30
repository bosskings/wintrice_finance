import jwt from 'jsonwebtoken';

export const adminLogin = async (req, res) => {
    const { loginID, password } = req.body;

    const CORRECT_LOGIN_ID = process.env.ADMIN_LOGIN_ID;
    const CORRECT_PASSWORD = process.env.ADMIN_LOGIN_PASS;

    if (loginID !== CORRECT_LOGIN_ID || password !== CORRECT_PASSWORD) {
        return res.status(401).json({
            status: "FAILED",
            message: "Invalid login credentials"
        });
    }

    // Create JWT payload
    const payload = {
        userType: "ADMIN",
        loginID: CORRECT_LOGIN_ID
    };

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES || "1y"
    });

    return res.status(200).json({
        status: "SUCCESS",
        message: "Admin logged in successfully",
        token
    });
};

export default adminLogin;