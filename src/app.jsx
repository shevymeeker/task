// src/App.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Plus, CheckCircle2, Trash2 } from 'lucide-react';

import {
  LABOR_UNITS,
  computePriorityScore,
  generateTimeline,
  DurableStore
} from './engine.js';

const store = new DurableStore('truth_engine_v1');

const AFFIRMATIONS = [
  "Reality reconciled.",
  "A quiet victory.",
  "Momentum maintained.",
  "One less obligation."
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [now, setNow] = useState(new Date());
  const [feedback, setFeedback] = useState('');

  // Load persisted state
  useEffect(() => {
    store.load().then(setTasks);
  }, []);

  // Persist on change
  useEffect(() => {
    store.save(tasks);
  }, [tasks]);

  // Heartbeat
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(i);
  }, []);

  const queue = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'completed')
      .map(t => ({
        ...t,
        score: computePriorityScore(t, now)
      }))
      .sort((a, b) => b.score - a.score);
  }, [tasks, now]);

  const activeTask = queue[0];
  const timeline = activeTask
    ? generateTimeline(activeTask, queue.slice(1))
    : [];

  function complete(id) {
    setTasks(t =>
      t.map(x => x.id === id ? { ...x, status: 'completed' } : x)
    );
    setFeedback(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
    setTimeout(() => setFeedback(''), 3000);
  }

  function addDummyTask() {
    const deadline = new Date(Date.now() + 2 * 3600000).toISOString();
    setTasks(t => [
      ...t,
      {
        id: crypto.randomUUID(),
        title: 'Sample Task',
        importance: 2,
        type: 'FOCUS',
        deadline,
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ]);
  }

  return (
    <div style={{ padding: 32, fontFamily: 'system-ui' }}>
      <h1>Truth Engine</h1>

      <button onClick={addDummyTask}>
        <Plus /> Add Task
      </button>

      {activeTask && (
        <>
          <h2>Active</h2>
          <h3>{activeTask.title}</h3>

          <ul>
            {timeline.map((step, i) => (
              <li key={i}>
                {step.type === 'focus' && `Focus ${step.part} (${step.mins}m)`}
                {step.type === 'trivial' && `Trivial: ${step.task.title}`}
                {step.type === 'break' && `Break (${step.mins}m)`}
              </li>
            ))}
          </ul>

          <button onClick={() => complete(activeTask.id)}>
            <CheckCircle2 /> Complete
          </button>
        </>
      )}

      {feedback && <p><strong>{feedback}</strong></p>}

      <h2>Queue</h2>
      <ul>
        {queue.slice(1).map(t => (
          <li key={t.id}>
            {t.title}
            <button onClick={() => complete(t.id)}>
              <Trash2 />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
