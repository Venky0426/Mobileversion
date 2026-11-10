# CodersHub Push Notification Dispatcher (Firebase Spark Plan Compatible)

## Overview
Because your Firebase project is on the **Spark (Free) Plan**, Cloud Functions that trigger on database writes and call outbound network APIs (like FCM/Expo Push) are unavailable.

This standalone Node.js server connects directly to your Firestore database in real-time (`onSnapshot`), listens for new messages, filters them against user notification preferences, and sends push notifications to recipients' registered physical devices via the Expo Push API.

## Requirements
- Node.js 18 or newer
- Firebase Service Account Key JSON (`serviceAccountKey.json`)

## How to Get `serviceAccountKey.json`
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **codershubtest**.
3. Click the gear icon next to Project Overview -> **Project settings**.
4. Go to the **Service accounts** tab.
5. Click **Generate new private key** and download the JSON file.
6. Rename it to `serviceAccountKey.json` and place it in this `server/` directory.

> **Note:** Never commit `serviceAccountKey.json` to version control or include it in client app bundles.

## Installation & Running

```bash
cd server
npm install
npm start
```

## Free Hosting Options (Always-on)
You can deploy this server for free without touching Firebase billing:
- **Render.com** (Free Web Service / Background Worker)
- **Railway.app** (Free Trial / Hobby Tier)
- **Fly.io** (Free Machines)
- Any self-hosted Docker container or VPS

