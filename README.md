# ZoneRide

A zone-based delivery service app built with React Native and Expo. The app supports three user roles — **Customer**, **Rider**, and **Shop Owner** — each with dedicated screens and navigation flows.

## Prerequisites

আগে এগুলো install করে নাও:

1. **[Node.js](https://nodejs.org/)** — v18 বা তার পরের version (LTS recommended)
2. **[Expo Go](https://expo.dev/go)** — তোমার ফোনে install করো (Android / iOS)
   - অথবা Android Emulator / iOS Simulator ব্যবহার করতে পারো

> **Note:** `npm` এবং `npx` Node.js এর সাথে automatically install হয়ে যায়।

## Getting Started

### 1. ZIP extract করো

ZIP ফাইলটা extract করো যেকোনো জায়গায়, তারপর terminal/command prompt এ সেই folder এ যাও:

```bash
cd ZoneRide
```

> ⚠️ **`node_modules/` ফোল্ডারটি ZIP এ নেই** — এটা normal, পরের step এ install হয়ে যাবে।

### 2. Dependencies install করো

```bash
npm install
```

এতে কয়েক মিনিট লাগতে পারে (internet speed এর উপর depend করে)।

### 3. Development server start করো

```bash
npx expo start --clear
```

Terminal এ একটা QR code আসবে। এরপর:

- 📱 **Expo Go** app দিয়ে QR code **scan** করো (ফোন আর PC একই WiFi তে থাকতে হবে)
- **`a`** press করো Android emulator এ open করতে
- **`i`** press করো iOS simulator এ open করতে (শুধু macOS)

## Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start the Expo development server |
| `npm run android` | Start and open on Android |
| `npm run ios` | Start and open on iOS |
| `npm run web` | Start and open in browser |
| `npx tsc --noEmit` | Type-check without emitting files |

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── cards/           # RequestCard, RiderCard, ShopCard
│   ├── chat/            # ChatBubble
│   ├── common/          # GlassCard, AppButton, ScreenHeader, etc.
│   └── tracking/        # StatusStepper
├── constants/           # Area data, UI labels
├── context/             # AppContext + AppReducer (global state)
├── data/                # Mock JSON datasets (orders, shops, riders, etc.)
├── navigation/          # Stack & tab navigators per role
├── screens/
│   ├── customer/        # Home, requests, chat, tracking, profile
│   ├── rider/           # Requests, delivery details, earnings, profile
│   ├── shared/          # Splash, role selection, notifications
│   └── shop/            # Orders, menu, riders, profile
├── services/            # Mock API layer (mockGet, mockPost, etc.)
├── theme/               # Design tokens, glass styles, shadows
├── types/               # TypeScript type definitions
└── utils/               # Status helpers, area pricing
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81 + Expo SDK 54 |
| Language | TypeScript (strict mode) |
| Navigation | React Navigation 7 (Stack + Bottom Tabs) |
| State | React Context + `useReducer` |
| UI Effects | `expo-blur`, `expo-linear-gradient` |
| Icons | `@expo/vector-icons` (Ionicons) |

## Design System

The app uses an iOS 26-inspired glassmorphism design with:

- Frosted glass cards (`expo-blur` on iOS, translucent fallback on Android)
- Purple-blue gradient backgrounds
- Platform-adaptive shadows (iOS `shadowX` props, Android uses tinted surfaces)
- Neumorphic action buttons

Design tokens are defined in `src/theme/tokens.ts`, glass styles in `src/theme/glass.ts`, and shadow presets in `src/theme/shadows.ts`.

## License

This project is private and not licensed for redistribution.
