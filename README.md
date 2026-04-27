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

```bash
cd Dayforge
npm install
```

### 2. Start the development server

```bash
npm start
```

You can also launch a specific target:

```bash
npm run android
npm run ios
npm run web
```

## Available Scripts

From the `Dayforge/` directory:

- `npm start` starts the Expo development server
- `npm run android` opens the Android target
- `npm run ios` opens the iOS target
- `npm run web` starts the web build
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
