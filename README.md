# AutoMarket — Marketplace Auto Romania

MVP complet pentru un site de vânzare mașini, inspirat de Autovit/OLX Auto.

## Stack tehnic

| Layer | Tehnologii |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS 3, Axios, React Hook Form |
| Backend | Node.js, Express.js, Prisma ORM, SQLite |
| Auth | JWT + bcryptjs |

## Structura proiectului

```
auto-marketplace/
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       └── index.js
└── client/
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        ├── services/
        └── utils/
```

## Instalare și rulare

### 1. Server

```bash
cd server
npm install
npx prisma db push          # creează baza de date SQLite
npx prisma db seed          # populează cu 12 anunțuri demo + 2 conturi
npm run dev                 # pornește pe http://localhost:3001
```

### 2. Client

```bash
cd client
npm install
npm run dev                 # pornește pe http://localhost:5173
```

## Conturi demo

| Rol | Email | Parolă |
|-----|-------|--------|
| Admin | admin@automarket.ro | Admin1234! |
| User demo | demo@automarket.ro | Demo1234! |

## Funcționalități implementate

### Autentificare
- [x] Register / Login / Logout
- [x] JWT salvat în localStorage
- [x] Rute private (ProtectedRoute, AdminRoute)
- [x] Middleware backend cu rol USER / ADMIN

### Anunțuri
- [x] Listare cu filtre (brand, preț, an, km, combustibil, cutie, caroserie, locație, featured)
- [x] Sortare (cele mai noi, preț asc/desc, km asc)
- [x] Paginare
- [x] Detaliu anunț cu galerie imagini
- [x] Adăugare anunț (formular complet cu validare)
- [x] Editare anunț (doar proprietar sau admin)
- [x] Ștergere anunț (cu confirmare)
- [x] Marcare ca Vândut
- [x] Promovare — setare Featured/Premium (mock payment)

### Admin Dashboard
- [x] Statistici (total anunțuri, active, featured, utilizatori)
- [x] Vizualizare și filtrare toate anunțurile
- [x] Activare/Draft/Ștergere anunțuri
- [x] Toggle Featured / Premium
- [x] Listă utilizatori

### Monetizare (MVP mock)
- [x] Pagina Pricing cu 4 pachete (Basic/Premium/Dealer Starter/Dealer Pro)
- [x] Buton "Promovează" — setează isFeatured = true (mock)
- [ ] Integrare Stripe (faza comercială)

### UI/UX
- [x] Design responsive mobile-first
- [x] Navbar dark cu meniu mobil
- [x] Hero section cu search
- [x] Categorii pe homepage
- [x] Carduri curate cu badges Featured/Premium/Vândut
- [x] Loading states
- [x] Mesaje de eroare clare

## API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Listings
```
GET    /api/listings          ?brand,model,fuelType,transmission,bodyType,location,minPrice,maxPrice,minYear,maxYear,maxMileage,featured,sort,page,limit
GET    /api/listings/mine     (autentificat)
GET    /api/listings/:id
POST   /api/listings          (autentificat)
PUT    /api/listings/:id      (proprietar sau admin)
DELETE /api/listings/:id      (proprietar sau admin)
PATCH  /api/listings/:id/sold (proprietar sau admin)
PATCH  /api/listings/:id/featured (proprietar sau admin)
```

### Admin
```
GET    /api/admin/stats
GET    /api/admin/listings
GET    /api/admin/users
PATCH  /api/admin/listings/:id/status
PATCH  /api/admin/listings/:id/premium
DELETE /api/admin/listings/:id
```

## Ce rămâne pentru versiunea comercială

1. **Plăți Stripe** — integrare checkout pentru planuri Premium/Dealer
2. **Upload imagini** — Multer + S3/Cloudinary în loc de URL-uri manuale
3. **Mesagerie** — chat intern între cumpărător și vânzător (Socket.io)
4. **Notificări email** — confirmări, anunț nou la căutare salvată (Nodemailer)
5. **Căutări salvate** — alertă email când apare mașina căutată
6. **Pagina dealer** — profil public cu toate anunțurile unui dealer
7. **Verificare anunțuri** — moderare manuală înainte de publicare
8. **SEO** — meta tags dinamice, sitemap, URL-uri descriptive
9. **Analytics** — nr. vizualizări per anunț, leads generate
10. **Aplicație mobilă** — React Native cu același API
