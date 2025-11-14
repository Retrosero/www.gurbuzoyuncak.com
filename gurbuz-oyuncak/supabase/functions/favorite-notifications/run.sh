#!/bin/bash

# Favorite Notifications Edge Function
# Bu fonksiyon favori ürünler için bildirim gönderir

echo "🚀 Favori Bildirim Edge Function başlatılıyor..."

# Function URL'sini belirle
FUNCTION_URL="${SUPABASE_URL}/functions/v1/favorite-notifications"

echo "📍 Function URL: $FUNCTION_URL"

# Test verisi hazırla
TEST_DATA='{
    "user_id": "12345678-1234-1234-1234-123456789012",
    "notification_type": "price_decrease",
    "product_id": 1,
    "product_name": "Test Ürünü",
    "old_value": 100.00,
    "new_value": 95.00,
    "change_percentage": 5.00
}'

echo "📊 Test verisi:"
echo "$TEST_DATA" | jq '.'

# Function'ı çağır
echo "📬 Bildirim gönderiliyor..."
RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "$TEST_DATA")

echo "📋 Response:"
echo "$RESPONSE" | jq '.'

echo "✅ Favori bildirim tamamlandı!"