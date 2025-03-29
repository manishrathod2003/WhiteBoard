import express from 'express'
import { deleteWhiteboard, listWhiteboards, saveWhiteboard, updateWhiteboard } from '../controllers/whiteboardController.js'
import clerkAuth from '../middleware/authMiddleware.js'

const whiteboardRouter = express.Router()

whiteboardRouter.post('/save',clerkAuth, saveWhiteboard)
whiteboardRouter.get('/list',clerkAuth,listWhiteboards)
whiteboardRouter.post('/update',clerkAuth, updateWhiteboard)
whiteboardRouter.post('/delete',clerkAuth, deleteWhiteboard)

export default whiteboardRouter