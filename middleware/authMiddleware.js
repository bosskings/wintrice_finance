import jwt from 'jsonwebtoken';
import User from "../models/User.js";


const requireAuth = async (req, res, next) => {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status:"SUCCESS", 
            message: 'Authorization token required' 
        });
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId);
        next();

    } catch (err) {
        return res.status(401).json({ 
            status:"FAILED", 
            message: 'Invalid/Expired token' 
        });
    }
};

export { requireAuth };