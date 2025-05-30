#!/bin/bash
# This script sets up a local Cloud SQL proxy connection to test your database connectivity

# Configuration
PROJECT_ID="cellular-way-454315-f2"
REGION="us-central1"
INSTANCE_NAME="your-sql-instance-name" # Replace with your actual instance name

# Full instance connection name
INSTANCE_CONNECTION_NAME="${PROJECT_ID}:${REGION}:${INSTANCE_NAME}"

echo "Setting up Cloud SQL proxy for: ${INSTANCE_CONNECTION_NAME}"
echo "Make sure you have authenticated with gcloud before running this script"
echo "Run: gcloud auth login"
echo ""

# Check if cloud_sql_proxy is installed
if ! command -v cloud_sql_proxy &> /dev/null; then
    echo "Cloud SQL proxy not found. Please install it first."
    echo "For macOS: brew install cloud_sql_proxy"
    echo "For Linux: https://cloud.google.com/sql/docs/mysql/connect-admin-proxy#install"
    exit 1
fi

echo "Starting Cloud SQL proxy..."
echo "This will create a local socket connection to your Cloud SQL instance"
echo "Press Ctrl+C to stop the proxy when you're done testing"
echo ""

# Start the proxy
cloud_sql_proxy -instances=${INSTANCE_CONNECTION_NAME}=tcp:3306

# The script will block here until the user presses Ctrl+C 