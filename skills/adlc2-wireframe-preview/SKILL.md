---
name: adlc2-wireframe-preview
description: "ADLC v2 Phase 2.5 — Render a non-functional wireframe of the confirmed spec so the business user can visually confirm layout before any code is written or CI minute spent. Called exclusively by adlc2-orchestrator after spec confirmation and before issue creation. Never triggered directly by user messages."
---

# Phase 2.5 — Wireframe Preview

Visual confirmation before the build. Changes here are free.

## Render rules
- Match every input, output, and control named in the spec — exactly
- Flat components only: labels, inputs, buttons, result cards
- Realistic domain placeholder values (no lorem ipsum)
- Clearly badged WIREFRAME — never call it "the app"
- No working logic, no calculations, no gradients/shadows
- Confirm button → sendPrompt('looks good, build it')
- Change button → sendPrompt('I want to change something before building')

## Structure

```html
<div style="background: var(--color-background-secondary); border-radius: var(--border-radius-lg); padding: 1.5rem;">
  <div style="display:flex; align-items:center; gap:8px; margin-bottom:1.5rem;">
    <span style="font-size:11px; font-weight:500; background: var(--color-background-warning); color: var(--color-text-warning); padding:3px 10px; border-radius: var(--border-radius-md);">WIREFRAME</span>
    <span style="font-size:13px; color: var(--color-text-secondary);">Layout preview only — not working code</span>
  </div>
  <div style="background: var(--color-background-primary); border:0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); padding:1.25rem; margin-bottom:1rem;">
    <p style="font-size:16px; font-weight:500; color: var(--color-text-primary); margin:0 0 1.25rem;">[App title]</p>
    <!-- per spec input: -->
    <div style="margin-bottom:1rem;">
      <label style="font-size:13px; color: var(--color-text-secondary); display:block; margin-bottom:4px;">[Input label]</label>
      <input type="text" value="[placeholder]" disabled style="width:100%; opacity:0.7;" />
    </div>
    <button disabled style="opacity:0.6; margin-top:0.5rem;">[Primary action]</button>
  </div>
  <!-- per spec output: -->
  <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:12px; margin-bottom:1.5rem;">
    <div style="background: var(--color-background-secondary); border-radius: var(--border-radius-md); padding:1rem;">
      <p style="font-size:13px; color: var(--color-text-secondary); margin:0 0 4px;">[Output label]</p>
      <p style="font-size:24px; font-weight:500; color: var(--color-text-primary); margin:0;">[Value]</p>
    </div>
  </div>
  <div style="display:flex; gap:8px;">
    <button onclick="sendPrompt('looks good, build it')" style="flex:1;">Looks good — build it ↗</button>
    <button onclick="sendPrompt('I want to change something before building')" style="flex:1;">Change something ↗</button>
  </div>
</div>
```

Accompanying message:
```
Layout preview only — no logic yet. Match what you had in mind?
If yes I'll kick off the build; if not, tell me what to change.
```

## Response handling — max 5 rounds
Confirm → orchestrator creates the issue (adlc-generate label) → Phase 3.
Change → layout-only: re-render · scope: update spec then re-render. Increment round.
Round 5 reached → apply, re-render once, then build unconditionally:
"Changes applied. Building now — further tweaks after the live preview."

## Exit
Confirmed OR 5 rounds → orchestrator creates GitHub issue → Phase 3.
