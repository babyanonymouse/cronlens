# Hallmark Design Skill Setup

This project uses Hallmark (from nutlope/hallmark) for opinionated, anti-AI-slop UI design contracts, typography, and styling constraints.

## Global Installation (Recommended)

Install the Hallmark agent skill globally:

```bash
pnpm dlx skills add nutlope/hallmark -g
```

*Alternative with npm:*
```bash
npx skills add nutlope/hallmark -g
```

## Local Project Installation

Alternatively, you can install the skill locally inside this repository:

```bash
pnpm dlx skills add nutlope/hallmark
```

## Verification

After installation, the skill file will reside at:
- Global: `~/.agents/skills/hallmark/SKILL.md` (or `~/.claude/skills/hallmark/SKILL.md`)
- Local: `.agents/skills/hallmark/SKILL.md`

AI coding agents will detect and invoke this skill before generating or modifying any UI components.
