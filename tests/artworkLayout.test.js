import {describe,it,expect} from 'vitest';
import {frames} from '../src/engine';
import {normalizedBox} from '../src/artworkLayout';
describe('artwork safe areas',()=>{
 it('scales normalized artwork zones without changing their proportions',()=>{
  expect(normalizedBox({w:1000,h:1300},.1,.2,.8,.1)).toEqual({x:100,y:260,w:800,h:130});
  expect(normalizedBox({w:2000,h:2600},.1,.2,.8,.1)).toEqual({x:200,y:520,w:1600,h:260});
 });
 it.each(['pocket-camera','crt-memory'])('%s reserves a real gutter between thick bezels',id=>{
  const f=frames.find(f=>f.id===id),s=f.slots;
  expect(s[1].x-s[0].x-s[0].w).toBeGreaterThanOrEqual(80);
  expect(s[2].y-s[0].y-s[0].h).toBeGreaterThanOrEqual(80);
  expect(f.layout.branding.y-Math.max(...s.map(p=>p.y+p.h))).toBeGreaterThan(100);
 });
 it('gives Tape Monitor metadata rows enough space while preserving its crop ratio',()=>{
  const f=frames.find(f=>f.id==='tape-monitor');expect(f.slots).toHaveLength(4);
  expect(f.slots[1].y-f.slots[0].y-f.slots[0].h).toBeGreaterThanOrEqual(60);
  expect(f.slots[0].w/f.slots[0].h).toBeCloseTo(460/245,1);
 });
 it('keeps date and caption bands disjoint on every registered frame',()=>{
  for(const f of frames){expect(f.layout.branding.y+f.layout.branding.h).toBeLessThanOrEqual(f.layout.date.y);expect(f.layout.date.y+f.layout.date.h).toBeLessThan(f.h-20);}
 });
});
