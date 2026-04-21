# Tasks

## Task List

- [x] 1. Add module-level state variables for project reorder
  - [x] 1.1 Declare `projectSortableInstance` and `isProjectReorderMode` variables at the top of `assets/js/admin.js` alongside the existing `sortableInstance` and `isReorderMode` variables

- [x] 2. Implement `renderProjectReorderCards(projects)` helper
  - [x] 2.1 Clear `#projects-list` and render one lightweight card per project containing a `.drag-handle` icon, the project name, and a `data-index` attribute set to the project's array index
  - [x] 2.2 Ensure Edit and Delete buttons are not rendered on reorder cards

- [x] 3. Implement `toggleProjectReorderMode()` function
  - [x] 3.1 On entering reorder mode: fetch projects via `FirebaseDB.getProjects()`, call `renderProjectReorderCards()`, initialise a `Sortable` instance on `#projects-list` with `handle: '.drag-handle'`, `animation: 150`, `ghostClass: 'sortable-ghost'`, show `#save-order-btn` and `#project-reorder-instructions`, update `#toggle-project-reorder-btn` label to "Cancel Reorder" with gray styling
  - [x] 3.2 On exiting reorder mode (cancel): destroy the `Sortable` instance, call `loadProjects()` to restore normal card view, hide `#save-order-btn` and `#project-reorder-instructions`, restore `#toggle-project-reorder-btn` label to "Reorder Projects" with blue styling

- [x] 4. Implement `saveProjectsOrderFromInputs()` function
  - [x] 4.1 Read the current DOM order of `.project-reorder-card` elements and extract `data-index` from each card
  - [x] 4.2 Fetch full project objects from Firebase via `FirebaseDB.getProjects()`, then assign `viewIndex` values (0, 1, 2, …) matching each card's DOM position
  - [x] 4.3 Call `FirebaseDB.updateProject(originalIndex, {...project, viewIndex})` for every project using `Promise.all` for parallel writes; show loading indicator and disable `#save-order-btn` during the operation
  - [x] 4.4 On success: hide loading, show success alert, call `toggleProjectReorderMode()` to exit reorder mode
  - [x] 4.5 On failure: hide loading, show error alert, keep reorder mode active so the admin can retry

- [x] 5. Update frontend sort logic in `assets/js/main.js`
  - [x] 5.1 After fetching projects, sort the array ascending by `viewIndex` before rendering; for projects missing `viewIndex`, use their array position as the fallback sort key
  - [x] 5.2 Verify that the project detail page URL uses `viewIndex` as the identifier parameter (or confirm the existing implementation already does this)
