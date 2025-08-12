# **App Name**: FlashPPI

## Core Features:

- Student Management: Manage student profiles, including personal information and relevant details.
- PPI Editor: Create, update, and manage PPIs with structured sections: Profile, Strengths/Difficulties, Needs, Objectives, Means & Adaptations, Schedule, Evaluation & Indicators, Monitoring & Validation. Includes tabs for 'Evaluation & Evidence' (indicators + observation log/files) and 'Schedule & Support' (weekly grid with conflict detection), and a 'Monitoring / Revisions / Versions' section.
- Library Management: Centralize reusable elements like needs, objectives, and adaptations for quick insertion and consistency across PPIs. Includes 'Add to Library' button from PPIs with sanitization, draft→validated workflow, common metadata (tags, audience, owner, visibility, version, sources), and contextual suggestions (need→objectives→interventions/adaptations/indicators) using the Quick-Pick tool.
- Quick-Pick Insertion: Quickly add pre-defined or commonly used elements into PPIs with context-aware suggestions using the Quick-Pick tool.
- PPI Export: Generate PPI reports in full or summary formats for documentation and sharing purposes. Ensure correct styling and stable page layout. Includes two templates (Full and 2-page Summary), stable pagination, headers/footers + signatures, hash footprint and metadata.
- Role Management: Assign roles (admin, coordinator, teacher, contributor, family) and manage permissions to control access to PPIs. Includes fine-grained logging (creation/reading/modification/export/sharing), family sharing via signed PDF summary link only, data minimization (referencing PAI), EU hosting and retention periods.
- Completeness Rules: Implement completeness rules: alert if objective lacks indicator or means, block export if critical fields are missing, and implement accent-insensitive search.
- Accessibility & Offline Support: Achieve RGAA 4.x AA accessibility, offline PWA functionality with deferred sync and 'pending changes' banner, i18n FR and Europe/Paris timezone.
- Non-Functional Requirements: Meet performance goals (20p export < 10s p95, internal navigation < 1s), implement tests (unit/rule/E2E/a11y), and validate templates with long content.

## Style Guidelines:

- Primary color: Use a calm blue (#64B5F6) to convey trust and focus, aligning with the educational context.
- Background color: Light grey (#F5F5F5), offering a neutral backdrop to ensure readability and reduce eye strain.
- Accent color: Soft green (#81C784) to highlight important actions or updates, adding a touch of positivity.
- Font: 'PT Sans' (sans-serif) for clear readability in both headings and body text. Its modern yet warm style is appropriate for educational contexts.
- Sidebar navigation for main sections (Students, PPIs, Libraries, Meetings, Settings). Central editing area with right panel for quick library insertion.
- Simple, clear icons representing different sections and actions within the application, promoting ease of use.