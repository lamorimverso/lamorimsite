import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {ARCHIVE_VOICES} from '../tanahoraflavio/runner-voice-data.mjs';
for(const actor of ['soraya','dilma','dino','simone','xandao','boulos'])test(actor+' conserva dois arquivos de acervo identificados e íntegros',()=>{
 const ids=Object.keys(ARCHIVE_VOICES).filter(id=>id.startsWith('archive-'+actor+'-'));assert.equal(ids.length,2);
 for(const id of ids){const clip=ARCHIVE_VOICES[id];assert.ok(clip.speaker&&clip.quote&&clip.context&&clip.source&&clip.sourceMedia&&clip.verification);
  assert.ok(clip.toSeconds>clip.fromSeconds);assert.ok(clip.durationSeconds<9);
  const bytes=readFileSync(new URL('../tanahoraflavio/'+clip.file,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),clip.sha256);
 }
});
