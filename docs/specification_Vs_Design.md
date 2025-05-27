
---

## ✅ Bloc 1 – Suivi de projet

### 🔍 Spec Functionality vs Figma UI

| **Feature**                        | **Spec Description**                                     | **Figma Status**                                         | **Comments**                                                                                   |
| ---------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **1. Auto checklists**             | Checklist auto-generated based on project type/context   | ✅ Present (Checklist templates shown)                    | **Partially aligned** — Design includes templates, but no indication of auto-generation logic. |
| **2. Smart task assignment**       | Assign tasks based on skills, availability, history      | ❌ Not visible                                            | **Missing in design** — No UI for auto-assignment config or logic indicators.                  |
| **3. Real-time tracking**          | Live task status, project progress, key indicators       | ✅ Present (dashboard widgets, task boards)               | Aligned — shows dynamic progress status and summary KPIs.                                      |
| **4. Kanban/Gantt/List views**     | Multiple views to manage tasks                           | ✅ Kanban clearly present; Gantt/List not shown           | **Partial** — Kanban supported; no visual confirmation of Gantt or List in Figma.              |
| **5. Custom task statuses**        | Ability to define your own task statuses                 | ❌ Not evident                                            | **Missing** — Task statuses appear static (To Do, In Progress, Done).                          |
| **6. Smart reminders**             | Automated reminders before delays, with notifications    | ❌ Not visible                                            | No UI for configuring reminders or viewing upcoming alerts.                                    |
| **7. Project templates**           | Start projects from predefined templates                 | ✅ Present (new project flow includes template selection) | ✅ Aligned — template reuse clearly supported.                                                  |
| **8. Forecasting/simulation (AI)** | Predict impact on time, cost, resources using AI         | ❌ Not shown                                              | **Missing in UI** — No analytics or simulation panels for forecasting.                         |
| **9. Custom dashboards**           | Users can create personal dashboards with chosen widgets | ❌ Not shown                                              | **Missing** — Dashboards shown are generic; no drag/drop widget logic or customization UI.     |
| **10. Real-time feedback**         | Team can submit feedback or issues on tasks directly     | ❌ Not visible                                            | **Missing** — No feedback button or comment system per task (distinct from chat).              |

---

### ✅ Summary of Bloc 1 Comparison

#### ✅ **What is consistent and implemented:**

* **Real-time tracking** via dashboard and Kanban views.
* **Checklist templates** are usable during project creation.
* **Project templates** supported during creation workflow.

#### ⚠️ **What is partially implemented or unclear:**

* **Kanban view** is present but **Gantt/List views** are not visible.
* **Checklist generation** is manual, not smart.
* **No indication of user-defined custom statuses**.

#### ❌ **What is missing from the design (though required by the specs):**

* **Smart task assignment** based on skill/availability.
* **Smart reminders** for overdue/critical tasks.
* **AI-based forecasting/simulation** panels.
* **Customizable dashboards (widgets)**.
* **Real-time task-level feedback/comments system**.

---

### 🔧 Recommendations:

* Clarify with the design team whether **Gantt/List views**, **forecasting**, or **custom dashboards** are planned for a future sprint or omitted.
* Backlog items should be created for:

  * **Custom statuses configuration UI**
  * **Reminder scheduling system**
  * **Feedback submission on tasks**
  * **AI prediction and simulation modules**



---

## ✅ Bloc 2 – Gestion documentaire

We compare the **expected features** from the specs with what’s actually visible and supported in the Figma UI design (light mode only).

---

### 🔍 Spec Functionality vs Figma UI

| **Feature**                                 | **Spec Description**                                             | **Figma Status**                     | **Comments**                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| **1. Centralized project document storage** | Unique space per project to store all relevant documents         | ✅ Clearly present in Project Details | Files tab exists per project, with upload, list, and preview functions.         |
| **2. AI-based auto classification**         | Automatic classification of files (contract, offer, image, etc.) | ❌ Not visible                        | **Missing in design** — no sign of intelligent tagging or category suggestions. |
| **3. Semantic search**                      | Contextual or content-based document search                      | ❌ Not shown                          | Only basic file list and possibly name-based search visible.                    |
| **4. Versioning**                           | View/change history and rollback to previous versions            | ❌ Not apparent                       | No UI elements like “Version History”, timestamps, or “Revert” options.         |
| **5. Comments and annotations**             | Users can comment or annotate directly on documents              | ❌ Not visible                        | **Missing** — No comment sidebar or annotation markers in file viewer.          |
| **6. Notification on document changes**     | Alert when a document is updated or commented on                 | ❌ Not shown                          | No document-specific alert configuration or indicators found.                   |
| **7. Electronic signature support**         | Built-in feature for signing documents digitally                 | ❌ Not present                        | **Completely absent** in the UI — no "Sign", "Approve", or similar actions.     |

---

### ✅ Summary of Bloc 2 Comparison

#### ✅ **What is consistent and implemented:**

* **Centralized storage per project** is implemented well — supports uploads and visual file management.

#### ⚠️ **What is missing or unclear:**

* No indication of **auto classification (AI)** or semantic understanding of file content.
* **No versioning**, rollback or comparison options.
* **No collaborative document actions** like inline annotations or comments.
* **No alerting system** for document changes.
* **No digital signature flow** (validation or approval pipeline missing).

---

### 🔧 Recommendations:

* Consider adding to the product backlog or confirming the following:

  * **Version control system** for documents (with timestamped uploads and diffs).
  * **AI classification and tagging** UI (category suggestions, icons, tags).
  * **Annotation/commenting system** (similar to Google Docs or Notion comments).
  * **Integration with signature APIs** (e.g., DocuSign, HelloSign).
  * **Semantic search backend** (and UI input field for it, if planned).





---

## Bloc 3 – Espace collaboratif

We’re comparing collaborative features described in the spec with what’s present in the Figma design (light mode).

---

### 🔍 Spec Functionality vs Figma UI

| **Feature**                               | **Spec Description**                                              | **Figma Status**                            | **Comments**                                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **1. Secure partner access**              | External collaborators can access projects with restricted rights | ❌ Not visible                               | No explicit UI for inviting or managing external/guest users.                                           |
| **2. Fine-grained permission management** | Precise access control per user/task/document                     | ⚠️ Minimal                                  | Roles are visible, but per-resource permissions (e.g., file/task-level) are **not configurable in UI**. |
| **3. Partner information requests**       | Interface for external partners to ask questions or make requests | ❌ Not shown                                 | No dedicated UI or form for partner queries or communications.                                          |
| **4. Project activity feed (journal)**    | Log of all project-level actions                                  | ✅ Present (Activity tab / timeline visible) | Aligned — includes event logs per task/project.                                                         |
| **5. Real-time chat per project (V2)**    | Instant messaging system per project (marked "Possible in V2")    | ❌ Not visible                               | **Acceptable** if postponed to future version — not visible in current design.                          |
| **6. AI-generated activity summaries**    | Summaries of recent activity auto-generated by AI                 | ❌ Not shown                                 | No sign of AI-generated synthesis or summaries anywhere.                                                |
| **7. Voting and polls**                   | Simple tools to allow team to vote or make decisions              | ❌ Absent                                    | No UI for polls, reactions, or decision-based interactions.                                             |

---

### ✅ Summary of Bloc 3 Comparison

#### ✅ **What is consistent and implemented:**

* **Activity feed** (project journal) is fully implemented and detailed.

#### ⚠️ **What is partially implemented or missing:**

* **Permission control** exists at role-level but lacks **granular resource-level management**.
* No support yet for **external user (partner) interactions** or limited-access collaboration.

#### ❌ **What is missing from the UI (required by spec):**

* **Partner access management**
* **Permission matrix (read/write/grant per resource)**
* **Information request interface for partners**
* **Real-time chat interface**
* **AI-generated project summaries**
* **Voting/survey tools**

---

### 🔧 Recommendations:

* Clarify if external/partner access is planned for V2 or needs to be in current version.
* If chat and summaries are part of future iterations, **note them as backlog features**.
* Add user stories for:

  * Polls and decision modules
  * Comment or discussion threads per task/project
  * Dynamic permission matrix editor (user-task, user-file)
  * Partner invitation and limited access tokens


---

## Bloc 4 – Automatisations & Intelligence Artificielle

We assess the advanced and AI-powered automation features required in the spec versus what’s visible or supported in the current **Figma design (light mode)**.

---

### 🔍 Spec Functionality vs Figma UI

| **Feature**                            | **Spec Description**                                                       | **Figma Status**           | **Comments**                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| **1. Task prioritization**             | Automatic sorting by importance, urgency, and project impact               | ❌ Not present              | No UI indicators (e.g., priority ranks, urgency levels) or automation logic.    |
| **2. AI-suggested missing tasks**      | System suggests tasks that may be missing from a project                   | ❌ Absent                   | **Completely missing** in the design — no suggestion popups or recommendations. |
| **3. Blocker detection & suggestions** | Identify blocked tasks and propose corrective actions                      | ❌ Not visible              | No "flagged" task markers or AI-driven insights about workflow bottlenecks.     |
| **4. Event-based task creation (n8n)** | Tasks generated automatically from external events (e.g., contract signed) | ❌ Not reflected in UI      | **Backend logic only** — if planned, should be documented outside the UI.       |
| **5. Project summary views (AI)**      | Auto-generated project summaries for reporting/meetings                    | ❌ Not visible              | No auto-summary sections or synthesized insights present.                       |
| **6. Smart assignment by skills**      | Automatically assign tasks based on user skillset                          | ❌ Not implemented visibly  | Only manual assignment is shown; no "recommended user" or ranking logic.        |
| **7. Context-aware notifications**     | Send relevant alerts based on role, task status, importance                | ❌ Basic notifications only | Design shows static alerts — no filtering logic or rule-based alerting.         |

---

### ✅ Summary of Bloc 4 Comparison

#### ✅ **What is implemented:**

* **None of the listed AI/automation features** from this bloc are currently visible in the design.

#### ⚠️ **What may exist in backend/roadmap but not in design:**

* Event-based task creation (e.g., from webhooks, external triggers like n8n).
* Smart notifications may be implemented with logic later — UI doesn’t expose this yet.

#### ❌ **What is missing entirely in the UI (though required by the specs):**

* **No AI-assisted task features** (suggestions, prioritization, smart assignment).
* **No project summaries or auto-diagnostics** for task/project health.
* **No visual cues or interactivity around automation/intelligence at all**.

---

### 🔧 Recommendations:

* All Bloc 4 features require **backend-heavy AI logic** but also **frontend affordances**, such as:

  * Priority indicators & auto-sorting tasks.
  * "AI suggestions" component for missing tasks.
  * Task status explanation (e.g., "blocked by…") with corrective prompts.
  * Notification settings with context filters.
  * Summary panels generated by ML/LLM based on project activity.

* If these are planned for future sprints or V2:

  * Create placeholder sections or notes in Figma to anticipate integration.
  * Begin defining backend APIs and models for AI features now to avoid rework.

---

