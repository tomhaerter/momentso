# syntax=docker/dockerfile:1

# ---- Build the Nuxt app ----
FROM node:26-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# ---- Runtime ----
FROM node:26-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Self-contained Nuxt server output (includes its own pruned node_modules).
COPY --from=build /app/.output ./.output

# Just enough to run migrations: drizzle-orm + pg. Nitro prunes the migrator
# out of .output, so install only those two at the app's own versions.
COPY package.json ./
RUN node -e "const d=require('./package.json').dependencies;require('fs').writeFileSync('package.json',JSON.stringify({name:'migrate',private:true,type:'module',dependencies:{'drizzle-orm':d['drizzle-orm'],'pg':d['pg']}},null,2))" \
 && npm install --omit=dev \
 && npm cache clean --force

COPY migrate.mjs ./
COPY server/database/migrations ./server/database/migrations

EXPOSE 3000
# Apply migrations, then start the server.
CMD ["sh", "-c", "node migrate.mjs && node .output/server/index.mjs"]
