#!/bin/bash

# Favorite Stock Tracker Edge Function
# Bu fonksiyon favori ürünlerin stok değişikliklerini takip eder

echo "🚀 Favori Stok Takip Edge Function başlatılıyor..."

# Function URL'sini belirle
FUNCTION_URL="${SUPABASE_URL}/functions/v1/favorite-stock-tracker"

echo "📍 Function URL: $FUNCTION_URL"

# Test verisi hazırla
TEST_DATA='{
    "product_id": 1,
    "old_stock": 10,
    "new_stock": 3,
    "force_check": false
}'

echo "📊 Test verisi:"
echo "$TEST_DATA" | jq '.'

# Function'ı çağır
echo "📦 Stok takip kontrolü yapılıyor..."
RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "$TEST_DATA")

echo "📋 Response:"
echo "$RESPONSE" | jq '.'

echo "✅ Favori stok takip tamamlandı!"