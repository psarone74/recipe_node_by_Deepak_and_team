# RecipeMaster System Requirements

To ensure the MERN-stack architecture executes cleanly without unexpected crashes, make sure your operating environment fulfills the following prerequisites.

## 1. Core Software Dependencies
- **Node.js**: Minimum `v18.0.0` or higher (LTS versions like v20 natively recommended).
- **NPM (Node Package Manager)**: `v9.x` or higher (usually bundles natively with Node).
- **MongoDB**: 
  - An active MongoDB Atlas free-tier cluster (highly recommended for production viability).
  - OR a local MongoDB instance daemon running natively on `localhost:27017`.

## 2. Environment Variables (.env)
You must create a `.env` file in the root folder (a template exists as `.env.example`). The application securely parses this sequentially before backend runtime execution:
- `PORT` (e.g. `3000`)
- `MONGODB_URI` (The precise string pointing to your Atlas or Local database)
- `JWT_SECRET` (A hashed/long string required to secure user sessions)
- `GEMINI_API_KEY` (Gathered externally from Google AI Studio to unlock the culinary swap endpoints)
- `MEALDB_API_URL` (Defaults to `https://www.themealdb.com/api/json/v1/1`)

## 3. Package Dependencies
*(All of these are installed dynamically via `npm install --legacy-peer-deps`)*
- **Frontend Stack**: React 19, React-Router-DOM v7, TailwindCSS v4, Vite v8
- **Backend Stack**: ExpressJS API Routing, Mongoose (MongoDB ODM)
- **Security & APIs**: bcryptjs, jsonwebtoken, helmet, express-rate-limit, @google/genai
- **Compilation Toolchains**: esbuild, tsx, typescript
