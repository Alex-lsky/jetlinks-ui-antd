FROM node:16.0.0-alpine as build-stage
WORKDIR /app
COPY . .

FROM nginx:1.19.2-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
