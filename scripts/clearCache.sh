#!/bin/bash

# Скрипт для полной очистки кэша React Native и Metro

echo "🧹 Clearing React Native and Metro cache..."

# Остановить Metro Bundler
echo "Stopping Metro Bundler..."
pkill -f "metro" || true

# Очистить кэш npm
echo "Clearing npm cache..."
npm cache clean --force

# Очистить кэш Watchman
echo "Clearing Watchman cache..."
watchman watch-del-all || echo "Watchman not installed, skipping..."

# Очистить кэш Metro
echo "Clearing Metro cache..."
rm -rf /tmp/metro-* || true
rm -rf /tmp/haste-map-* || true

# Очистить временные файлы Metro
echo "Clearing Metro temp files..."
rm -rf $TMPDIR/metro-* || true
rm -rf $TMPDIR/react-* || true

# Очистить node_modules (опционально - раскомментируйте если нужно)
# echo "Removing node_modules..."
# rm -rf node_modules

# echo "Reinstalling dependencies..."
# npm install

echo "✅ Cache cleared successfully!"
echo ""
echo "Now you can run:"
echo "  npm start -- --reset-cache"
