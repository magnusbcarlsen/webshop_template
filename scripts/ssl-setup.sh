#!/bin/bash

# ssl-setup.sh - SSL setup for bergstromart.dk
# Run from /var/www/webshop/scripts directory

set -e

DOMAIN="bergstromart.dk"
EMAIL="bergstromgraphics@gmail.com"  # CHANGE THIS TO YOUR EMAIL!

echo "🔐 Setting up SSL certificates for $DOMAIN..."
echo "📧 Using email: $EMAIL"

# Navigate to project root
cd /var/www/webshop

# Check we're in the right place
if [[ ! -f "docker-compose.prod.yml" ]]; then
    echo "❌ Error: docker-compose.prod.yml not found!"
    echo "Current directory: $(pwd)"
    exit 1
fi

# Step 1: Create HTTP-only nginx config
echo "📝 Creating HTTP-only nginx configuration..."
cat > nginx/nginx.http-only.conf << 'EOF'
server {
    listen 80;
    server_name bergstromart.dk www.bergstromart.dk console.bergstromart.dk;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files $uri $uri/ =404;
    }
    
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
    
    location /api/ {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

cp nginx/nginx.http-only.conf nginx/nginx.local.conf
echo "✅ Created HTTP-only nginx config"

# Step 2: Check for .env file
if [[ ! -f ".env" ]]; then
    echo "❌ Error: .env file not found!"
    echo ""
    echo "Please create a .env file first. You can:"
    echo "1. Create it manually with your production values"
    echo "2. Use GitHub Actions to deploy (recommended)"
    echo ""
    echo "The .env file should contain your database passwords, JWT secrets, etc."
    echo "Never commit .env files to git!"
    exit 1
else
    echo "✅ .env file found"
fi

# Step 3: Start services
echo "🚀 Starting services with HTTP configuration..."
docker compose -f docker-compose.prod.yml down || true
docker compose -f docker-compose.prod.yml up -d db minio backend frontend nginx

echo "⏳ Waiting for services to start..."
sleep 45

# Check services
echo "📋 Service status:"
docker compose -f docker-compose.prod.yml ps

# Step 4: Test HTTP access
echo "🧪 Testing HTTP access..."
MAX_ATTEMPTS=10
for i in $(seq 1 $MAX_ATTEMPTS); do
    if curl -f -s http://$DOMAIN/health > /dev/null 2>&1; then
        echo "✅ HTTP access working (attempt $i)"
        break
    elif [ $i -eq $MAX_ATTEMPTS ]; then
        echo "❌ HTTP access failed after $MAX_ATTEMPTS attempts!"
        echo "🔍 Nginx logs:"
        docker compose -f docker-compose.prod.yml logs nginx --tail=10
        echo ""
        echo "💡 Try visiting http://$DOMAIN in your browser to debug"
        exit 1
    else
        echo "⏳ Attempt $i failed, waiting 10 seconds..."
        sleep 10
    fi
done

# Step 5: Get SSL certificates
echo "📜 Getting SSL certificates..."
echo "This will prompt you to agree to terms of service..."

docker run -it --rm \
  --name certbot \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --expand \
  -d $DOMAIN \
  -d www.$DOMAIN \
  -d console.$DOMAIN

# Step 6: Verify certificates
echo "🔍 Verifying certificates..."
if [[ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]]; then
    echo "✅ Certificates created successfully!"
    
    # Show certificate info
    docker run --rm \
      -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
      certbot/certbot certificates
else
    echo "❌ Certificate creation failed!"
    echo "Check the certbot output above for errors"
    exit 1
fi

# Step 7: Switch to HTTPS
echo "🔧 Switching to HTTPS configuration..."
if [[ -f "nginx/nginx.prod.conf" ]]; then
    cp nginx/nginx.prod.conf nginx/nginx.local.conf
    echo "✅ Copied nginx.prod.conf to nginx.local.conf"
else
    echo "❌ nginx.prod.conf not found!"
    echo "Please make sure you have your production nginx config ready"
    exit 1
fi

# Restart nginx with SSL
echo "🔄 Restarting nginx with SSL configuration..."
docker compose -f docker-compose.prod.yml restart nginx
sleep 15

# Step 8: Test HTTPS
echo "🧪 Testing HTTPS access..."
MAX_ATTEMPTS=5
for i in $(seq 1 $MAX_ATTEMPTS); do
    if curl -f -s https://$DOMAIN/health > /dev/null 2>&1; then
        echo "✅ HTTPS access working! (attempt $i)"
        break
    elif [ $i -eq $MAX_ATTEMPTS ]; then
        echo "⚠️ HTTPS test failed after $MAX_ATTEMPTS attempts"
        echo "🔍 Nginx logs:"
        docker compose -f docker-compose.prod.yml logs nginx --tail=20
        echo ""
        echo "💡 You may need to manually check the nginx configuration"
    else
        echo "⏳ HTTPS attempt $i failed, waiting 10 seconds..."
        sleep 10
    fi
done

# Step 9: Set up auto-renewal
echo "⏰ Setting up automatic renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * cd /var/www/webshop && docker compose -f docker-compose.prod.yml exec -T certbot certbot renew --quiet") | crontab -

echo ""
echo "🎉 SSL setup complete!"
echo ""
echo "🌐 Test your sites:"
echo "  https://$DOMAIN"
echo "  https://www.$DOMAIN"
echo "  https://console.$DOMAIN"
echo ""
echo "📋 Certificate expires in ~90 days"
echo "🔄 Auto-renewal is set up via cron"

# Final verification
echo ""
echo "🏁 Final verification..."
if command -v openssl &> /dev/null; then
    echo "Certificate details:"
    openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "Certificate check completed"
else
    echo "OpenSSL not available for certificate verification"
fi

echo ""
echo "🔍 All services:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🎯 Next steps:"
echo "1. Test all URLs in your browser"
echo "2. Update your GitHub Actions workflow"
echo "3. Deploy your application!"
