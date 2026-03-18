import User from '../../models/User.js';
import jwt from 'jsonwebtoken';

// User Registration
const signUp = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        // Basic validation
        if (!fullname || !email || !password) {
            return res.status(400).json({ success: false, message: "Full name, email, and password are required." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "User with this email already exists." });
        }

        // Create user (Note: password should be hashed in real implementation)
        const user = new User({ fullname, email, password });
        await user.save();

        // JWT Generation
        const token = jwt.sign(
            { userId: user._id, email: user.email, fullname: user.fullname },
            process.env.JWT_SECRET || "wintriceSecretKey",
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            token,
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email
            }
        });

    } catch (error) {
        console.error('User registration error:', error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

// User Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        // Password check (This should be hashed and compared, for now, basic match)
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        // JWT Generation
        const token = jwt.sign(
            { userId: user._id, email: user.email, fullname: user.fullname },
            process.env.JWT_SECRET || "wintriceSecretKey",
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            message: "User logged in successfully.",
            token,
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email
            }
        });

    } catch (error) {
        console.error('User login error:', error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

export { signUp, login };