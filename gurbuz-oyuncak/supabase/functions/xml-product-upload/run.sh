#!/bin/bash

# XML Product Upload Edge Function
# Deploy this function to Supabase

echo "Deploying XML Product Upload Edge Function..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed"
    echo "Please install it first: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Deploy the function
supabase functions deploy xml-product-upload --project-ref YOUR_PROJECT_REF

echo "✅ XML Product Upload function deployed successfully!"