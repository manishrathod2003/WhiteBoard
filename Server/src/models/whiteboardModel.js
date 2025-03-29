import mongoose from 'mongoose'

const WhiteboardSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    imageData: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tool: {
        type: String,
        default: 'pen'
    },
    color: {
        type: String,
        default: '#000000'
    },
    lineWidth: {
        type: Number,
        default: 3
    }
});

const WhiteboardModel = mongoose.models.Whiteboard || mongoose.model('Whiteboard', WhiteboardSchema)

export default WhiteboardModel