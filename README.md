# Documentazione per l'API di Gestione degli Articoli

Questo documento fornisce una panoramica e la documentazione per l'API di Gestione degli Articoli, inclusi endpoint per cercare, scaricare, verificare l'esistenza, elencare, recuperare per ID, aggiornare, eliminare e recuperare articoli casuali, oltre a ottenere la cronologia degli articoli.

## Prerequisiti

- Node.js
- Prisma
- MongoDB
- Express
- Multer
- Axios

## Endpoint

### Cercare Articoli su Wikipedia

**Endpoint:** `GET /search`

**Descrizione:** Cerca articoli su Wikipedia.

**Parametri della Richiesta:**
- `query` (obbligatorio): La stringa di ricerca.

**Risposta:**
- `200 OK`: Restituisce i risultati della ricerca da Wikipedia.
- `400 Bad Request`: Parametro di ricerca mancante.
- `500 Internal Server Error`: Errore nella ricerca su Wikipedia.

**Esempio:**
```json
GET /search?query=example
```

---

### Scaricare Articolo di Wikipedia

**Endpoint:** `POST /download`

**Descrizione:** Scarica e salva un articolo di Wikipedia.

**Corpo della Richiesta:**
- `title` (obbligatorio): Il titolo dell'articolo di Wikipedia.
- `lang` (obbligatorio): La lingua dell'articolo di Wikipedia.
- `overwrite` (opzionale): Se sovrascrivere un articolo esistente con lo stesso titolo.

**Risposta:**
- `200 OK`: Articolo aggiornato con successo.
- `201 Created`: Articolo creato con successo.
- `400 Bad Request`: Titolo o lingua mancanti, oppure articolo non trovato su Wikipedia.
- `401 Unauthorized`: ID utente richiesto.
- `409 Conflict`: Articolo già esistente e `overwrite` non specificato.
- `500 Internal Server Error`: Errore nel download dell'articolo.

**Esempio:**
```json
POST /download
{
  "title": "Example Article",
  "lang": "en",
  "overwrite": true
}
```

---

### Verificare l'Esistenza di un Articolo

**Endpoint:** `POST /check`

**Descrizione:** Verifica se un articolo esiste già per l'utente autenticato.

**Corpo della Richiesta:**
- `title` (obbligatorio): Il titolo dell'articolo.

**Risposta:**
- `200 OK`: Restituisce lo stato di esistenza dell'articolo.
- `400 Bad Request`: Titolo mancante.
- `401 Unauthorized`: ID utente richiesto.
- `500 Internal Server Error`: Errore nella verifica dell'esistenza dell'articolo.

**Esempio:**
```json
POST /check
{
  "title": "Example Article"
}
```

---

### Elencare Tutti gli Articoli

**Endpoint:** `GET /`

**Descrizione:** Elenca tutti gli articoli per l'utente autenticato.

**Risposta:**
- `200 OK`: Restituisce un elenco di articoli.
- `401 Unauthorized`: ID utente richiesto.
- `500 Internal Server Error`: Errore nell'elencare gli articoli.

**Esempio:**
```json
GET /
```

---

### Recuperare Articolo per ID

**Endpoint:** `GET /:id`

**Descrizione:** Recupera un articolo per il suo ID.

**Parametri della Richiesta:**
- `id` (obbligatorio): L'ID dell'articolo.

**Risposta:**
- `200 OK`: Restituisce l'articolo.
- `401 Unauthorized`: ID utente richiesto.
- `403 Forbidden`: Utente non autorizzato ad accedere all'articolo.
- `404 Not Found`: Articolo non trovato.
- `500 Internal Server Error`: Errore nel recuperare l'articolo.

**Esempio:**
```json
GET /1234567890abcdef
```

---

### Aggiornare Articolo

**Endpoint:** `PUT /:id`

**Descrizione:** Aggiorna un articolo esistente.

**Parametri della Richiesta:**
- `id` (obbligatorio): L'ID dell'articolo.

**Corpo della Richiesta:**
- `title` (opzionale): Il nuovo titolo dell'articolo.
- `content` (opzionale): Il nuovo contenuto dell'articolo.

**Risposta:**
- `200 OK`: Restituisce l'articolo aggiornato.
- `401 Unauthorized`: ID utente richiesto.
- `403 Forbidden`: Utente non autorizzato ad aggiornare l'articolo.
- `404 Not Found`: Articolo non trovato.
- `500 Internal Server Error`: Errore nell'aggiornare l'articolo.

**Esempio:**
```json
PUT /1234567890abcdef
{
  "title": "Updated Title",
  "content": "Updated content."
}
```

---

### Eliminare Articolo

**Endpoint:** `DELETE /:id`

**Descrizione:** Elimina un articolo.

**Parametri della Richiesta:**
- `id` (obbligatorio): L'ID dell'articolo.

**Risposta:**
- `204 No Content`: Articolo eliminato con successo.
- `401 Unauthorized`: ID utente richiesto.
- `403 Forbidden`: Utente non autorizzato ad eliminare l'articolo.
- `404 Not Found`: Articolo non trovato.
- `500 Internal Server Error`: Errore nell'eliminare l'articolo.

**Esempio:**
```json
DELETE /1234567890abcdef
```

---

### Recuperare Articolo Casuale

**Endpoint:** `GET /random`

**Descrizione:** Recupera un articolo casuale per l'utente autenticato.

**Risposta:**
- `200 OK`: Restituisce un articolo casuale.
- `401 Unauthorized`: ID utente richiesto.
- `500 Internal Server Error`: Errore nel recuperare l'articolo casuale.

**Esempio:**
```json
GET /random
```

---

### Ottenere la Cronologia di un Articolo

**Endpoint:** `GET /history/:articleId`

**Descrizione:** Ottiene la cronologia di un articolo per il suo ID.

**Parametri della Richiesta:**
- `articleId` (obbligatorio): L'ID dell'articolo.

**Risposta:**
- `200 OK`: Restituisce la cronologia dell'articolo.
- `401 Unauthorized`: ID utente richiesto.
- `500 Internal Server Error`: Errore nel recuperare la cronologia dell'articolo.

**Esempio:**
```json
GET /history/1234567890abcdef
```

---

## Gestione degli Errori

Tutti gli endpoint restituiscono codici di stato HTTP appropriati e messaggi di errore. Le risposte comuni agli errori includono:

- `400 Bad Request`: Input non valido o parametri richiesti mancanti.
- `401 Unauthorized`: Autenticazione dell'utente richiesta.
- `403 Forbidden`: Utente non autorizzato a eseguire l'azione.
- `404 Not Found`: Risorsa non trovata.
- `500 Internal Server Error`: Errore lato server.

## Autenticazione

L'API utilizza JWT per l'autenticazione. Gli utenti devono includere un token JWT valido nell'header `Authorization` di ogni richiesta.

Esempio:
```json
Authorization: Bearer <token>
```

## Configurazione

Per configurare ed eseguire l'API, seguire questi passaggi:

1. Installare le dipendenze:
   ```sh
   npm install
   ```

2. Configurare le variabili d'ambiente in un file `.env`:
   ```env
   DATABASE_URL=<your_database_url>
   SECRET_KEY=<your_secret_key>
   ```

3. Eseguire le migrazioni di Prisma:
   ```sh
   npx prisma migrate dev
   ```

4. Avviare il server:
   ```sh
   npm start
   ```

Il server verrà eseguito su `http://localhost:3000` per impostazione predefinita. Regolare la porta secondo necessità impostando la variabile d'ambiente `PORT`.