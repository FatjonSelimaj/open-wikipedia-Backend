import express, { Express, NextFunction, Request, Response, json } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient, User } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { createProxyMiddleware } from 'http-proxy-middleware'

type TAuthenticatedRequest = Request & { user: Partial<User> }

dotenv.config()

const PORT = process.env.PORT || 3000
const BACKEND_SERVICE_URL = process.env.BACKEND_SERVICE_URL

const app: Express = express()
const prisma = new PrismaClient()

// middleware per verificare il token JWT
const verifyTokenMiddleware = async (req: TAuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1]

    if (!token) {
        const error = new CustomError('Unauthorized: Token not provided.', 401)
        return next(error)
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string }
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
        if (!user) {
            const error = new CustomError('Unauthorized: Invalid token.', 401)
            return next(error)
        }
        // Qui posso fare ulteriori controlli sull'utente se necessario

        // Aggiungo l'utente autenticato all'oggetto della request per erre riutilizzato dalla middleware successiva
        req.user = {
            id: user.id,
            userName: user.userName,
            email: user.email,
            lastLoginAt: user.lastLoginAt,
        }

        next()
    } catch (err) {
        const error = new CustomError('Unauthorized', 401)
        return next(error)
    }
}

// Configuro il proxy per inoltrare le richieste al servizio backend principale
app.use(
    '/api',
    verifyTokenMiddleware,
    createProxyMiddleware({
        target: BACKEND_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: {
            '^/api': '', // Rimuovo "/api" dalla richiesta inoltrata
        },
        onProxyReq: (proxyReq, req: TAuthenticatedRequest) => {
            // Posso includere eventuali dati aggiuntivi nella richiesta al backend finale
            if (req.user) {
                proxyReq.setHeader('X-User', JSON.stringify(req.user))
            }
        },
    }),
)

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

app.get('/users', verifyTokenMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await prisma.user.findMany()
        res.send(users)
    } catch (err) {
        next(err)
    }
})

app.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { identifier, password } = req.body

        // Verifico se esiste l'utente nel database
        let user: Partial<User> = await prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { userName: identifier }],
            },
        })

        // Se non trovo l'utente nel database ritorno un errore 401
        if (!user) {
            const error = new CustomError('Invalid credentials', 401)
            return next(error)
        }

        // Confronto la password con quella salvata sul db
        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
            const error = new CustomError('Invalid credentials', 401)
            return next(error)
        }

        //Genero il token JWT
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '365d' })
        user = await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
            select: {
                id: true,
                email: true,
                userName: true,
            },
        })

        return res.send({ user, token })
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
