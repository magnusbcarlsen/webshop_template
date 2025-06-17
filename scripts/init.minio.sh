#!/bin/bash

# MinIO Production Initialization Script
# This script should be run after the first deployment to set up MinIO buckets and policies

set -e

echo "🚀 Initializing MinIO for production..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Validate required environment variables
if [ -z "$MINIO_ROOT_USER" ] || [ -z "$MINIO_ROOT_PASSWORD" ] || [ -z "$DOMAIN" ]; then
    echo "❌ Error: Required environment variables not set"
    echo "Please ensure MINIO_ROOT_USER, MINIO_ROOT_PASSWORD, and DOMAIN are set in .env"
    exit 1
fi

# Wait for MinIO to be ready
echo "⏳ Waiting for MinIO to start..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:9000/minio/health/live > /dev/null 2>&1; then
        echo "✅ MinIO is ready!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ MinIO failed to start after $max_attempts attempts"
        echo "Please check MinIO container logs:"
        echo "docker compose -f docker-compose.prod.yml logs minio"
        exit 1
    fi
    
    echo "Attempt $attempt/$max_attempts - MinIO not ready yet, waiting 10 seconds..."
    sleep 10
    attempt=$((attempt + 1))
done

# Install mc (MinIO Client) if not already installed
if ! command -v mc &> /dev/null; then
    echo "📦 Installing MinIO Client..."
    wget -q https://dl.min.io/client/mc/release/linux-amd64/mc
    chmod +x mc
    sudo mv mc /usr/local/bin/
    echo "✅ MinIO Client installed"
fi

# Configure mc with your MinIO instance
echo "⚙️ Configuring MinIO client..."
mc alias set local http://localhost:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}

# Test connection
if ! mc admin info local > /dev/null 2>&1; then
    echo "❌ Failed to connect to MinIO"
    echo "Please check your MinIO credentials and ensure the service is running"
    exit 1
fi

echo "✅ Connected to MinIO successfully"

# Create buckets
echo "🪣 Creating buckets..."

# Products bucket (for product images)
if mc mb local/products --ignore-existing; then
    echo "✅ Created/verified products bucket"
else
    echo "⚠️ Products bucket creation failed or already exists"
fi

# Uploads bucket (for user uploads)
if mc mb local/uploads --ignore-existing; then
    echo "✅ Created/verified uploads bucket" 
else
    echo "⚠️ Uploads bucket creation failed or already exists"
fi

# Static bucket (for static assets)
if mc mb local/static --ignore-existing; then
    echo "✅ Created/verified static bucket"
else
    echo "⚠️ Static bucket creation failed or already exists"
fi

# Set bucket policies
echo "🔐 Setting bucket policies..."

# Products bucket - public read for product images
if mc policy set public local/products; then
    echo "✅ Set public read policy for products bucket"
else
    echo "⚠️ Failed to set products bucket policy"
fi

# Static bucket - public read for static assets  
if mc policy set public local/static; then
    echo "✅ Set public read policy for static bucket"
else
    echo "⚠️ Failed to set static bucket policy"
fi

# Uploads bucket - private by default (authenticated access only)
if mc policy set private local/uploads; then
    echo "✅ Set private policy for uploads bucket"
else
    echo "⚠️ Failed to set uploads bucket policy"
fi

# Set CORS configuration for web access
echo "🌐 Setting CORS configuration..."

cat > /tmp/cors.json << EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://${DOMAIN}", "https://www.${DOMAIN}", "http://localhost:3000"],
      "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

# Apply CORS to all buckets
for bucket in products uploads static; do
    if mc cors set /tmp/cors.json local/$bucket; then
        echo "✅ Set CORS for $bucket bucket"
    else
        echo "⚠️ Failed to set CORS for $bucket bucket"
    fi
done

# Create sample folder structure
echo "📁 Creating folder structure..."

# Create folders in products bucket
echo "" | mc pipe local/products/categories/.keep 2>/dev/null || true
echo "" | mc pipe local/products/featured/.keep 2>/dev/null || true  
echo "" | mc pipe local/products/thumbnails/.keep 2>/dev/null || true

# Create folders in uploads bucket
echo "" | mc pipe local/uploads/user-avatars/.keep 2>/dev/null || true
echo "" | mc pipe local/uploads/documents/.keep 2>/dev/null || true

# Create folders in static bucket
echo "" | mc pipe local/static/icons/.keep 2>/dev/null || true
echo "" | mc pipe local/static/logos/.keep 2>/dev/null || true

echo "✅ Created folder structure"

# Test file upload and download
echo "🧪 Testing MinIO functionality..."

# Create a test file
echo "MinIO test file - $(date)" > /tmp/test-file.txt

# Upload test file
if mc cp /tmp/test-file.txt local/static/test-file.txt; then
    echo "✅ File upload test passed"
    
    # Test file download
    if mc cp local/static/test-file.txt /tmp/downloaded-test.txt; then
        echo "✅ File download test passed"
        
        # Clean up test files
        mc rm local/static/test-file.txt 2>/dev/null || true
        rm -f /tmp/test-file.txt /tmp/downloaded-test.txt 2>/dev/null || true
    else
        echo "⚠️ File download test failed"
    fi
else
    echo "⚠️ File upload test failed"
fi

# List all buckets and their contents
echo "📋 Current bucket structure:"
for bucket in products uploads static; do
    echo "📁 $bucket bucket:"
    mc ls local/$bucket --recursive 2>/dev/null || echo "  (empty or inaccessible)"
    echo ""
done

# Clean up temporary files
rm -f /tmp/cors.json

echo "🎉 MinIO initialization complete!"
echo ""
echo "📊 MinIO Console: https://console.${DOMAIN}"
echo "🔗 API Endpoint: https://${DOMAIN}"
echo "👤 Username: ${MINIO_ROOT_USER}"
echo "🔑 Password: ${MINIO_ROOT_PASSWORD}"
echo ""
echo "🪣 Available buckets:"
echo "  - products (public read) - https://${DOMAIN}/products/"
echo "  - uploads (private) - https://${DOMAIN}/uploads/"  
echo "  - static (public read) - https://${DOMAIN}/static/"
echo ""
echo "💡 Usage examples:"
echo "  - Product image: https://${DOMAIN}/products/category/image.jpg"
echo "  - Static asset: https://${DOMAIN}/static/icons/logo.png"
echo "  - User upload: https://${DOMAIN}/uploads/user-123/avatar.jpg (requires auth)"
echo ""
echo "✨ MinIO is ready for production use!"