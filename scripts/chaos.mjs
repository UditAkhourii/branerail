#!/usr/bin/env node

/**
 * SystemDesign Chaos Scenario Generator
 * Generates testable 'Chaos' prompts based on your spec's failure modes.
 */

import fs from 'fs';
import path from 'path';

const specPath = process.argv[2];

if (!specPath) {
  console.log('Usage: node scripts/chaos.mjs <path-to-spec.md>');
  process.exit(1);
}

if (!fs.existsSync(specPath)) {
  console.log(`Error: Spec not found at ${specPath}`);
  process.exit(1);
}

const content = fs.readFileSync(specPath, 'utf8');

console.log('================================================');
console.log('🧪  Chaos Prompt Generator');
console.log('================================================\n');

console.log('Generating chaos scenarios based on your spec failure modes...\n');

// Simple extraction logic for failure modes
const failureModes = content.match(/\|[^|]+\|[^|]+|[^|]+|[^|]+|[^|]+\|/g) || [];

console.log('Copy/Paste these prompts to your AI Agent to verify resilience:\n');

console.log('Scenario A (The Dependency Drop):');
console.log(`> "Simulate a 100% failure rate for all external dependencies listed in ${path.basename(specPath)}. Verify that the system degrades gracefully as defined in the 'Failure Modes' section."\n`);

console.log('Scenario B (The Latency Death Spiral):');
console.log(`> "Introduce a 5000ms latency to the write path for state owned by this component. Verify that the 'Adaptive Throttling' or 'Timeout' strategy triggers correctly."\n`);

console.log('Scenario C (The Split Brain):');
console.log(`> "Simulate a network partition where the replica diverges from the single source of truth. Show me the reconciliation log as per Pillar 1."\n`);

console.log('------------------------------------------------');
console.log('Verify Pillar 3: If you delete the component now, کیا ہوگا؟ (What will happen?)');
console.log('------------------------------------------------');
