# PharmaDali Pharmacist Mobile App (Expo)

The **PharmaDali Pharmacist App** is a specialized mobile application built with **React Native** and **Expo SDK 54** for on-duty pharmacists. It streamlines prescription validation, real-time order fulfillment queues, ready-for-pickup notifications, customer consultation chats, and real-time inventory shortage alerts.

---

## Prerequisites

- **Node.js 18+** and npm
- **Expo CLI**: `npm install -g eas-cli` (recommended for cloud builds)
- **Android Studio** emulator or a physical Android device with Expo Go
- **Backend API**: Running Laravel API server (see [`backend/README.md`](../../backend/README.md))

---

## 1. Installation

```bash
cd applications/pharmacist
npm install
```

---

## 2. Environment Configuration

Copy the example environment file:
```bash
copy .env.example .env
```

Configure your `.env` file:
```env
EXPO_PUBLIC_API_URL=http://<your-local-ip>:8000/api
```

> [!IMPORTANT]
> - Always use your machine's **LAN IPv4 address** (e.g. `192.168.1.15`) instead of `127.0.0.1` or `localhost` when testing on a physical phone, as `127.0.0.1` refers to the phone itself.
> - Run `ipconfig` in PowerShell to find your `IPv4 Address`.
> - The environment variable name **must** begin with `EXPO_PUBLIC_` to be bundled into the client runtime.
> - Fully restart the Expo server after editing `.env`.

---

## 3. Development Server

Start the Metro development server:
```bash
npx expo start
```

Press `a` in the terminal to launch the Android emulator, or scan the displayed QR code with the **Expo Go** app on your physical device.

---

## 4. Key Pharmacist Workflows

- **Order Fulfillment Pipeline**: Review customer orders (`pending` → `pickup_ready` → `completed`), mark dispensed items, and verify batch FEFO allocation.
- **Prescription Verification**: Inspect high-resolution prescription images uploaded by customers and approve or decline them directly within the order review interface.
- **Consultation & Chat**: Live chat with customers regarding medicine availability and instructions.
- **Shortage & Expiry Alerts**: Real-time push notifications when product batches are nearing 30-day expiry or stock falls below the dynamic Reorder Point (ROP).

---

## 5. Building Standalone APKs

The app includes preconfigured build profiles in [`eas.json`](eas.json) and native Android resources.

### Option A: Cloud Build via EAS (Recommended for Testing APK)
Generate an installable `.apk` file hosted by Expo:
```bash
eas build --platform android --profile preview
```
Scan the terminal QR code when finished to download and install the APK directly to your phone.

### Option B: Local Android Build via Gradle
If you have JDK 17 installed and prefer compiling directly on your PC:
```powershell
cd android
.\gradlew.bat assembleDebug
```
* **Generated APK:** `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 6. Over-The-Air (OTA) Updates

Once users install the APK, you can push instant JavaScript and UI bug fixes over the air without requiring a full APK rebuild:
```bash
eas update --channel preview --message "Updated pharmacist order modal"
```
The app will automatically check for and apply updates on launch.

---

## 7. App Icon & Assets

The app uses standard Android Adaptive Icons:
- **[`assets/adaptive_icon.png`](assets/adaptive_icon.png)**: 1024×1024 transparent foreground with the PharmaDali brand emblem centered within the 66% safe zone circle (guarantees 0% cropping on any launcher mask).
- **[`assets/app_icon.png`](assets/app_icon.png)**: 1024×1024 solid `#ffffff` icon for iOS and Web favicons.
