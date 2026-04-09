# Accessibility — Agenda section

## What has been implemented

### `AgendaCard` (base — affects all card variants)
- Single `TouchableHighlight` as the only accessible element.
- Composite `accessibilityLabel` built from type + title + time + location.
- `accessibilityRole="button"`, `accessibilityHint={t('common.tapToNavigate')}`.
- `accessibilityState={{ disabled: !onPress }}`.
- Inner `Col` has `importantForAccessibility="no-hide-descendants"` to prevent TalkBack from traversing sub-elements.

### `DeadlineCard`
- Now passes the formatted deadline date as the `time` prop to `AgendaCard` — the composite label includes the date.

### `AgendaTypeFilter`
- `accessibilityState.expanded` reflects actual open/close state (was hardcoded to `false`).
- Removed the outer `Pressable` `accessible={true}` that was creating a double-focus node.
- Decorative `faCircle` icons inside pill content have `accessible={false}`.

### `WeekFilter`
- Removed `accessible={true}` from the wrapping `Row` (was collapsing prev/next buttons into one VoiceOver node on iOS).
- Each prev/next `IconButton` has `accessibilityRole="button"`, label, `accessibilityHint`, and `accessibilityState={{ disabled }}` at boundary weeks.
- i18n keys use camelCase (`agendaScreen.previousWeek`, `agendaScreen.nextWeek`).

### `HiddenEventsScreen`
- `Checkbox` in `HiddenEventItem` receives a descriptive `text` prop built from event date + time range + course title.
- Course-name section headers have `accessibilityRole="header"`.
- Restore `CtaButton` has `accessibilityHint` and `accessibilityState={{ disabled: !hasSelectedItems }}`.

### `AgendaPreferencesScreen`
- `SwitchListItem` rows have `accessibilityLabel={course.name}`.
- Hidden-events `ListItem` has `accessibilityRole="button"`, `accessibilityHint`, and `accessibilityState={{ disabled: !hasHiddenEvents }}`.

### `BookingScreen`
- Location `ListItem` has `accessibilityHint`; virtual-place uses `accessibilityRole="link"` (not `"text"`) since pressing it navigates.
- Seat `ListItem` has `accessibilityHint`.
- Check-in and cancel `CtaButton` have `accessibilityHint` and explicit `accessibilityState={{ disabled }}`.
- Successful check-in is announced via `AccessibilityInfo.announceForAccessibility`.

### `LectureScreen`
- `ListItem` elements for room and course-files have `accessibilityRole="button"` and `accessibilityLabel`.
- Destructive "Hide event" `CtaButton` has `accessibilityHint`.
- Swiper page changes trigger `AccessibilityInfo.announceForAccessibility` with the new video title.

### Translations
- New keys added to `en.json` and `it.json`:
  - `agendaScreen.previousWeek`, `agendaScreen.nextWeek`, `agendaScreen.prevWeekHint`, `agendaScreen.nextWeekHint`
  - `hiddenEventsScreen.restoreHint`
  - `agendaPreferencesScreen.courseItem`, `agendaPreferencesScreen.hiddenEventsHint`
  - `bookingScreen.locationHint`, `bookingScreen.seatHint`, `bookingScreen.checkInHint`, `bookingScreen.cancelHint`, `bookingScreen.checkInSuccess`
  - `lectureScreen.hideEventHint`

---

## Best practices for this section

### AgendaCard composite label
Always build the label from all available contextual data — type, date, time, location:
```tsx
const label = [
  t(`agendaCard.type.${item.type}`),  // "Lecture", "Booking", "Deadline"
  item.title,
  item.date ? format(item.date, 'PPP') : undefined,
  item.time,
  item.location,
].filter(Boolean).join(', ');
```
Hide inner layout elements:
```tsx
<TouchableHighlight
  accessibilityRole="button"
  accessibilityLabel={label}
  accessibilityHint={t('common.tapToNavigate')}
  accessibilityState={{ disabled: !onPress }}
>
  <Col importantForAccessibility="no-hide-descendants">
    {/* inner content */}
  </Col>
</TouchableHighlight>
```

### Checkbox labels in HiddenEventsScreen
Always pass the event description as the `text` prop — never leave it undefined:
```tsx
<Checkbox
  isChecked={isSelected}
  onPress={() => toggleItem(item.id)}
  text={[item.courseTitle, formatDate(item.date), item.timeRange].filter(Boolean).join(', ')}
/>
```

### Expandable dropdown state
`accessibilityState.expanded` must reflect actual open/close state:
```tsx
const [isOpen, setIsOpen] = useState(false);
<PillDropdownActivator
  accessibilityState={{ expanded: isOpen }}
  onPress={() => setIsOpen(p => !p)}
/>
```

### Announcing slide/page changes
Use `AccessibilityInfo.announceForAccessibility` in a callback (not `useMemo`):
```tsx
const handlePageChange = useCallback((index: number) => {
  setCurrentIndex(index);
  AccessibilityInfo.announceForAccessibility(titles[index]);
}, [titles]);
```
