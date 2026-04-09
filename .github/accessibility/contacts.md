# Accessibility — Contacts section

## What has been implemented

### `ContactsScreen`
- `accessibilityLabel` and `accessibilityHint` on the search `TextField`.
- `OverviewList` is no longer passed `accessible={true}` — items are wrapped in a `<View accessibilityRole="list">` so iOS VoiceOver can reach individual results.
- `announceForAccessibility` string fixed (was producing double commas); now uses a clean template literal.
- Announces when search returns 0 results (`contactsScreen.noResultsFound`).
- Search `TextField` has `accessibilityState={{ disabled: isInputDisabled }}` when offline.

### `PersonOverviewListItem`
- Position info moved to the end of the label — avoids the `. ,` double-pause cadence.
- Profile picture `Image` changed to `accessible={false}` (ListItem label already describes the person).
- Fallback `faUser` Icon has `accessible={false}`.
- `accessibilityState={{ disabled: isDisabled }}` propagated.

### `RecentSearch`
- `FlatList accessible={true}` removed; list semantics moved to a wrapping `<View accessibilityRole="list">`.
- Android ellipsis `IconButton` has `accessibilityLabel` and `accessibilityHint`.
- iOS item hint fixed: now describes navigation (not deletion).
- iOS items include position info via `accessibilityListLabel`.
- iOS item wrapper has `accessibilityState={{ disabled: isDisabled }}` when offline.
- Long-press delete action exposed to VoiceOver via `accessibilityActions`.

### `PersonScreen`
- Contacts and courses `OverviewList` no longer use `accessible={true}` — items are individually reachable on iOS.
- Profile image placeholder `View` has `importantForAccessibility="no-hide-descendants"` on Android.
- `faLink` icon row has `importantForAccessibility="no-hide-descendants"` to hide the SVG from TalkBack.
- Phone `ListItem` hint changed to describe outcome ("Opens phone dialer") instead of repeating the action.
- Email `ListItem` hint changed to "Opens mail app".
- Phone and email `ListItem`s have `accessibilityState={{ disabled: isOffline }}`.
- Email `ListItem` is conditionally rendered only when `person?.email` is defined.
- `Metric` components for role and department have `accessibilityLabel`.

### Translations
- New keys added to `en.json` and `it.json`:
  - `contactsScreen.noResultsFound`, `contactsScreen.moreOptions`, `contactsScreen.moreOptionsHint`, `contactsScreen.removeFromRecent`
  - `personScreen.callHint`, `personScreen.emailHint`

---

## Best practices for this section

### OverviewList — never pass `accessible={true}`
```tsx
// WRONG — collapses all list items on iOS
<OverviewList accessible={true} accessibilityRole="list" accessibilityLabel={label}>
  {people?.map(p => <PersonOverviewListItem ... />)}
</OverviewList>

// CORRECT — wrap for list semantics, OverviewList handles iOS safely
<View accessibilityRole="list" accessibilityLabel={label}>
  <OverviewList>
    {people?.map(p => <PersonOverviewListItem ... />)}
  </OverviewList>
</View>
```

### Search result announcements
Use a single template literal, not an array join:
```tsx
useEffect(() => {
  if (!people) return;
  if (people.length === 0) {
    AccessibilityInfo.announceForAccessibility(t('contactsScreen.noResultsFound'));
  } else {
    AccessibilityInfo.announceForAccessibility(
      `${t('contactsScreen.resultFound')} ${people.length} ${t('contactsScreen.resultFoundRes')}`,
    );
  }
}, [people]);
```

### Long-press actions — expose via `accessibilityActions`
```tsx
<View
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel={label}
  accessibilityHint={t('common.tapToNavigate')}
  accessibilityActions={[{ name: 'delete', label: t('contactsScreen.removeFromRecent') }]}
  onAccessibilityAction={({ nativeEvent }) => {
    if (nativeEvent.actionName === 'delete') removeItem(item);
  }}
  onPress={() => navigate(item)}
>
```

### Composite list item labels — position at the end
```tsx
// WRONG — position prefix creates ". ," cadence
[accessibilityListLabel(index, total), name, role].join(', ')

// CORRECT — position at the end
[name, role, accessibilityListLabel(index, total)].filter(Boolean).join(', ')
```
