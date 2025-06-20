FROM nginx:alpine

# Delete the default Nginx configuration to avoid conflicts
RUN rm /etc/nginx/conf.d/default.conf

# Add our custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create a directory to store SSL certificates
RUN mkdir -p /etc/nginx/ssl

# Generate a self-signed SSL/TLS certificate for local use
RUN apk add --no-cache openssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

EXPOSE 80 443 
