# University Portal Layout System

A comprehensive TypeScript Next.js layout component system for university academic management portals, built according to the design system specifications defined in `university_design_system.json`.

## Overview

This layout system provides:
- ✅ **Design System Compliant**: All styles and components are derived directly from the JSON design system
- ✅ **Dark Mode Compatible**: Maintains existing dark mode functionality while implementing light mode specifications
- ✅ **Responsive Design**: Mobile-first approach with proper breakpoint handling
- ✅ **TypeScript Support**: Full type safety and IntelliSense support
- ✅ **Accessibility Features**: WCAG AA compliant with proper focus management and keyboard navigation
- ✅ **Component Library**: Reusable cards, buttons, tables, and navigation components

## Components

### 1. UniversityPortalLayout

The main layout component that provides the overall structure.

```tsx
import { UniversityPortalLayout } from '@/components/layout/university-portal-layout';

<UniversityPortalLayout
  variant="dashboard" // 'dashboard' | 'dataTable' | 'default'
  showSidebar={true}
  sidebarContent={<YourSidebarContent />}
  headerContent={<YourHeaderContent />}
  className="custom-class"
>
  <YourMainContent />
</UniversityPortalLayout>
```

#### Props
- `variant`: Applies specific layout patterns from design system
  - `'dashboard'`: Grid layout for dashboard cards and widgets
  - `'dataTable'`: Column layout optimized for data tables and filters
  - `'default'`: Basic block layout
- `showSidebar`: Toggle sidebar visibility
- `sidebarContent`: Content for the sidebar area
- `headerContent`: Content for the header area
- `className`: Additional CSS classes

### 2. Card Component

Cards following design system specifications with multiple variants.

```tsx
import { Card } from '@/components/layout/university-portal-layout';

<Card variant="default" className="p-6">
  <h3>Card Title</h3>
  <p>Card content...</p>
</Card>

<Card variant="elevated" className="p-6">
  <h3>Elevated Card</h3>
  <p>With enhanced shadow...</p>
</Card>
```

#### Variants
- `default`: Standard card with basic shadow and border
- `elevated`: Enhanced shadow for prominence
- `profile`: Gradient background for profile cards

### 3. Button Component

Buttons implementing design system color palette and typography.

```tsx
import { Button } from '@/components/layout/university-portal-layout';

<Button variant="primary" onClick={handleClick}>
  Primary Action
</Button>

<Button variant="secondary" disabled>
  Secondary Action
</Button>

<Button variant="filter">
  Filter Option
</Button>
```

#### Variants
- `primary`: Main action button with brand colors
- `secondary`: Secondary action with muted styling
- `filter`: Compact filter button for data controls

### 4. Table Component

Data table with design system styling for headers and rows.

```tsx
import { Table } from '@/components/layout/university-portal-layout';

<Table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@university.edu</td>
      <td>Active</td>
    </tr>
  </tbody>
</Table>
```

### 5. SidebarNavigation Component

Navigation component with hierarchical sections and active states.

```tsx
import { SidebarNavigation, type SidebarSection } from '@/components/layout/university-portal-layout';

const sections: SidebarSection[] = [
  {
    label: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <Home className="h-5 w-5" />,
        active: currentPage === 'dashboard',
        onClick: () => setCurrentPage('dashboard'),
      },
      // ... more items
    ],
  },
  // ... more sections
];

<SidebarNavigation sections={sections} />
```

## Design System Integration

All components automatically pull styling from the design system JSON:

### Colors
- Primary: `#4F46E5` (brand), `#818CF8` (light), `#3730A3` (dark)
- Secondary: `#8B5CF6` (purple), `#A78BFA` (light), `#7C3AED` (dark)
- Status: Success `#10B981`, Warning `#F59E0B`, Error `#EF4444`, Info `#3B82F6`
- Neutral: Complete gray scale from `#F9FAFB` to `#111827`

### Typography
- Font Family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- Font Sizes: xs (0.75rem) to 4xl (2.25rem)
- Font Weights: normal (400) to bold (700)
- Line Heights: tight (1.25), normal (1.5), relaxed (1.75)

### Spacing
- Design system spacing scale from 0 to 24 (0 to 6rem)
- Consistent padding and margins across components

### Layout Structure
- Sidebar: 240px width, fixed positioning, full height
- Header: 64px height, sticky positioning
- Main Content: Left margin compensation, full viewport height

## Responsive Breakpoints

Following design system responsive specifications:

- `sm`: 640px - Small devices
- `md`: 768px - Medium devices (tablets)
- `lg`: 1024px - Large devices (desktops)
- `xl`: 1280px - Extra large devices
- `2xl`: 1536px - Ultra-wide displays

### Mobile Behavior
- Sidebar transforms off-screen on mobile
- Overlay provides backdrop for mobile sidebar
- Touch-friendly mobile toggle button
- Responsive grid layouts adapt to screen size

## Dark Mode Support

The layout maintains the existing dark mode implementation while providing light mode specifications:

- Uses existing CSS custom properties for dark mode colors
- Automatically adapts design system colors for dark theme
- Preserves faculty dashboard gradient effects
- Maintains animated background elements

## Accessibility Features

### WCAG AA Compliance
- Proper color contrast ratios for all text and background combinations
- Focus indicators on all interactive elements
- Semantic HTML structure with proper heading hierarchy

### Keyboard Navigation
- Full keyboard support for all interactive elements
- Logical tab order throughout the interface
- Escape key closes mobile sidebar overlay

### Screen Reader Support
- Proper ARIA labels and roles
- Descriptive button and link text
- Semantic navigation structure

### Touch Targets
- Minimum 44px x 44px touch targets for mobile
- Adequate spacing between interactive elements

## Layout Patterns

### Dashboard Pattern
```tsx
<UniversityPortalLayout variant="dashboard">
  {/* Grid layout with responsive columns */}
  {/* Automatic spacing from design system */}
</UniversityPortalLayout>
```

Uses design system's dashboard pattern:
- Grid: `repeat(auto-fit, minmax(300px, 1fr))`
- Gap: 24px consistent spacing
- Responsive card layout

### Data Table Pattern
```tsx
<UniversityPortalLayout variant="dataTable">
  {/* Filter controls at top */}
  {/* Table container with pagination */}
</UniversityPortalLayout>
```

Uses design system's dataTable pattern:
- Filter controls with left alignment
- Table container with proper spacing
- Pagination controls at bottom

## Example Usage

See `university-portal-layout-example.tsx` for a complete implementation example that demonstrates:

- Full dashboard layout with stats cards
- Data table with filtering and pagination
- Sidebar navigation with sections and icons
- Header with user actions
- Responsive behavior
- All design system components in action

## Custom Styling

While the layout pulls from the design system, you can still customize:

```tsx
// Additional CSS classes
<Card className="hover:shadow-lg transition-shadow">
  Custom enhanced card
</Card>

// Inline styles for specific adjustments
<Button style={{ minWidth: '120px' }}>
  Fixed Width Button
</Button>
```

## Integration with Existing Codebase

This layout system is designed to:
- ✅ Not break existing functionality
- ✅ Work alongside existing components
- ✅ Maintain current dark mode behavior
- ✅ Provide incremental adoption path

You can gradually migrate existing components to use the new layout system without disrupting current features.

## Performance Considerations

- Lazy-loaded responsive checks
- Efficient CSS-in-JS styling
- Minimal re-renders with React.memo where appropriate
- Optimized event handlers for navigation
- Smooth transitions following design system specifications

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- CSS custom properties for theming
- Progressive enhancement for older browsers 