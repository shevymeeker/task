// src/engine.js

// -------------------------------
// Standard Units of Labor (SUL)
// -------------------------------
export const LABOR_UNITS = {
  TRIVIAL:  { mins: 15, weight: 1 },
  STANDARD: { mins: 45, weight: 3 },
  FOCUS:    { mins: 90, weight: 6 },
  EPIC:     { mins: 240, weight: 15 }
};

// -------------------------------
// Importance Weights
// -------------------------------
export const IMPORTANCE_WEIGHTS = {
  1: { label: 'Minor', factor: 1 },
  2: { label: 'Relevant', factor: 1.8 },
  3: { label: 'Critical', factor: 3.5 },
  4: { label: 'Absolute', factor: 6 }
};

// -------------------------------
// Pure Time Estimator (Non-Negotiable)
// -------------------------------
export function getTimeEstimate(type) {
  return LABOR_UNITS[type].mins;
}

// -------------------------------
// DurableStore (async-shaped)
// -------------------------------
export class DurableStore {
  constructor(key) {
    this.key = key;
  }

  async load() {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(this.key);
    return raw ? JSON.parse(raw) : [];
  }

  async save(data) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.key, JSON.stringify(data));
  }
}

// -------------------------------
// Gravity-Based Priority Scorer
// -------------------------------
export function computePriorityScore(task, now = new Date()) {
  const deadline = new Date(task.deadline);
  const hoursRemaining = (deadline - now) / 3600000;

  const gravity = 1 / Math.max(hoursRemaining, 0.5);
  const importance = IMPORTANCE_WEIGHTS[task.importance].factor;
  const complexity = LABOR_UNITS[task.type].weight;

  return (importance * gravity) / complexity;
}

// -------------------------------
// Sandwich Execution Planner
// -------------------------------
export function generateTimeline(activeTask, queue) {
  if (activeTask.type !== 'FOCUS') {
    return [{ type: 'task', task: activeTask }];
  }

  const trivial = queue.find(t => t.type === 'TRIVIAL');

  return [
    { type: 'focus', mins: 45, part: 1 },
    trivial
      ? { type: 'trivial', task: trivial }
      : { type: 'break', mins: 10 },
    { type: 'focus', mins: 45, part: 2 }
  ];
}
