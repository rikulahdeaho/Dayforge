# Dayforge

Dayforge is an offline-first productivity app built with React Native and Expo. It combines daily habits, scheduled tasks, weekly focus planning, and short end-of-day reflections into one guided flow designed to help users build consistency without overcomplicating their system.

![Dayforge app demo](assets/Dayforge.gif)

## What It Does

Dayforge is structured around a simple daily loop:

- define a weekly focus and track progress toward it
- complete today's habits and tasks
- review weekly momentum with lightweight progress visuals
- finish the day with a short guided reflection

The app is designed to feel calm and intentional rather than overloaded. Most of the product logic is local-first and persists on-device, so the experience stays fast and usable without a backend.

## Core Features

- `Today` dashboard with progress overview, task preview, reflection streak, and weekly trend insights
- `Habits` screen with daily completion tracking, streak-oriented feedback, and protected habits tied to weekly plans
- `Tasks` screen with day-based scheduling, category badges, swipe-to-delete, and weekly focus progress controls
- `Reflection` flow with mood check-in, rotating prompts, saved history, and day-by-day journaling
- onboarding flow for profile setup, weekly goal framing, and starter selections
- offline persistence using `AsyncStorage`

## Tech Stack

- React Native
- Expo
- Expo Router
- TypeScript
- React Context + `useReducer`
- AsyncStorage for local persistence
- Reanimated + gesture handler for motion and interactions

## Repository Structure

```text
.
|-- assets/
|   `-- Dayforge.gif
|-- Dayforge/
|   |-- app/          # Expo Router routes
|   |-- screens/      # screen implementations
|   |-- components/   # reusable UI primitives and app components
|   |-- store/        # app state, reducer, actions, persistence, selectors
|   |-- types/        # domain and UI types
|   `-- package.json
`-- README.md
```

The actual app lives inside [`Dayforge/`](Dayforge).

## Getting Started

### 1. Install dependencies

`cd Dayforge`  
`npm install`

---

### 2. Start the development server

`npx expo start`

---

### 3. Run on a specific platform

`# Android (requires emulator or device)`  
`npx expo start --android`

`# iOS (macOS + Xcode required)`  
`npx expo start --ios`

`# Web`  
`npx expo start --web`

---

## Run with Expo Go (Recommended)

The fastest way to try Dayforge is with Expo Go - no emulator or build required.

### 1. Start the server

`npx expo start`

### 2. Open on your phone

- Install Expo Go from App Store or Google Play
- Scan the QR code shown in the terminal or browser

### 3. Done

The app will open instantly on your device.

---

## Quick Controls

While the dev server is running:

- `a` -> open Android emulator
- `i` -> open iOS simulator (macOS only)
- `w` -> open web version

---

## Notes

- For Expo Go on LAN, your computer and phone should be on the same WiFi network
- No build step required for Expo Go
- Best for quick testing and development

## Available Scripts

From the `Dayforge/` directory:

- `npm start` runs `expo start`
- `npm run android` runs `expo start --android`
- `npm run ios` runs `expo start --ios`
- `npm run web` runs `expo start --web`
- `npm run test:store` compiles and runs the store reducer tests

## Architecture Notes

The app uses a deliberately simple offline-first architecture:

- `store/appState.tsx` wires the global context and public actions
- `store/appState.reducer.ts` handles pure state transitions
- `store/appState.persistence.ts` saves and restores local data
- `store/appState.selectors.ts` provides derived values for screens

This keeps the project easy to understand, easy to extend, and resilient without introducing a heavier state-management layer.

## Current Product Direction

Dayforge currently focuses on:

- personal consistency over team collaboration
- local persistence over cloud sync
- clear guided flows over complex customization

That makes it a good fit for experimenting with habit systems, daily planning UX, and reflection-driven product loops in a mobile-first app.
