FROM node:20-alpine3.20
WORKDIR /app
COPY apps/server .
RUN rm -rf node_modules
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm prisma generate
CMD ["pnpm", "prod"]
