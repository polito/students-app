# Accessibility — Offering section

## What has been implemented

### `PersonListItem` (shared component)
- Now forwards `...rest` props to the inner `ListItem` — caller-supplied `accessibilityLabel`, `accessibilityRole`, and `accessibilityHint` are no longer silently discarded.
- Profile picture `Image` uses `t('common.profilePicture', { name })` instead of a hardcoded English string.

### `GroupCourses`
- `accessibilityLabel` and `accessibilityHint` replaced with i18n keys (`offeringScreen.groupLabel`, `offeringScreen.expandCollapseHint`).
- `accessibilityRole="button"`, `accessibilityState={{ expanded }}`.

### `GroupCoursesExpanded`
- `accessibilityHint` uses `t('offeringScreen.tapToViewCourse')` (no more hardcoded Italian).
- `OverviewList` has `accessibilityRole="list"` and `accessibilityLabel={t('offeringScreen.coursesList', { count })}`.
- `"CFU"` string uses `t('common.cfu')`.
- Each `ListItem` has `accessibilityState={{ disabled }}`.

### `DegreeTrackYear`
- Ordinal key at index 3 fixed: `'quarto'` → `'fourth'`.
- `OverviewList` label uses `t('common.listWithCount')` (existing pluralised key) instead of hardcoded Italian `"elementi"` and missing `common.coursesList`.
- `accessibilityHint` uses `t('common.tapToNavigate')` (existing key) instead of missing `common.tapToViewCourseDetails`.
- `ListItem` has `accessibilityState={{ disabled: isOffline }}`.

### `DegreeCourseScreen`
- Removed duplicate `accessibilityRole="button"` from the `StatefulMenuView` outer `View`.
- Hours, staff-preview, and other-section `OverviewList` now each have `accessibilityRole="list"` and `accessibilityLabel`.
- Staff preview passes `index` and `total` to `StaffListItem`.

### `DegreeCourseGuideScreen`
- Removed `accessible={true}` from the outer `Card` and from each section `Col`.
- Section labels now use `getHtmlTextContent(section.content)` — raw HTML no longer announced.
- Subheading `Text` with `accessibilityRole="header"` is now individually reachable.

### `DegreeJobOpportunitiesScreen`
- Removed `accessible={true}`, `accessibilityRole="text"` (invalid), and monolithic label from the `Card`.
- Title `<Text accessibilityRole="header">` and body are now individually traversable.

### `DegreeInfoScreen`
- `importantForAccessibility="no-hide-descendants"` added to notes and objectives `View` elements to prevent double-reading on Android.

### `Offerings`
- Section heading label fixed: no longer produces `"Engineering ,  Degree programs"` with stray comma.
- Degree `ListItem` has `accessibilityHint={t('common.tapToNavigate')}` and `accessibilityState={{ disabled: isOffline }}`.

### `StaffScreen`
- List label while loading uses `t('common.loading')` instead of "0 members".

### `DegreeInfoScreen`
- OK — `accessibilityRole="text"` and composite labels on overview, notes, and objectives.

### `StaffListItem`
- Position-aware label via `accessibilityListLabel`, `accessibilityRole="button"`, `accessibilityHint`.

### `DegreeTracksScreen`
- Expandable section header `Pressable` with `accessibilityLabel`, `accessibilityRole="button"`, `accessibilityState={{ expanded }}`, and `accessibilityHint`.
- `accessibilityRole="list"` on `OverviewList`.

### `DegreeTopTabsNavigator`
- Year selector now uses `t('offeringScreen.yearSelectorHint')` (was missing from `en.json`).
- `accessibilityState={{ disabled }}` on year selector when non-interactive.

### Translations
- New keys added to `en.json` and `it.json`:
  - `offeringScreen.groupLabel`, `offeringScreen.expandCollapseHint`, `offeringScreen.tapToViewCourse`, `offeringScreen.coursesList`, `offeringScreen.yearSelectorHint`
  - `staffScreen.staffList`

---

## Best practices for this section

### Expandable sections — state and announcement
```tsx
const [expanded, setExpanded] = useState(false);

const toggle = useCallback(() => {
  const next = !expanded;
  setExpanded(next);
  AccessibilityInfo.announceForAccessibility(
    next
      ? t('offering.sectionExpanded', { name: group.name })
      : t('offering.sectionCollapsed', { name: group.name }),
  );
}, [expanded, group.name]);

<Pressable
  onPress={toggle}
  accessibilityRole="button"
  accessibilityLabel={t('offeringScreen.groupLabel', { name: group.name, count: group.data.length })}
  accessibilityHint={t('offeringScreen.expandCollapseHint')}
  accessibilityState={{ expanded }}
>
```

### Never nest `accessible={true}` inside another `accessible={true}`
```tsx
// WRONG — iOS will collapse children; headings and interactive elements disappear
<Card accessible={true} accessibilityLabel="Section">
  <Text accessibilityRole="header">Title</Text>   {/* dead on iOS */}
</Card>

// CORRECT — let children be individually traversable
<Card>
  <Text accessibilityRole="header">{title}</Text>
  <Text>{bodyText}</Text>
</Card>
```

### Strip HTML before using as accessibilityLabel
```tsx
import { getHtmlTextContent } from 'src/utils/html';

accessibilityLabel={[section.title, getHtmlTextContent(section.content)].join(', ')}
```

### Disabled list items — always explicit
```tsx
<ListItem
  disabled={isOffline}
  accessibilityState={{ disabled: isOffline }}
  accessibilityHint={isOffline ? undefined : t('common.tapToNavigate')}
/>
```
