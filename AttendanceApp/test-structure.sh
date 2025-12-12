#!/bin/bash
# Test script to verify the application structure

echo "Checking application structure..."

# Check that required files exist
files_to_check=(
  "app/_layout.tsx"
  "app/(tabs)/index.tsx"
  "app/login.tsx"
  "app/kepsek.tsx"
  "app/guru.tsx"
  "app/murid.tsx"
  "app/scan.tsx"
  "app/export.tsx"
  "services/firebase.js"
  "firebaseConfig.js"
  "package.json"
  "README.md"
)

missing_files=()
for file in "${files_to_check[@]}"; do
  if [ ! -f "$file" ]; then
    missing_files+=("$file")
  fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
  echo "✓ All required files exist"
else
  echo "✗ Missing files:"
  for file in "${missing_files[@]}"; do
    echo "  - $file"
  done
  exit 1
fi

# Check that the main dependencies are in package.json
dependencies=(
  "expo"
  "expo-router"
  "react-native"
  "react"
  "expo-camera"
  "expo-barcode-scanner"
  "xlsx"
  "firebase"
  "@react-native-async-storage/async-storage"
  "react-native-qrcode-svg"
)

echo "Checking package.json for dependencies..."
package_json_content=$(cat package.json)

missing_deps=()
for dep in "${dependencies[@]}"; do
  if ! echo "$package_json_content" | grep -q "\"$dep\""; then
    missing_deps+=("$dep")
  fi
done

if [ ${#missing_deps[@]} -eq 0 ]; then
  echo "✓ All required dependencies are listed in package.json"
else
  echo "✗ Missing dependencies in package.json:"
  for dep in "${missing_deps[@]}"; do
    echo "  - $dep"
  done
fi

echo "✓ Application structure validation passed"
echo ""
echo "To run the application:"
echo "1. cd /root/absen/AttendanceApp"
echo "2. npx expo start"
echo ""
echo "Demo accounts:"
echo "Kepsek: kepsek@example.com / password"
echo "Guru: guru@example.com / password"
echo "Murid: murid@example.com / password"