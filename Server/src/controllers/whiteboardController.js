import WhiteboardModel from "../models/whiteboardModel.js";


const saveWhiteboard = async (req, res) => {
    try {
        const { imageData, createdAt, tool, color, lineWidth, name } = req.body;
        const { userId } = req.user

        // Create new whiteboard document
        const newWhiteboard = new WhiteboardModel({
            userId,
            name,
            imageData,
            createdAt,
            tool,
            color,
            lineWidth
        });

        // Save to MongoDB
        await newWhiteboard.save();

        res.status(201).json({
            success: true,
            message: 'Whiteboard saved successfully',
            whiteboardId: newWhiteboard._id
        });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save whiteboard'
        });
    }
}

const listWhiteboards = async (req, res) => {
    try {
        const {userId} = req.user
        // Fetch recent whiteboards, limited to last 50
        const whiteboards = await WhiteboardModel.find({userId:userId})
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            whiteboards
        });
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch whiteboards'
        });
    }
}

const updateWhiteboard = async (req, res) => {
    try {
        const { imageData, createdAt, tool, color, lineWidth, name, id } = req.body;
        const { userId } = req.user

        const updateWhiteboard = await WhiteboardModel.findByIdAndUpdate(
            id,
            {
                name,
                imageData,
                createdAt,
                tool,
                color,
                lineWidth
            })

        res.status(201).json({
            success: true,
            message: 'Whiteboard saved Updated',
        });

    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save whiteboard'
        });
    }
}

const deleteWhiteboard = async (req, res) => {
    try {
        const { id } = req.body;
        const { userId } = req.user

        const updateWhiteboard = await WhiteboardModel.findByIdAndDelete(id)

        res.status(201).json({
            success: true,
            message: 'Whiteboard Deleted',
        });

    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save whiteboard'
        });
    }
}

export { saveWhiteboard, listWhiteboards, updateWhiteboard, deleteWhiteboard }