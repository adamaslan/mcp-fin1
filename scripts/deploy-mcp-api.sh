#!/bin/bash
# Deploy MCP API to Cloud Run
# Run from: nextjs-mcp-finance directory

set -e

PROJECT_ID="ttb-lang1"
REGION="us-central1"
SERVICE_NAME="technical-analysis-api"

echo "🚀 Deploying MCP API to Cloud Run..."
echo "   Project: $PROJECT_ID"
echo "   Region: $REGION"
echo "   Service: $SERVICE_NAME"

# Navigate to mcp-finance1 cloud-run directory
MCP_DIR="../mcp-finance1/cloud-run"

if [ ! -d "$MCP_DIR" ]; then
    echo "❌ MCP backend not found at $MCP_DIR"
    exit 1
fi

cd "$MCP_DIR"

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars="GCP_PROJECT_ID=$PROJECT_ID" \
    --project $PROJECT_ID \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --region $REGION \
    --project $PROJECT_ID \
    --format="value(status.url)")

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Service URL: $SERVICE_URL"
echo ""
echo "Update your .env with:"
echo "MCP_CLOUD_RUN_URL=$SERVICE_URL"
echo ""
echo "Test with:"
echo "curl $SERVICE_URL/health"
