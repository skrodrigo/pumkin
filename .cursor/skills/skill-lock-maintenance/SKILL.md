---
name: skill-lock-maintenance
description: Keep `.agents/.skill-lock.json` in sync with `.windsurf/skills/*` whenever creating or updating skills.
metadata:
	author: sintesy
	version: '1.0'
---

# Skill Lock Maintenance

## Goal

Whenever a skill is created or modified under `.windsurf/skills/<skill-name>/SKILL.md`, ensure `.agents/.skill-lock.json` is updated.

## Update checklist

### 1) Compute SHA-256

Compute the SHA-256 of the skill file content.

### 2) Upsert lock entry

In `.agents/.skill-lock.json`, under `skills`:

- Add a new entry when the skill is new
- Update `contentHash` and `updatedAt` when the skill changes

Use the same shape as existing skills:

- `name`: skill name
- `source`: `local`
- `contentHash`: sha256 hex
- `installedAt`: first time the skill is registered
- `updatedAt`: last time the skill content hash changed
- `agents`: keep `windsurf` unless there is a known additional agent
- `method`: `copy`
- `global`: `false`

## Consistency rules

- Skill key must match `name`
- `contentHash` must be lowercase hex
- Do not register rules in `skill-lock.json`
