# RecipeMaster CLI Instructions & Commands

Here are all the critical commands required to manage, build, run, and develop the RecipeMaster MERN application directly from your terminal.

## 1. Installation
Before running anything, ensure you install dependencies. Because of Vite plugin dependencies, you will need to accept legacy peer resolutions:
```bash
npm install --legacy-peer-deps
```

## 2. Local Development 
Runs both the Vite Frontend and the Node/Express Backend concurrently with live-reloading natively embedded via middleware.
```bash
npm run dev
```
- **Access App at:** `http://localhost:3000`

## 3. Creating a Production Build
This single command prepares everything. It creates a robust production bundle of your frontend inside `/dist` and compiles the entire Node.js backend into a solitary `server.js` file utilizing esbuild speeds.
```bash
npm run build
```

## 4. Starting the Production Server
After building the project via the above command, use this to boot the static server.
```bash
npm run start
```
*(Note: This uses `cross-env` internally to set `NODE_ENV=production` automatically on Windows machines).*

## 5. TypeScript Code Validation (Linting)
Runs a deep static code analysis check across all `.ts` and `.tsx` files catching programmatic logic errors. 
```bash
npm run lint
```

## 6. Cleanup Commands
If you ever want to forcefully purge the generated production build footprints (the `dist/` folder and `server.js` files):
```bash
npm run clean
```
