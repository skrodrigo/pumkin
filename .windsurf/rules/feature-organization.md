---
trigger: model_decision
---
# Rule: Feature Organization

When creating a new feature, always observe the codebase and follow existing patterns:

**Feature structure:**
```
feature-name/
├── data/           # Feature-specific data
├── components/     # Private feature components
└── [implementation] # All feature logic
```

**Sharing rule:**
- If the request/functionality appears in **only one feature**: `data` folder stays inside the feature
- If the request appears in **multiple features**: `data` folder moves to global (`shared/data/` or equivalent) and is only consumed by features

**Never break the existing codebase pattern.** Always replicate the established structure.
