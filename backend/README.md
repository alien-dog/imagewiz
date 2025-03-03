# iMagenWiz Backend

This is the backend service for iMagenWiz, an AI-powered image processing platform.

## Setup
1. Install dependencies:
   
up to date, audited 594 packages in 2s

63 packages are looking for funding
  run `npm fund` for details

7 moderate severity vulnerabilities

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

2. Set up environment variables:
   Create a .env file with:
   

3. Run development server:
   
> rest-express@1.0.0 dev
> tsx server/index.ts

## Build

> rest-express@1.0.0 build
> vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

vite v5.4.14 building for production...
✓ 0 modules transformed.

## Production

> rest-express@1.0.0 start
> NODE_ENV=production node dist/index.js
