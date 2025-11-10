# Design Guidelines: LunchWith.ai API Management Interface

## Design Approach
**System-Based Approach:** Material Design with Carbon Design influences for data management excellence. This application prioritizes clarity, efficiency, and data density over visual flair—designed for power users managing API resources.

## Core Design Principles
1. **Information First:** Maximize content visibility, minimize chrome
2. **Predictable Interactions:** Consistent CRUD patterns across all resource types
3. **Contextual Hierarchy:** Clear parent-child relationships (Scene → Cast)
4. **Efficient Workflows:** Minimize clicks for common operations

---

## Typography

**Font Family:** Inter (Google Fonts)
- Primary UI font with excellent legibility at all sizes
- Wide range of weights for clear hierarchy

**Type Scale:**
- Page Titles: text-3xl font-bold (Characters, Scenes, Scene Detail)
- Section Headers: text-xl font-semibold
- Card/Item Titles: text-lg font-medium
- Body/Form Labels: text-base font-normal
- Helper Text: text-sm font-normal
- Metadata/Timestamps: text-xs font-normal

---

## Layout System

**Spacing Units:** Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing: p-2, gap-2 (within components)
- Standard spacing: p-4, gap-4, m-4 (component padding, gaps)
- Section spacing: p-6, mb-8 (cards, sections)
- Page margins: p-8, px-12 (main containers)

**Container Strategy:**
- Max width: max-w-7xl mx-auto
- Main content padding: px-8 py-6
- Responsive breakpoints: Standard Tailwind (sm, md, lg, xl)

---

## Application Structure

### Top Navigation Bar
- Full-width sticky header (sticky top-0 z-50)
- Height: h-16
- Content: max-w-7xl mx-auto px-8
- Left: "LunchWith.ai Manager" logo/title (text-xl font-bold)
- Center: Primary navigation tabs (Characters | Scenes)
- Right: API Key indicator (icon + status text-sm)

### Main Content Area
- Container: max-w-7xl mx-auto px-8 py-6
- Flexible height based on content

### API Key Input (First-time/Unauthenticated State)
- Centered card: max-w-md mx-auto mt-20
- Card padding: p-8
- Input field: Full width, h-12
- Submit button: Full width, h-12, mt-4

---

## Component Library

### Resource List View (Characters, Scenes)

**Header Section:**
- Flex container: justify-between items-center mb-6
- Title (text-3xl font-bold) + "Add New" button

**Grid Layout:**
- Desktop: grid grid-cols-2 gap-6
- Tablet: grid-cols-1
- Each card represents one resource

**Resource Cards:**
- Structured card with p-6
- Title: text-lg font-medium mb-2
- Description: text-base line-clamp-3 (truncate long text)
- Footer: flex justify-between items-center mt-4
  - Metadata (text-xs)
  - Action buttons (Edit icon, Delete icon)
- Hover state: Slight elevation change
- Click target: Entire card navigates to detail (for Scenes)

### Scene Detail View

**Breadcrumb Navigation:**
- mb-6, text-sm
- "Scenes / [Scene Name]"
- Clickable navigation back to list

**Two-Column Layout:**
- grid grid-cols-1 lg:grid-cols-3 gap-8

**Left Column (2/3 width - lg:col-span-2):**
- Scene information card
- Cast members section below

**Right Column (1/3 width):**
- Quick actions panel
- Scene metadata

**Cast Members Section:**
- Header: "Cast Members" (text-xl font-semibold) + "Add Cast" button
- List view: Space-y-4
- Each cast item: Bordered panel p-4
  - Role (text-lg font-medium)
  - Goal & Start fields (text-sm)
  - Inline edit/delete actions

### Forms (Add/Edit Modals or Panels)

**Modal Overlay:**
- Fixed overlay covering viewport
- Centered modal: max-w-2xl

**Modal Content:**
- Header: p-6 border-b
  - Title (text-2xl font-bold)
  - Close button (top-right)
- Body: p-6
  - Form fields: space-y-6
- Footer: p-6 border-t
  - flex justify-end gap-3
  - Cancel + Save buttons

**Form Fields:**
- Label: block text-sm font-medium mb-2
- Input/Textarea: w-full p-3, rounded border
- Text inputs: h-12
- Textareas: min-h-32
- Helper text: text-xs mt-1

### Buttons

**Primary Action:**
- px-6 h-12 rounded
- font-medium text-base
- Used for: Save, Submit, Add New

**Secondary Action:**
- px-6 h-12 rounded border
- font-medium text-base
- Used for: Cancel, Back

**Icon Buttons:**
- w-10 h-10 rounded
- Used for: Edit, Delete, Close

**Icon Library:** Heroicons (CDN)

### Data Display

**Empty States:**
- Centered content: max-w-md mx-auto text-center py-16
- Icon (large, 64px)
- Message (text-lg font-medium mb-2)
- Sub-text (text-sm mb-6)
- CTA button

**Loading States:**
- Spinner centered in container
- Skeleton cards for list views

**Status Messages:**
- Toast notifications (fixed top-right)
- Success/Error feedback after API operations
- Auto-dismiss after 4 seconds

### Tables (if needed for dense data)
- Full width with responsive scroll
- Header: font-medium text-sm
- Rows: p-4 border-b
- Actions column: right-aligned icons

---

## Interaction Patterns

**Navigation:**
- Tab selection in header changes route
- Card clicks navigate to detail views
- Breadcrumbs enable backtracking

**CRUD Operations:**
- Create: Modal form opens from "Add New" button
- Read: Cards display summarized data
- Update: Click "Edit" opens modal with pre-filled form
- Delete: Confirmation dialog before API call

**Cast Management:**
- Only accessible within Scene detail view
- "Add Cast" button appears in Scene context
- Cast forms include hidden scene_id field

**Feedback:**
- Immediate visual feedback on button clicks
- API operation status shown via toasts
- Loading states during async operations
- Error messages display inline for form validation

---

## Responsive Behavior

**Desktop (lg+):**
- Two-column layouts active
- Side-by-side resource cards
- Expanded navigation

**Tablet (md):**
- Single column layouts
- Stacked cards
- Condensed spacing

**Mobile (base):**
- Full-width cards
- Minimal padding (px-4)
- Simplified navigation (hamburger if needed)
- Forms stack vertically

---

## Accessibility

- All interactive elements keyboard navigable
- Form labels explicitly associated with inputs
- ARIA labels on icon-only buttons
- Focus indicators on all interactive elements
- Semantic HTML structure (nav, main, section, article)

---

**No animations** beyond standard transitions (200ms ease) on interactive elements. Focus on instant, responsive interactions that feel professional and efficient.