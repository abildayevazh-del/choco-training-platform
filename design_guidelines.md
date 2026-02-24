# Smart Restaurant Dashboard Design Guidelines

## Design Approach
**Reference-Based Approach**: Combining elements from Ozon Seller, Stripe Dashboard, and Notion for a professional SaaS aesthetic.

## Core Design Elements

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Hierarchy**: 
  - Page titles: text-2xl font-semibold
  - Section headers: text-lg font-medium
  - Card titles: text-base font-medium
  - Body text: text-sm
  - Metrics/numbers: text-3xl font-bold

### Layout System
**Spacing Units**: Use Tailwind units of 2, 4, 6, 8, and 12 (p-4, gap-6, mb-8, etc.)
- Page padding: p-6 to p-8
- Card padding: p-4 to p-6
- Section gaps: gap-6
- Grid gaps: gap-4

### Color Palette
- **Accent**: #0057FF (primary actions, active states)
- **Sidebar Background**: #0F172A (dark slate)
- **Page Background**: White/light gray (#F8FAFC)
- **Card Background**: White
- **Text**: Slate gray scale (#334155, #64748B, #94A3B8)
- **Success**: Green for WhatsApp button
- **Status Indicators**: Green (active), Yellow (warning), Red (attention needed)

### Component Library

#### Header (Top Navigation)
- Clean white background with subtle shadow (shadow-sm)
- Height: h-16
- Contains: Logo (left), Icons for notifications/help, Profile avatar (right)
- Fixed positioning for scroll persistence

#### Sidebar Navigation
- Dark background (#0F172A)
- Width: w-64 on desktop, collapsible on mobile
- Icon + text navigation items
- Active state: Blue accent (#0057FF) with background highlight
- Sections grouped with subtle dividers
- Icons from Heroicons

#### Dashboard Layout
**Two-Column Structure**:
- Left column (wider): 2/3 width - Analytics, charts, metrics
- Right column (narrower): 1/3 width - Learning, knowledge base, tasks, support

#### Metric Cards (Stripe-style)
- White background with subtle shadow (shadow-md)
- Rounded corners (rounded-lg)
- Icon + label + large number display
- Minimal border or soft shadow
- 4-column grid on desktop (grid-cols-4)
- Stack on mobile (grid-cols-1)

#### Welcome Block
- Prominent placement at top
- Greeting + subtitle
- Two primary action buttons (right-aligned): "Create Promotion" and "Update Menu"
- Light background or white card

#### Chart Section
- Title: "Order Dynamics"
- Chart.js implementation
- Time filter buttons: Day / Week / Month
- Clean grid lines, subtle colors

#### Restaurant Status Cards
- Grid layout showing 3 locations
- Status indicators with colored dots
- Action button: "Add Location"

#### Task List
- Checkbox-style items
- Priority indicators
- Action-oriented copy

#### Marketing Cards
- 3-card grid
- Icons representing: Promotions, Promo Codes, Loyalty
- Call-to-action on each card

#### Learning Progress Block
- Progress bar showing 40% completion
- Count of new lessons and checklists
- "Go to Learning" button

#### Knowledge Base
- List of 3 popular articles
- Clean typography
- "Open Knowledge Base" link

#### Support Section
- "Submit Request" button
- List of 2 recent tickets with status badges

#### Floating Action Buttons
**Position**: Fixed bottom-right corner
- **WhatsApp**: Green circular button, WhatsApp icon, opens wa.me link
- **AI Consultant**: Blue circular button, chat icon, opens popup chat widget
- Stack vertically with gap-4
- Shadow for elevation (shadow-lg)

### Responsive Behavior
- **Desktop**: Full sidebar + two-column layout
- **Tablet**: Collapsible sidebar + single column with stacked sections
- **Mobile**: Hidden sidebar (hamburger menu) + fully stacked layout

### Animations
Minimal and purposeful:
- Smooth transitions on hover (transition-colors)
- Sidebar collapse/expand animation
- Chart rendering animation (Chart.js default)
- No distracting scroll effects

### Visual Principles
- **Generous whitespace**: Clean, uncluttered interface
- **Consistent card shadows**: shadow-sm for subtle depth, shadow-md for elevated elements
- **Rounded corners**: rounded-lg standard
- **Icon consistency**: Use Heroicons throughout
- **Professional polish**: Stripe-level attention to detail in alignment and spacing