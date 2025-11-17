#!/bin/bash
# --- Next.js PWA File Structure Creation Script ---

# Define the root directory name
ROOT_DIR="/Users/mekari/personal-saved/if-pwa"

echo "Creating the root directory: $ROOT_DIR"

# 1. Create the root directory
mkdir -p "$ROOT_DIR"

# 2. Create the main configuration and root files
echo "Creating root configuration files..."
touch "$ROOT_DIR/package.json"
touch "$ROOT_DIR/tsconfig.json"
touch "$ROOT_DIR/next.config.mjs"
touch "$ROOT_DIR/postcss.config.mjs"
touch "$ROOT_DIR/tailwind.config.mjs"

# 3. Create 'app' directory and core files
echo "Creating 'app' directory files..."
mkdir -p "$ROOT_DIR/app/exercise"
mkdir -p "$ROOT_DIR/app/api/sync"
mkdir -p "$ROOT_DIR/app/api/push/subscribe"

touch "$ROOT_DIR/app/globals.css"
touch "$ROOT_DIR/app/layout.tsx"
touch "$ROOT_DIR/app/page.tsx"
touch "$ROOT_DIR/app/exercise/page.tsx"
touch "$ROOT_DIR/app/api/sync/route.ts"
touch "$ROOT_DIR/app/api/push/subscribe/route.ts"

# 4. Create 'components' directory and sub-folders/files
echo "Creating 'components' and UI files..."
mkdir -p "$ROOT_DIR/components/layout"
mkdir -p "$ROOT_DIR/components/trackers"
mkdir -p "$ROOT_DIR/components/ui"

touch "$ROOT_DIR/components/ServiceWorkerRegister.tsx"
touch "$ROOT_DIR/components/NotificationSetup.tsx"
touch "$ROOT_DIR/components/layout/Navbar.tsx"
touch "$ROOT_DIR/components/trackers/FastingTimer.tsx"
touch "$ROOT_DIR/components/trackers/WaterTracker.tsx"
touch "$ROOT_DIR/components/trackers/WeightTracker.tsx"
touch "$ROOT_DIR/components/ui/button.tsx"
touch "$ROOT_DIR/components/ui/card.tsx"
touch "$ROOT_DIR/components/ui/input.tsx"
touch "$ROOT_DIR/components/ui/progress.tsx"
touch "$ROOT_DIR/components/ui/switch.tsx"

# 5. Create 'lib' directory and files
echo "Creating 'lib' directory files..."
mkdir -p "$ROOT_DIR/lib"
touch "$ROOT_DIR/lib/storage.ts"
touch "$ROOT_DIR/lib/supabase.ts"
touch "$ROOT_DIR/lib/types.ts"

# 6. Create 'public' directory and PWA assets
echo "Creating 'public' assets directory..."
mkdir -p "$ROOT_DIR/public"
touch "$ROOT_DIR/public/manifest.webmanifest"
touch "$ROOT_DIR/public/sw.js"
touch "$ROOT_DIR/public/icon-192.png"
touch "$ROOT_DIR/public/icon-512.png"
touch "$ROOT_DIR/public/favicon.ico"

echo " "
echo "✅ Directory structure for '$ROOT_DIR' created successfully!"
echo "You can start filling in the content for these files now."