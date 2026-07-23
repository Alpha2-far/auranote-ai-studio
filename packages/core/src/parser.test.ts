import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanAiUiNoise,
  segmentTextIntoSections,
  extractTitle,
  parseRawText,
} from './parser';
import { escapeHTML, sanitizeHTML } from './sanitize';

test('cleanAiUiNoise retire les scories UI', () => {
  const out = cleanAiUiNoise('ChatGPT a dit :\nBonjour\nCopier la réponse');
  assert.equal(out, 'Bonjour');
});

test('cleanAiUiNoise réduit les sauts de ligne multiples', () => {
  assert.equal(cleanAiUiNoise('a\n\n\n\nb'), 'a\n\nb');
});

test('segmentTextIntoSections détecte les sections numérotées', () => {
  const secs = segmentTextIntoSections('1. Première\nTexte\n2. Deuxième\nAutre');
  assert.equal(secs.length, 2);
  assert.equal(secs[0].number, 1);
  assert.equal(secs[0].title, 'Première');
  assert.equal(secs[1].number, 2);
});

test('segmentTextIntoSections classe les callouts par style', () => {
  const secs = segmentTextIntoSections(
    "1. Titre\nL'intuition clé : ceci est clé\nLa clarification : un détail\nCôté Non-Devs : simple",
  );
  const callouts = secs[0].blocks.filter((b) => b.type === 'callout');
  assert.deepEqual(
    callouts.map((c) => c.style),
    ['intuition', 'clarification', 'perspective'],
  );
});

test('segmentTextIntoSections regroupe le corps multi-ligne d’un callout', () => {
  const secs = segmentTextIntoSections("1. T\nL'intuition clé : ligne1\nligne2");
  const callout = secs[0].blocks.find((b) => b.type === 'callout');
  assert.equal(callout?.content, 'ligne1\nligne2');
});

test('segmentTextIntoSections détecte les puces', () => {
  const secs = segmentTextIntoSections('- un\n- deux\n* trois');
  const bullets = secs[0].blocks.filter((b) => b.type === 'bullet');
  assert.equal(bullets.length, 3);
});

test('extractTitle prend le heading Markdown', () => {
  assert.equal(extractTitle('# Mon titre\ncontenu'), 'Mon titre');
});

test('extractTitle retombe sur la première phrase', () => {
  assert.equal(extractTitle('Ceci est la première phrase. Une autre.'), 'Ceci est la première phrase.');
});

test('parseRawText produit titre + sections + markdown', () => {
  const p = parseRawText('# Sujet\n1. Point A\nDétail');
  assert.equal(p.title, 'Sujet');
  assert.ok(p.sections.length >= 1);
  assert.ok(p.contentMarkdown.includes('Point A'));
});

test('sanitizeHTML retire les scripts', () => {
  assert.equal(sanitizeHTML('<script>alert(1)</script>ok'), 'ok');
});

test('escapeHTML échappe les chevrons et guillemets', () => {
  assert.equal(escapeHTML('<b> "x"'), '&lt;b&gt; &quot;x&quot;');
});
