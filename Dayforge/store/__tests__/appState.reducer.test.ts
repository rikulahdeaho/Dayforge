import assert from 'node:assert/strict';

import {
  buildReflectionHistoryItem,
  getCurrentMondayBasedDayIndex,
  getDateKeyForMondayBasedDayIndex,
  getTodayDateKey,
} from '../appState.helpers';
import { appReducer, getEmptyAppState, getInitialAppState, mergePersistedAppState } from '../appState.reducer';

function runTests() {
  {
    const initialState = getInitialAppState();
    const todayIndex = getCurrentMondayBasedDayIndex();
    const nextState = appReducer(initialState, {
      type: 'TOGGLE_HABIT',
      habitId: 'read',
      dayIndex: todayIndex,
      dateKey: getDateKeyForMondayBasedDayIndex(todayIndex),
    });
    const habit = nextState.habits.find((item) => item.id === 'read');

    assert.ok(habit);
    assert.equal(habit.completedToday, true);
    assert.equal(habit.weeklyProgress[todayIndex], true);
  }

  {
    const initialState = getInitialAppState();
    const todayIndex = getCurrentMondayBasedDayIndex();
    const nextState = appReducer(initialState, {
      type: 'TOGGLE_TASK',
      taskId: 'task-1',
      dayIndex: todayIndex,
      dateKey: getDateKeyForMondayBasedDayIndex(todayIndex),
    });
    const task = nextState.tasks.find((item) => item.id === 'task-1');

    assert.ok(task);
    assert.equal(task.weeklyProgress[todayIndex], true);
    assert.equal(task.completionByDate[getTodayDateKey()], true);
  }

  {
    const initialState = getInitialAppState();
    const draftState = appReducer(initialState, { type: 'SET_MOOD', mood: 'good' });
    const editedState = appReducer(draftState, {
      type: 'SET_REFLECTION_FIELD',
      field: 'wentWell',
      value: 'Finished the reducer cleanup.',
    });
    const historyItem = buildReflectionHistoryItem({
      draft: editedState.reflectionDraft,
      now: new Date('2026-03-17T10:00:00Z'),
    });
    const nextState = appReducer(editedState, {
      type: 'SAVE_REFLECTION',
      historyItem,
      clearDraft: true,
    });

    assert.equal(nextState.reflectionHistory[0].preview, 'Finished the reducer cleanup.');
    assert.equal(nextState.reflectionDraft.mood, null);
    assert.equal(nextState.reflectionDraft.wentWell, '');
    assert.equal(nextState.reflectionDraft.gratefulFor, '');
  }

  {
    const initialState = getInitialAppState();
    const changedState = appReducer(initialState, {
      type: 'TOGGLE_DARK_MODE_SESSION',
    });
    const resetState = appReducer(changedState, {
      type: 'RESET_STATE',
    });

    assert.deepEqual(resetState, getEmptyAppState());
  }

  {
    const emptyState = getEmptyAppState();
    const restoredState = appReducer(emptyState, {
      type: 'RESTORE_MOCK_DATA',
    });

    assert.deepEqual(restoredState, getInitialAppState());
  }

  {
    const migratedState = mergePersistedAppState({
      user: {
        name: 'Test User',
        membership: 'Free',
        avatar: 'TU',
        personalGoals: 'Stay consistent',
        reminders: 'Evenings',
      },
      preferences: {
        darkMode: false,
      },
    });

    assert.equal(migratedState.preferences.darkMode, false);
    assert.equal(migratedState.user.name, 'Test User');
  }

  {
    const initialState = getInitialAppState();
    const withoutTask = appReducer(initialState, { type: 'REMOVE_TASK', taskId: 'task-1' });
    const withoutHabit = appReducer(withoutTask, { type: 'REMOVE_HABIT', habitId: 'read' });

    assert.equal(withoutTask.tasks.some((task) => task.id === 'task-1'), false);
    assert.equal(withoutHabit.habits.some((habit) => habit.id === 'read'), false);
  }

  console.log('store reducer tests passed');
}

runTests();
