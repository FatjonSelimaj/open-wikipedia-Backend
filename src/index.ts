import express, { Express, NextFunction, Request, Response, json } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

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

app.get('/users', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await prisma.user.findMany()
        res.send(users)
    } catch (err) {
        next(err)
    }
})

app.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, userName, password, passwordConfirm } = req.body

        // Verifico se email o userName già esistono
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { userName }],
            },
        })
        if (existingUser) {
            const error = new CustomError('Email or username already used.', 400)
            return next(error)
        }

        // Verifico se la password e la conferma password coincidono
        if (password !== passwordConfirm) {
            const error = new CustomError("Passwords doesn't match.", 400)
            return next(error)
        }

        // Hash della password prima di salvarla sul db
        const hashedPassword = await bcrypt.hash(password, 10)

        // Creo il nuovo utente
        const newUser = await prisma.user.create({
            data: {
                email,
                userName,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                userName: true,
            },
        })

        res.status(201).send(newUser)
    } catch (err) {
        next(err)
    }
})

// Middleware per risorsa non trovata
app.use((req, res, next) => {
    const error = new CustomError('Resource not found.', 404)
    next(error)
})

// Middleware per la gestione degli errori
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)

    if (err instanceof CustomError) {
        res.status(err.statusCode).send({ error: err.message })
    } else {
        res.status(500).send({ error: err.message })
    }
})

// Classe di errore personalizzata
class CustomError extends Error {
    statusCode: number

    constructor(message: string, statusCode: number = 500) {
        super(message)
        this.name = 'CustomError'
        this.statusCode = statusCode
    }
}

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})

//end
