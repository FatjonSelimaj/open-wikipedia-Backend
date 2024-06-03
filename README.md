## README per il Backend

```markdown
# Open Wikipedia Backend

## Descrizione
Il backend di Open Wikipedia è un'API costruita con Express.js e Prisma che gestisce l'autenticazione degli utenti, la ricerca di articoli su Wikipedia, il download e la gestione degli articoli scaricati.

## Struttura delle Cartelle

```plaintext
src/
│
├── controllers/
│   ├── articleController.ts
│   └── userController.ts
│
├── middleware/
│   └── auth.ts
│
├── routes/
│   ├── articleRoutes.ts
│   └── userRoutes.ts
│
├── services/
│   └── wikipediaService.ts
│
├── prisma/
│   └── schema.prisma
│
├── utils/
│   └── passwordUtils.ts
│
├── app.ts
└── server.ts
```

## Istruzioni per l'Installazione

1. Clona il repository:
   ```sh
   git clone https://github.com/tuo-username/tuo-repo-backend.git
   ```
2. Naviga nella directory del progetto:
   ```sh
   cd tuo-repo-backend
   ```
3. Installa le dipendenze:
   ```sh
   npm install
   ```

## Configurazione del Database

1. Configura il database in `.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   SECRET_KEY="your_secret_key"
   ```

2. Esegui la migrazione del database:
   ```sh
   npx prisma migrate dev --name init
   ```

## Esecuzione del Progetto

Per avviare il progetto in modalità di sviluppo, esegui:
```sh
npm run dev
```
Il progetto sarà accessibile all'indirizzo `http://localhost:3000`.

## API Endpoints

### User Routes

- `POST /api/users/register`: Registra un nuovo utente.
- `POST /api/users/login`: Effettua il login di un utente.
- `PUT /api/users/:id`: Aggiorna il profilo di un utente.
- `DELETE /api/users/:id`: Elimina un utente.
- `GET /api/users/me`: Recupera il profilo dell'utente autenticato.
- `POST /api/users/change-password`: Cambia la password dell'utente autenticato.

### Article Routes

- `GET /api/articles/search`: Cerca articoli su Wikipedia.
- `POST /api/articles/download`: Scarica un articolo da Wikipedia.
- `POST /api/articles/check`: Verifica se un articolo esiste.
- `GET /api/articles`: Elenca tutti gli articoli dell'utente.
- `GET /api/articles/random`: Recupera un articolo casuale dell'utente.
- `PUT /api/articles/:id`: Aggiorna un articolo.
- `DELETE /api/articles/:id`: Elimina un articolo.
