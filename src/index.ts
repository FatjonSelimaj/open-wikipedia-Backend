import express from 'express';
import cors from 'cors'; // Importa il pacchetto CORS
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import articleRoutes from './routes/articleRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configura il middleware CORS
app.use(cors({
  origin: 'http://localhost:4000', // Sostituisci con l'URL del tuo frontend
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.use(express.json());

// Importa le rotte
app.use('/api', userRoutes);
app.use('/api/articles', articleRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
