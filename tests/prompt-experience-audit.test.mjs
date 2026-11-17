import test from 'node:test';
import assert from 'node:assert/strict';
import {runExperienceAudit} from '../tools/check-runner-experience.mjs';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {pilotCounter} from '../tools/story-pilot.mjs';

test('audit records seeded route actions and states without claiming display FPS',()=>{
 const report=runExperienceAudit(core,pilotCounter,{widths:[480],seeds:[417],rates:[60],limit:18,windowSeconds:10});
 assert.equal(report.runs.length,1);
 const [run]=report.runs;
 assert.equal(run.seed,417);assert.equal(run.width,480);assert.equal(run.rate,60);
 assert.equal(run.status,'running');assert.equal(run.activeSeconds,18);
 assert.equal(run.stages.brasilia.sampleSeconds,10);
 assert.ok(run.stages.brasilia.controls.jump>0);
 assert.ok(run.stages.brasilia.projectedContacts>0);
 assert.ok(run.kernel.stepP95ms>=0);
 assert.match(report.note,/não mede FPS/i);
});
