# Requirements Document

## Introduction

This feature adds drag-and-drop reordering to the "Existing Projects" section of the portfolio admin dashboard. The admin can toggle a reorder mode that makes project cards draggable via SortableJS. When the admin saves the new order, each project's `viewIndex` field is updated in Firebase Firestore. The portfolio frontend already reads `viewIndex` to sort projects for display, so saving a new order is immediately reflected on the public-facing site.

The feature mirrors the existing career timeline reorder functionality already present in the admin page and reuses the same SortableJS library already loaded on the page.

## Glossary

- **Admin_Page**: The portfolio admin dashboard at `pages/admin.html`.
- **Projects_List**: The `#projects-list` container in the Admin_Page that renders all existing projects.
- **Reorder_Mode**: A UI state in which project cards become draggable and a drag handle is shown on each card.
- **Project_Card**: A single rendered project entry inside the Projects_List.
- **Drag_Handle**: A visual grip icon rendered on each Project_Card during Reorder_Mode that the admin uses to drag the card.
- **SortableJS**: The third-party drag-and-drop library already loaded from `cdn.jsdelivr.net/npm/sortablejs@1.15.0`.
- **FirebaseDB**: The global JavaScript object that exposes `getProjects()` and `updateProject(index, project)` for Firestore operations.
- **viewIndex**: A numeric field stored on each project document in Firestore that the portfolio frontend uses to sort projects for display. Lower values appear first.
- **Save_Order_Button**: The `#save-order-btn` button already present in the HTML that triggers `saveProjectsOrderFromInputs()`.
- **Toggle_Button**: The `#toggle-project-reorder-btn` button already present in the HTML that triggers `toggleProjectReorderMode()`.
- **Reorder_Instructions_Banner**: The `#project-reorder-instructions` div already present in the HTML that is shown during Reorder_Mode.

---

## Requirements

### Requirement 1: Toggle Reorder Mode

**User Story:** As an admin, I want to toggle a reorder mode for the projects list, so that I can visually rearrange projects without accidentally triggering edits or deletes.

#### Acceptance Criteria

1. WHEN the admin clicks the Toggle_Button, THE Admin_Page SHALL enter Reorder_Mode.
2. WHILE in Reorder_Mode, THE Toggle_Button SHALL display the label "Cancel Reorder" and use a distinct visual style (e.g., gray background) to indicate the active state.
3. WHILE in Reorder_Mode, THE Reorder_Instructions_Banner SHALL be visible.
4. WHEN the admin clicks the Toggle_Button a second time while in Reorder_Mode, THE Admin_Page SHALL exit Reorder_Mode without saving any order changes.
5. WHEN the Admin_Page exits Reorder_Mode, THE Toggle_Button SHALL revert to its default label "Reorder Projects" and default visual style.
6. WHEN the Admin_Page exits Reorder_Mode, THE Reorder_Instructions_Banner SHALL be hidden.

---

### Requirement 2: Drag-and-Drop Interaction

**User Story:** As an admin, I want to drag project cards to new positions in the list, so that I can set the display order intuitively.

#### Acceptance Criteria

1. WHEN the Admin_Page enters Reorder_Mode, THE Admin_Page SHALL initialize a SortableJS instance on the Projects_List container.
2. WHILE in Reorder_Mode, THE Admin_Page SHALL render a Drag_Handle on each Project_Card.
3. WHILE in Reorder_Mode, THE Admin_Page SHALL make each Project_Card draggable using the SortableJS instance.
4. WHILE in Reorder_Mode, THE Admin_Page SHALL display a ghost placeholder at the drop target position during a drag operation.
5. WHEN the Admin_Page exits Reorder_Mode, THE Admin_Page SHALL destroy the SortableJS instance and remove all Drag_Handles from Project_Cards.
6. WHILE in Reorder_Mode, THE Admin_Page SHALL disable the Edit and Delete buttons on each Project_Card to prevent accidental modifications.

---

### Requirement 3: Save Order Button Visibility

**User Story:** As an admin, I want a clearly visible "Save Order" button that only appears during reorder mode, so that I know when my changes are ready to be persisted.

#### Acceptance Criteria

1. WHEN the Admin_Page enters Reorder_Mode, THE Save_Order_Button SHALL become visible.
2. WHEN the Admin_Page exits Reorder_Mode, THE Save_Order_Button SHALL be hidden.
3. THE Save_Order_Button SHALL remain hidden on initial page load before Reorder_Mode is activated.

---

### Requirement 4: Persist New Order to Firebase

**User Story:** As an admin, I want to save the reordered project list to Firebase, so that the portfolio frontend displays projects in my chosen order.

#### Acceptance Criteria

1. WHEN the admin clicks the Save_Order_Button, THE Admin_Page SHALL read the current visual order of Project_Cards from the Projects_List DOM.
2. WHEN the admin clicks the Save_Order_Button, THE Admin_Page SHALL assign a zero-based `viewIndex` to each project matching its position in the current visual order (first card receives `viewIndex` 0, second receives `viewIndex` 1, and so on).
3. WHEN the admin clicks the Save_Order_Button, THE Admin_Page SHALL call `FirebaseDB.updateProject(index, project)` for every project with its updated `viewIndex` field.
4. WHILE the save operation is in progress, THE Admin_Page SHALL display a loading indicator and disable the Save_Order_Button to prevent duplicate submissions.
5. WHEN all `FirebaseDB.updateProject` calls complete successfully, THE Admin_Page SHALL display a success notification to the admin.
6. WHEN one or more `FirebaseDB.updateProject` calls fail, THE Admin_Page SHALL display an error notification identifying that the save failed and leave Reorder_Mode active so the admin can retry.
7. WHEN the save operation completes successfully, THE Admin_Page SHALL exit Reorder_Mode automatically.

---

### Requirement 5: Frontend Display Order

**User Story:** As a portfolio visitor, I want projects to appear in the order set by the admin, so that the most important projects are shown first.

#### Acceptance Criteria

1. WHEN the portfolio frontend loads projects, THE Frontend SHALL sort projects in ascending order by their `viewIndex` field before rendering.
2. WHEN a project does not have a `viewIndex` field, THE Frontend SHALL treat that project's `viewIndex` as equal to its position in the array returned by `FirebaseDB.getProjects()`.
3. THE Frontend SHALL use `viewIndex` as the URL parameter when linking to project detail pages, so that existing deep links remain valid after a reorder.

---

### Requirement 6: Project Card Rendering in Reorder Mode

**User Story:** As an admin, I want each project card to clearly show its name and a drag handle during reorder mode, so that I can identify and move projects easily.

#### Acceptance Criteria

1. WHILE in Reorder_Mode, each Project_Card SHALL display the project name and a Drag_Handle icon.
2. WHILE in Reorder_Mode, THE Admin_Page SHALL store each project's Firestore array index as a `data-index` attribute on its Project_Card element so that the save operation can identify which Firestore document to update.
3. WHEN the admin drags a Project_Card, THE Admin_Page SHALL provide visual feedback (e.g., a ghost element and a highlight on the drop target) to indicate the drag is in progress.
