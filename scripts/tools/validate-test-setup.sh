#!/bin/bash

# Pre-test validation script
# Ensures the environment is ready before running tests

set -e

echo "🔍 Validating test setup..."

# 1. Check TypeScript compilation
echo "📝 Checking TypeScript compilation..."
if ! npx tsc --noEmit; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi
echo "✅ TypeScript compilation successful"

# 2. Check if dev server is needed and running (for E2E tests)
if [ "$1" = "e2e" ]; then
    echo "🌐 Checking dev server..."

    # Try to reach the dev server
    if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        echo "⚠️  Dev server not responding on port 3000"
        echo "   Playwright will start it automatically"
    else
        echo "✅ Dev server is running"
    fi
fi

# 3. Check for common issues
echo "🔧 Checking for common issues..."

# Check for missing dependencies
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Run: npm install"
    exit 1
fi

# Check test files exist
if [ "$1" = "e2e" ]; then
    if [ ! -d "scripts/playwright" ]; then
        echo "❌ E2E test directory not found"
        exit 1
    fi
fi

echo "✅ All pre-test validations passed"
echo ""
