# Dayforge Architecture ASCII

Selkokielinen ASCII-kuva Dayforgen rakenteesta.

```text
+------------------------------------------------------+
|                    Dayforge App                      |
|         React Native + Expo Router + Context         |
+------------------------------------------------------+

                 APP ENTRY / ROOT
+------------------------------------------------------+
| app/_layout.tsx                                      |
| - lataa fontit                                       |
| - nayttaa splash/loading                             |
| - kaarii koko appin AppStateProvideriin              |
| - kaarii UI:n Gesture/SafeArea/Theme providerien     |
|   sisaan                                             |
| - rakentaa navigaation (tabs + modals)               |
| - nayttaa globaalin Snackbar-viestin                 |
+--------------------------+---------------------------+
                           |
                           v
                 YHTEINEN SOVELLUSDATA
+------------------------------------------------------+
| store/appState.tsx                                   |
| - React Context                                      |
| - pitaa koko sovelluksen yhteista dataa kasissa      |
| - lataa tallennetun datan appin kaynnistyessa        |
| - tallentaa muutokset laitteen muistiin              |
| - tarjoaa screenien kayttamat toiminnot              |
| - ohjaa successMessage-viesteja                      |
+--------------------------+---------------------------+
                           |
                           v
                 DATAN MUUTOSSANNOT
+------------------------------------------------------+
| store/appState.reducer.ts                            |
| - initial/empty state                                |
| - mergePersistedAppState()                           |
| - paattaa miten data muuttuu                         |
| - ei piirra UI:ta                                    |
| - ei tallenna dataa itse                             |
+--------------------------+---------------------------+
                           |
                           +-------------------+-------------------+
                           |                   |                   |
                           v                   v                   v
                APUTIEDOT               TALLENNUS             TOIMINNOT
+------------------------------+   +------------------------------+   +------------------------------+
| store/appState.selectors.ts  |   | store/appState.persistence.ts|   | store/actions/...            |
| - laskee nakymille valmiita  |   | - lukee ja kirjoittaa        |   | - rakentaa uusia entiteetteja|
|   arvoja                     |   |   dataa AsyncStorageen       |   | - koostaa onboarding-statea  |
| - esim. progress ja streak   |   | - ajaa vanhan datan          |   | - valmistelee reflectionit   |
|                              |   |   migraation                 |   | - goal/task/habit helperit   |
+------------------------------+   +------------------------------+   +------------------------------+

                           |
                           v
                 YHTEISET STORE-UTILIT
+------------------------------------------------------+
| store/utils/...                                      |
| - date helpers: dateKeyt, viikot, paivat             |
| - id helperit                                        |
| - reflection promptit ja mappaukset                  |
+------------------------------------------------------+

                 MITA DATAA APPISSA ON
+------------------------------------------------------+
| types/domain.ts + store/appState.types.ts            |
| - hasCompletedOnboarding                             |
| - User                                               |
| - Preferences                                        |
| - Habit                                              |
| - Task                                               |
| - Goal                                               |
| - ReflectionDraft / ReflectionHistory                |
| - WeeklyPlansByWeek                                  |
+------------------------------------------------------+

                 NAKYMAT
+------------------------------------------------------+
| app/... reitit -> screens/... nakymat                |
|                                                      |
| (tabs)/index       -> TodayScreen dashboard          |
| (tabs)/task        -> TasksScreen taskit             |
| (tabs)/habits      -> HabitsScreen habitit           |
| (tabs)/reflect     -> ReflectionScreen draft/history |
| (tabs)/profile     -> ProfileScreen asetukset        |
| onboarding         -> OnboardingScreen alkuasetukset |
| add-task           -> AddTaskScreen modal            |
| add-habit          -> AddHabitScreen modal           |
| edit-weekly-focus  -> EditWeeklyFocusScreen modal    |
| day-summary        -> DaySummaryScreen modal         |
| schedule-picker    -> SchedulePickerScreen modal     |
| schedule-day       -> ScheduleDayScreen modal        |
| weekly-plan        -> WeeklyPlanScreen modal         |
| reflections        -> ReflectionsScreen modal        |
| reflection/[id]    -> ReflectionDetailScreen modal   |
+------------------------------------------------------+
                           |
                           v
                 UUDELLEENKAYTETTAVAT UI-OSAT
+------------------------------------------------------+
| components/dayforge/...                              |
| - cardit, napit, chartit, snackbar, pickerit         |
| - nayttavat asioita ruudulla                         |
| - saavat tarvitsemansa datan ylempaa                 |
+------------------------------------------------------+
```

Yksinkertainen ajatusmalli:

- `app/_layout.tsx` kaynnistaa appin
- `store/appState.tsx` pitaa yhteisen datan kasissa
- `store/appState.reducer.ts` tekee varsinaiset state-muutokset
- `store/actions/...` ja `store/utils/...` kokoavat ja jakavat store-logiikkaa pienempiin osiin
- `screens/...` nayttavat datan kayttajalle
- `components/...` ovat uudelleenkaytettavia rakennuspalikoita
- `appState.persistence.ts` varmistaa, etta data ei katoa appin sulkemisessa ja ajaa migraatiopolun
- `app/(tabs)/_layout.tsx` ohjaa tabit ja redirectaa onboardingiin, jos alkuasetukset puuttuvat

Keskeiset tiedostot:

- `app/_layout.tsx`
- `app/(tabs)/_layout.tsx`
- `store/appState.tsx`
- `store/appState.reducer.ts`
- `store/appState.persistence.ts`
- `store/appState.selectors.ts`
- `store/appState.types.ts`
- `store/actions/...`
- `store/utils/...`
- `types/domain.ts`
