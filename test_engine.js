// test_engine.js
import assert from 'assert/strict';
import {
  getTimeEstimate,
  computePriorityScore,
  generateTimeline
} from './src/engine.js';

console.log('Running Truth Engine tests…');

// Time enforcement
assert.equal(getTimeEstimate('FOCUS'), 90);
assert.equal(getTimeEstimate('TRIVIAL'), 15);

// Priority logic
const now = new Date();
const A = {
  importance: 3,
  type: 'FOCUS',
  deadline: new Date(now.getTime() + 10 * 3600000).toISOString()
};
const B = {
  importance: 1,
  type: 'TRIVIAL',
  deadline: new Date(now.getTime() + 1 * 3600000).toISOString()
};

assert(computePriorityScore(B, now) > computePriorityScore(A, now));

// Sandwich planner
const timeline = generateTimeline(A, [B]);
assert.equal(timeline.length, 3);
assert.equal(timeline[1].type, 'trivial');

console.log('✓ All tests passed');
