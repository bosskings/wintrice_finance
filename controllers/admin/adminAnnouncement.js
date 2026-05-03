import Announcement from '../../models/Announcement.js';

// Controller function to create a new announcement
const createAnnouncement = async (req, res) => {
    try {
        const { title, content, target } = req.body;

        // Validate required fields
        if (!title || !content || !target) {
            return res.status(400).json({ status: "FAILED", message: "Title, content, and target are required." });
        }

        // Create new Announcement
        const newAnnouncement = new Announcement({
            title,
            content,
            target,
        });

        const savedAnnouncement = await newAnnouncement.save();

        res.status(201).json({ status: "SUCCESS", message: "Announcement created successfully.", data: savedAnnouncement });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};

// Controller function to get all announcements
const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.status(200).json({ status: "SUCCESS", data: announcements });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};

export { createAnnouncement, getAllAnnouncements };