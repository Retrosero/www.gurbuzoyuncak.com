#!/bin/bash

# Favorite Price Tracker Edge Function
# Bu fonksiyon favori ürünlerin fiyat değişikliklerini takip eder

echo "🚀 Favori Fiyat Takip Edge Function başlatılıyor..."

# Function URL'sini belirle
FUNCTION_URL="${SUPABASE_URL}/functions/v1/favorite-price-tracker"

echo "📍 Function URL: $FUNCTION_URL"

# Test verisi hazırla
TEST_DATA='{
    "product_id": 1,
    "old_price": 100.00,
    "new_price": 95.00,
    "force_check": false
}'

echo "📊 Test verisi:"
echo "$TEST_DATA" | jq '.'

# Function'ı çağır
echo "🔍 Fiyat takip kontrolü yapılıyor..."
RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "$TEST_DATA")

echo "📋 Response:"
echo "$RESPONSE" | jq '.'

echo "✅ Favori fiyat takip tamamlandı!"