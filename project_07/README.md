# RecipeMaster (MERN Stack Architecture)

RecipeMaster is a university-level, full-stack recipe management and smart meal planning platform. It has been completely rebuilt from a static JSON prototype into a robust, production-ready MERN application (MongoDB, Express, React, Node.js).

## Key Features

- **MongoDB Persistence**: Strict Mongoose schemas for robust data management (Users, Recipes, PantryItems, Preferences).
- **Secure Authentication**: JWT and bcrypt implementation for protected endpoint interactions.
- **Smart Pantry Engine**: Dynamic semantic ingredient matching logic natively integrated with MongoDB aggregate queries to surface real-time cookable recipes.
- **Expiry-Aware Inventory**: Intelligent pantry tracking that warns users when ingredients are about to spoil.
- **External Integrations**: Proxy integration with TheMealDB for rapid 1-click recipe cloning, and Google Gemini AI integration for smart culinary substitution advice.
- **Responsive Architecture**: Fully decoupled Vite frontend leveraging React Router protected routes, alongside a consolidated Node/Express REST API.

## Requirements
- Node.js v18+
- MongoDB instance (Atlas or local)

## Getting Started

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Create a `.env.local` file in the root directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://<user>:<pwd>@cluster.mongodb.net/recipemaster
   JWT_SECRET=your_super_secret_jwt_key_here
   GEMINI_API_KEY=your_gemini_api_key_optional
   ```
4. Start the development server (automatically launches Vite + Express):
   ```bash
   npm run dev
   ```

## Postman Collection
A fully configured Postman collection (`RecipeMaster.postman_collection.json`) is included in the project root. You can import this into Postman to easily test all backend endpoints (Authentication, Recipe CRUD, Pantry Auto-stocking, Meal Planning, etc.).
