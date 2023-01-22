FROM node:18.13-alpine3.17 as builder

RUN apk update && \
    apk add --no-cache libc6-compat && \
    npm install -g pnpm

WORKDIR /app

COPY . .

RUN pnpx turbo prune --scope=@nadoapps/tasks --docker


# Add lockfile and package.json's of isolated subworkspace
FROM node:18.13-alpine3.17 as installer
RUN apk update && \
    apk add --no-cache libc6-compat && \
    npm install -g pnpm


WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/turbo.json ./turbo.json
RUN ls -l
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpx turbo run build --filter tasks






FROM macbre/nginx-http3:1.23.1 as base

WORKDIR /app

COPY --from=installer /app/apps/tasks/dist .

RUN ls -l

COPY apps/tasks/.docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Create 'messages' file used from 'logrotate'
RUN touch /var/log/messages

# Copy 'logrotate' config file
COPY apps/tasks/.docker/nginx/logrotate/nginx /etc/logrotate.d/

FROM base as local









# # First install the dependencies (as they change less often)
# COPY .gitignore .gitignore
# COPY --from=builder /app/out/json/ .
# COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# # Build the project
# COPY --from=builder ./app/out .
# COPY --from=builder ./app/out/full .
# RUN ls -l
# # RUN cd .. && ls
# RUN cd /app && ls -l
# RUN cd /app/full && ls -l
# -----
# COPY --from=builder ./out ..
# COPY turbo.json turbo.json
# RUN pnpm turbo run build --filter=@nadoapps/tasks

# FROM macbre/nginx-http3:1.23.1 as base

# COPY --from=installer /app/dist /app
# RUN ls
# COPY app/apps/tasks/.docker/nginx.conf /etc/nginx/nginx.conf

# # Create 'messages' file used from 'logrotate'
# RUN touch /var/log/messages

# # Copy 'logrotate' config file
# COPY app/apps/tasks/.docker/logrotate/nginx /etc/logrotate.d/

# FROM base as local
