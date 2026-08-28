FROM node:24-slim AS build

WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY tsconfig.json tsconfig.agentcore.json ./
COPY src ./src
COPY fixtures ./fixtures
RUN pnpm agentcore:build

FROM node:24-slim

WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/agentcore-dist ./agentcore-dist
EXPOSE 8080
CMD ["node", "agentcore-dist/src/server.js"]
