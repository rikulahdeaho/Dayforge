# Dayforge Store Notes

This file documents the current state-management structure in Dayforge.

## Goal

The app is intended to stay small, readable, and offline-first.

Because of that, the store is intentionally simple:

- React Context for app-wide access
- `useReducer` for predictable state updates
- `AsyncStorage` for local persistence
- small helper modules instead of an external state library

This is not designed for large-scale backend-driven architecture. It is designed to be easy to understand and safe to change.

## Store Structure

The store code lives in [`store/`](C:/Users/rikul/Documents/Projects/Dayforge/Dayforge/store).

### [`store/appState.tsx`](C:/Users/rikul/Documents/Projects/Dayforge/Dayforge/store/appState.tsx)

Provider wiring and public app actions.

Responsibilities:

- create the React context
- initialize reducer state
- hydrate persisted state on app start
- persist state after updates
- expose screen-facing actions through `useAppState()`

This file should stay thin. If business logic starts growing here, move it into reducer, selectors, or helper modules.

### [`store/appState.types.ts`](C:/Users/rikul/Documents/Projects/Dayforge/Dayforge/store/appState.types.ts)

Central source for:

- `AppState`
- reducer action types

Keep state shape definitions here so the rest of the store stays easy to scan.

### [`store/appState.reducer.ts`](C:/Users/rikul/Documents/Projects/Dayforge/Dayforge/store/appState.reducer.ts)

Pure state logic.

Responsibilities:

- initial app state
- persisted-state merge rules
- reducer transitions

Rules:

- no `AsyncStorage`
- no alerts
- no UI messaging
- no navigation

If a function can be pure, it should live here.

### [`store/appState.persistence.ts`](C:/Users/rikul/Documents/Projects/Dayforge/Dayforge/store/appState.persistence.ts)

Local persistence layer.

Responsibilities:

- read from `AsyncStorage`
- write to `AsyncStorage`
- clear saved state
- wrap persisted payloads with a `version`

The version field exists so future migrations can be added without rewriting the store.

### [`store/appState.selectors.ts`](C:/Users/rikul/Documents/Projects/Dayforge/Dayforge/store/appState.selectors.ts)

Derived read helpers.

Examples:

- completed habits count
- remaining tasks count
- goal progress ratio

Use selectors when the same calculation appears in more than one screen.

## Data Flow

Normal flow:

1. A screen calls an action from `useAppState()`.
2. The provider dispatches an action to the reducer.
3. The reducer returns the next state.
4. The provider persists the updated state.
5. Screens re-render from the new state.

Startup flow:

1. The provider creates default state.
2. The provider loads persisted state from local storage.
3. Persisted data is merged with defaults.
4. The merged state replaces the initial in-memory state.

## What Belongs In Global State

Keep in global state only data that is:

- shared across multiple screens
- meaningful to persist offline
- part of the app's actual data model

Current examples:

- habits
- tasks
- goal progress
- reflection draft/history
- user preferences currently stored in `user`

## What Should Stay Local

Do not put temporary UI behavior into global state unless multiple screens need it.

Keep local:

- modal open/close state
- text input drafts that are not part of saved app data
- animation flags
- temporary success/error display state, if only one screen needs it

Examples already kept local:

- task modal open state
- habit modal open state
- animation state in screen components

## Current Tradeoffs

This structure is intentionally conservative.

Benefits:

- easy to debug
- easy to trace updates
- low dependency count
- well suited for offline-first local data

Limitations:

- one context means broad re-renders
- some screen-facing action helpers still contain small bits of formatting/business logic
- not ideal for complex sync or multi-user collaboration

Those limitations are acceptable for the current product direction.

## Rules For Future Changes

When adding features, use these rules:

1. Start local first.
2. Move data to global state only if multiple screens need it or it must persist.
3. Put pure updates in the reducer.
4. Put persistence concerns in `appState.persistence.ts`.
5. Put repeated calculations in selectors.
6. Avoid adding a new library unless the current structure becomes clearly painful.

## Suggested Next Cleanup

The next low-risk cleanup steps would be:

- move repeated screen calculations to selectors
- separate persisted domain data from transient UI values
- move `darkMode` from `user` to a dedicated `preferences` object
- decide whether selected weekday indexes really belong in persisted global state
- add a small migration helper when storage version `2` is introduced

## If Backend Is Added Later

If the app later adds an API, keep local storage as the source of resilience.

Recommended direction:

- keep the reducer and selectors
- treat remote sync as a separate service layer
- do not mix fetch logic directly into the reducer
- keep the app usable when network is unavailable

That preserves the offline-first design instead of replacing it.
