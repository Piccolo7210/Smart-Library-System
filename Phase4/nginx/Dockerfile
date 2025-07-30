# FROM nginx:alpine

# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 8080
# FROM nginx:alpine

# Remove default config
# RUN rm /etc/nginx/conf.d/default.conf

# # Copy our custom nginx configuration
# COPY nginx.conf /etc/nginx/nginx.conf

# EXPOSE 8080

# CMD ["nginx", "-g", "daemon off;"]

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]