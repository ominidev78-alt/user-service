import { Router } from 'express'
import { userController } from '../controllers/UserController.js'

const router = Router()

router.get('/users', (req,res,next)=>userController.list(req,res,next))
router.get('/users/:id', (req,res,next)=>userController.get(req,res,next))
router.put('/users/:id', (req,res,next)=>userController.update(req,res,next))

export default router
