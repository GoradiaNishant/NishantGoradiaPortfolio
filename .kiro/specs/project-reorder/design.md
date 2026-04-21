# Design Document: Project Reorder

## Overview

This feature adds drag-and-drop reordering to the "Existing Projects" section of the portfolio admin dashboard (`pages/admin.html`). It mirrors the existing career timeline reorder functionality already present in `admin.js` (`toggleReorderMode`) and reuses the same SortableJS 1.15.0 library already loaded on the page.

When the admin activates Reorder Mode, project cards become draggable via SortableJS. Saving the new order writes a zero-based `viewIndex` field to each project document in Firestore via `FirebaseDB.updateProject(index, project)`. The portfolio frontend already reads `viewIndex` to sort projects for display, so the change is immediately reflected on the public-facing site.

All HTML hooks (`#toggle-project-reorder-btn`, `#save-order-btn`, `#project-reorder-instructions`, `#projects-list`) are already present in `pages/admin.html`. The implementation is purely a JavaScript addition to `assets/js/admin.js`.

---

## Architecture

The feature is a client-side JavaScript enhancement with no new files, no new dependencies, and no backend changes.

```
pages/admin.html          (HTML already in place — no changes needed)
assets/js/admin.js        (new functions added here)
config/firebase-config.js (FirebaseDB.updateProject used as-is)
```

### Control Flow

```
Admin clicks #toggle-project-reorder-btn
        │
        ▼
toggleProjectReorderMode()
        │
        ├─ entering mode ──► re-render #projects-list in reorder card format
        │                    initialize Sortable on #projects-list
        │                    show #save-order-btn, #project-reorder-instructions
        │                    update button label / style
        │
        └─ exiting mode  ──► destroy Sortable instance
                             reload #projects-list in normal card format (loadProjects())
                             hide #save-order-btn, #project-reorder-instructions
                             restore button label / style

Admin clicks #save-order-btn
        │
        ▼
saveProjectsOrderFromInputs()
        │
        ├─ read data-index attributes from DOM cards in current visual order
        ├─ assign viewIndex 0, 1, 2, … to each project
        ├─ call FirebaseDB.updateProject(index, {...project, viewIndex}) for each
        ├─ on success ──► exit reorder mode, show success alert
        └─ on failure ──► show error alert, stay in reorder mode
```

---

## Components and Interfaces

### New Functions in `assets/js/admin.js`

#### `toggleProjectReorderMode()`

Toggles the `isProjectReorderMode` boolean. On entry:
- Fetches the current project list from Firebase (or reads from a module-level cache populated by the last `loadProjects()` call).
- Re-renders `#projects-list` with lightweight reorder cards (project name + drag handle only; Edit/Delete buttons hidden).
- Stamps each card with `data-index="<arrayIndex>"` so the save function can identify which Firestore document to update.
- Initialises a `Sortable` instance on `#projects-list` with `handle: '.drag-handle'`, `animation: 150`, `ghostClass: 'sortable-ghost'`.
- Shows `#save-order-btn` and `#project-reorder-instructions`.
- Changes `#toggle-project-reorder-btn` label to "Cancel Reorder" and applies a gray style.

On exit (cancel):
- Destroys the `Sortable` instance.
- Calls `loadProjects()` to restore the normal card view.
- Hides `#save-order-btn` and `#project-reorder-instructions`.
- Restores `#toggle-project-reorder-btn` to its default label and blue style.

#### `renderProjectReorderCards(projects)`

A private helper that clears `#projects-list` and renders one lightweight card per project:

```html
<div class="project-reorder-card border border-gray-200 rounded-lg p-3 mb-2 flex items-center space-x-3 bg-white cursor-move"
     data-index="<arrayIndex>">
  <span class="drag-handle text-gray-400 text-xl select-none">⠿</span>
  <span class="font-medium text-gray-800 flex-1"><projectName></span>
</div>
```

#### `saveProjectsOrderFromInputs()`

Reads the current DOM order of `.project-reorder-card` elements, extracts `data-index` from each, fetches the full project objects from Firebase, assigns `viewIndex` values (0, 1, 2, …), and calls `FirebaseDB.updateProject(originalIndex, updatedProject)` for every project. Uses `Promise.all` for parallel writes. Shows a loading indicator during the operation and disables `#save-order-btn`. On success, exits reorder mode. On failure, shows an error and stays in reorder mode.

### Module-Level State

Two new variables are added alongside the existing `sortableInstance` and `isReorderMode`:

```js
let projectSortableInstance = null;   // Sortable instance for #projects-list
let isProjectReorderMode = false;     // Whether project reorder mode is active
```

### Existing Infrastructure Used

| Symbol | Source | Role |
|---|---|---|
| `FirebaseDB.getProjects()` | `config/firebase-config.js` | Fetch project array |
| `FirebaseDB.updateProject(index, project)` | `config/firebase-config.js` | Persist updated `viewIndex` |
| `loadProjects()` | `assets/js/admin.js` | Restore normal card view after reorder |
| `showLoading(msg)` / `hideLoading()` | `assets/js/admin.js` | Loading overlay |
| `Sortable` | SortableJS 1.15.0 (CDN) | Drag-and-drop |
| `.sortable-ghost` / `.sortable-chosen` | `assets/css/admin.css` | Drag visual feedback |

---

## Data Models

### `viewIndex` Field

`viewIndex` is a non-negative integer stored directly on each project document in the Firestore `projects` collection. It is the only field this feature adds or modifies.

```
projects/project-0  { name, description, …, viewIndex: 0 }
projects/project-1  { name, description, …, viewIndex: 1 }
projects/project-2  { name, description, …, viewIndex: 2 }
```

The save operation merges `viewIndex` into the full project object before calling `updateProject`, so no other fields are lost.

### Frontend Sort Contract

The portfolio frontend (`assets/js/main.js`) already sorts projects by `viewIndex` before rendering. Projects without a `viewIndex` field fall back to their array position returned by `getProjects()`, which preserves backward compatibility.

### DOM Data Attribute

Each reorder card carries `data-index="<n>"` where `n` is the zero-based position of the project in the array returned by `FirebaseDB.getProjects()`. This is the same index passed to `FirebaseDB.updateProject(index, project)`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: viewIndex assignment produces a zero-based contiguous sequence matching visual position

*For any* array of N projects arranged in any visual order, after `saveProjectsOrderFromInputs()` runs, the project at DOM position `i` SHALL have `viewIndex === i`, and the complete set of assigned `viewIndex` values SHALL equal `{0, 1, 2, …, N-1}` with no gaps or duplicates. Furthermore, `FirebaseDB.updateProject` SHALL be called exactly N times, once per project, each time passing the correct `viewIndex` for that project's position.

**Validates: Requirements 4.2, 4.3**

### Property 2: Frontend sort order is ascending by viewIndex

*For any* array of projects that each have a `viewIndex` field, sorting the array by `viewIndex` ascending SHALL produce a sequence where every project at position `i` has a `viewIndex` less than or equal to the `viewIndex` of the project at position `i+1`.

**Validates: Requirements 5.1**

### Property 3: Missing viewIndex falls back to array position

*For any* mixed array of projects where some have a `viewIndex` field and some do not, applying the frontend sort/fallback logic SHALL include every project exactly once in the output, with projects missing `viewIndex` treated as if their `viewIndex` equals their original array position.

**Validates: Requirements 5.2**

### Property 4: Detail page URL uses viewIndex as the project identifier

*For any* project with a given `viewIndex`, the URL generated for its detail page SHALL contain that `viewIndex` as the query parameter, so that the link remains stable after a reorder operation.

**Validates: Requirements 5.3**

### Property 5: Reorder cards render name and drag handle, and omit Edit/Delete buttons

*For any* array of N projects (N ≥ 1), when the admin enters Reorder Mode, every rendered project card SHALL contain the project's name and a `.drag-handle` element, and SHALL NOT contain an Edit button or a Delete button.

**Validates: Requirements 2.2, 2.6, 6.1**

### Property 6: data-index attribute matches original array index

*For any* array of N projects, when the admin enters Reorder Mode, the `data-index` attribute on the card rendered for the project at array position `i` SHALL equal `i`.

**Validates: Requirements 6.2**

---

## Error Handling

| Scenario | Handling |
|---|---|
| One or more `updateProject` calls fail during save | `Promise.all` rejects; error alert shown; reorder mode stays active so admin can retry |
| `getProjects()` fails when entering reorder mode | Error caught; alert shown; reorder mode not entered |
| No projects exist when entering reorder mode | Empty state rendered; Sortable initialised on empty container (no-op) |
| Admin cancels mid-drag | Sortable handles this natively; no state is persisted until Save is clicked |
| `loadProjects()` fails after successful save | Error is surfaced by the existing `loadProjects` error handler; reorder mode has already exited |

---

## Testing Strategy

This feature is a UI interaction layer over Firebase writes. The core testable logic is the `viewIndex` assignment algorithm — a pure mapping from DOM order to integer sequence. Property-based testing is appropriate for this logic.

### Unit / Example Tests

- Toggle button label and style change on enter/exit reorder mode.
- Save Order button visibility: hidden on load, visible in reorder mode, hidden after exit.
- Reorder instructions banner visibility mirrors Save Order button.
- Edit and Delete buttons are absent from cards rendered in reorder mode.
- Drag handle element is present on each card in reorder mode.
- `data-index` attribute is correctly stamped on each card.
- Cancelling reorder mode calls `loadProjects()` and does not call `updateProject`.
- Successful save exits reorder mode and shows success alert.
- Failed save keeps reorder mode active and shows error alert.

### Property-Based Tests

Use a property-based testing library (e.g., [fast-check](https://github.com/dubzzz/fast-check) for JavaScript).

Each test runs a minimum of 100 iterations.

**Feature: project-reorder, Property 1: viewIndex assignment is a zero-based contiguous sequence**

Generate a random array of N projects (N between 1 and 20), shuffle them into a random visual order, run the `viewIndex` assignment logic, and assert that the resulting `viewIndex` values form the set `{0, 1, …, N-1}`.

**Feature: project-reorder, Property 2: viewIndex reflects visual order**

Generate a random permutation of project cards. Run the assignment logic. Assert that for every position `i`, the project at position `i` has `viewIndex === i`.

**Feature: project-reorder, Property 3: Frontend sort order matches saved viewIndex order**

Generate a random array of projects with random `viewIndex` values (a valid permutation of `{0, …, N-1}`). Sort by `viewIndex` ascending. Assert the resulting order matches the order implied by the `viewIndex` values.

**Feature: project-reorder, Property 4: Missing viewIndex falls back to array position**

Generate a random array of projects where some have `viewIndex` and some do not. Apply the frontend fallback logic. Assert every project appears in the sorted output exactly once.
