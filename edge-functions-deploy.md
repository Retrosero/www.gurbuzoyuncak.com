# Edge Functions Deployment Plan

## Functions to Deploy:

1. **paytr-callback** (v2) - PayTR webhook handler
   - Type: webhook
   - Handles payment success/failure
   - Updates order status
   - Awards points on successful payment

2. **birthday-bonus** (v1) - Birthday points automation  
   - Type: cron
   - Runs daily at 09:00 AM
   - Awards birthday points to users

3. **award-points** (v2) - Points awarding with level-up notifications
   - Type: normal
   - Awards points with VIP level tracking
   - Logs level-up events

## Deployment Commands:
```bash
# Deploy all functions
supabase functions deploy paytr-callback --project-ref nxtfpceqjpyexmiuecam
supabase functions deploy birthday-bonus --project-ref nxtfpceqjpyexmiuecam  
supabase functions deploy award-points --project-ref nxtfpceqjpyexmiuecam
```

## Cron Job Setup:
```bash
# Create cron job for birthday-bonus (daily at 09:00)
# This will be done via create_background_cron_job tool
```
