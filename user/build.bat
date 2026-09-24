@echo off
echo ========================================
echo 1. Running Expo Prebuild (--clean)...
echo ========================================
call npx expo prebuild --clean

echo.
echo ========================================
echo 2. Patching Android for Cleartext HTTP...
echo ========================================
call node patch-android.js

echo.
echo ========================================
echo 3. Building Android Release APK...
echo ========================================
cd android
call gradlew clean
call gradlew assembleRelease
cd ..

echo.
echo ========================================
echo ✓ Build Finished!
echo APK Output: android\app\build\outputs\apk\release\app-release.apk
echo ========================================
