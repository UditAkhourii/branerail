#!/usr/bin/env node

/**
 * Branerail Skill Auditor
 * Checks the current project for compliance with CTO-level standards.
 */

import fs from 'fs';
import path from 'path';

const PILLARS_CHECKLIST = [
  'CLAUDE.md',
  'specs/',
  'DESIGN.md'
];

console.log('================================================');
console.log('🛡️  Branerail Project Auditor');
console.log('================================================\n');

let score = 0;
const issues = [];

// 1. Check for CLAUDE.md
if (fs.existsSync('CLAUDE.md')) {
  console.log('✅ CLAUDE.md found');
  score += 1;
} else {
  console.log('❌ CLAUDE.md missing (Crucial for agent instructions)');
  issues.push('Create a CLAUDE.md file to guide AI behavior.');
}

// 2. Check for specs directory
if (fs.existsSync('specs') && fs.readdirSync('specs').length > 0) {
  console.log(`✅ specs/ directory found (${fs.readdirSync('specs').length} specs)`);
  score += 1;
} else {
  console.log('❌ No architectural specs found in /specs');
  issues.push('Create architectural specs in a /specs directory before coding.');
}

// 3. Check for DESIGN.md
if (fs.existsSync('DESIGN.md')) {
  console.log('✅ DESIGN.md found');
  score += 1;
} else {
  console.log('⚠️  DESIGN.md missing (Recommended for visual consistency)');
  issues.push('Add a DESIGN.md if your project has a UI component.');
}

console.log('\n------------------------------------------------');
console.log(`Final Score: ${score}/3`);
console.log('------------------------------------------------\n');

if (issues.length > 0) {
  console.log('Next Actions:');
  issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
} else {
  console.log('Project is architecturally sound. Ready for CTO-level growth! 🚀');
}
