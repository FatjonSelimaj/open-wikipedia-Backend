import express, { Express, NextFunction, Request, Response, json } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const PORT = process.env.PORT || 3000
const app: Express = express()
const prisma = new PrismaClient()

app.use(json())
app.use(cors())

// middleware di logging
app.use((req: Request, response: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()}: ${req.method} ${req.url}`)
    next() // chiamo la next function per passare al prossimo middleware della chain
})

//route
app.get('/', (req: Request, res: Response) => {
    res.send({ message: 'Hello World!' })
})

app.post('/users', async (req: Request, res: Response) => {
    try {
        const { userName, email, password } = req.body
        const user = await prisma.user.create({
            data: {
                userName,
                email,
                password,
            },
        })
        res.send(user)
    } catch (err: any) {
        res.status(500).send({ message: err.message })
    }
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})

//end
