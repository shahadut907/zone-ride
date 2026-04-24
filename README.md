# ZoneRide

A zone-based delivery service app built with React Native and Expo. The app supports three user roles — **Customer**, **Rider**, and **Shop Owner** — each with dedicated screens and navigation flows.

## Prerequisites

Make sure you have the following installed before starting:

1. **[Node.js](https://nodejs.org/)** — v18 or later (LTS recommended)
2. **[Expo Go](https://expo.dev/go)** — Install on your phone (Android / iOS)
   - Or use an Android Emulator / iOS Simulator

> **Note:** `npm` and `npx` come bundled with Node.js automatically.

## Getting Started

### 1. Extract the ZIP

Extract the ZIP file anywhere on your machine, then open a terminal and navigate to the project folder:

```bash
cd ZoneRide
```

> ⚠️ **The `node_modules/` folder is not included in the ZIP** — this is normal. It will be installed in the next step.

### 2. Install dependencies

```bash
npm install
```

This may take a few minutes depending on your internet speed.

### 3. Start the development server

```bash
npx expo start --clear
```

A QR code will appear in the terminal. From there:

- 📱 **Scan the QR code** with the Expo Go app on your phone (phone and PC must be on the same WiFi network)
- Press **`a`** to open on an Android emulator
- Press **`i`** to open on an iOS simulator (macOS only)

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
