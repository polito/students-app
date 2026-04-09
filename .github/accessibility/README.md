# Accessibility Documentation

This folder documents what has been implemented for assistive-technology accessibility across each section of the app.

## Sections

| Section | File |
|---|---|
| Teaching + Surveys | [teaching.md](./teaching.md) |
| Agenda | [agenda.md](./agenda.md) |
| Offering | [offering.md](./offering.md) |
| Contacts | [contacts.md](./contacts.md) |
| Job Offers | [job-offers.md](./job-offers.md) |
| Guides | [guides.md](./guides.md) |

## Cross-cutting rules

These patterns affect every section and must be followed consistently.

### 1. Never pass `accessible={true}` to `OverviewList`

`OverviewList` internally sets `accessible={Platform.select({ android: true, ios: false })}` to keep items individually navigable on iOS. Any caller that passes `accessible={true}` overrides this via `{...rest}` spread, collapsing the entire list into a single VoiceOver element.

```tsx
// WRONG — collapses all list items on iOS
<OverviewList accessible={true} accessibilityRole="list" accessibilityLabel={label}>
  {items.map(item => <MyListItem key={item.id} {...item} />)}
</OverviewList>

// CORRECT — wrap in a View for list semantics
<View accessibilityRole="list" accessibilityLabel={label}>
  <OverviewList>
    {items.map(item => <MyListItem key={item.id} {...item} />)}
  </OverviewList>
</View>
```

### 2. `accessibilityRole="text"` is not a valid React Native role

React Native does not recognise `"text"` as an accessibility role — it is silently ignored. Use `"none"` for containers with no interactivity, or omit the role entirely for plain text elements.

### 3. `accessible={true}` on a container kills child role semantics on iOS

When a parent `View` has `accessible={true}`, iOS makes it a single leaf element. Any `accessibilityRole`, `accessibilityLabel`, or `onPress` on children are silently discarded. Only use `accessible={true}` on containers with purely decorative children.

### 4. `ListItem` + `accessibilityLabel` hides all descendants

`ListItem` sets `importantForAccessibility="no-hide-descendants"` on its inner View whenever an `accessibilityLabel` prop is present. Any interactive child (e.g. a copy `TouchableOpacity`) becomes unreachable. Lift all interactivity to the `ListItem` itself (via `onPress`, `accessibilityActions`).

### 5. `accessibilityState.disabled` must be explicit

Passing `disabled` to `TouchableHighlight` / `TouchableOpacity` does not reliably set `accessibilityState.disabled` on all React Native versions. Always set it explicitly:

```tsx
<ListItem
  disabled={isOffline}
  accessibilityState={{ disabled: isOffline }}
/>
```

### 6. Error and validation texts need `accessibilityLiveRegion`

```tsx
{isError && (
  <Text accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.error}>
    {t('form.fieldRequired')}
  </Text>
)}
```

### 7. Position info at the end of composite labels

`accessibilityListLabel` returns a string ending in `. `. Placing it first creates a `". ,"` double-pause cadence:

```tsx
// WRONG
[accessibilityListLabel(index, total), title, subtitle].join(', ')
// → "Element 1 of 5. , Title, Subtitle"

// CORRECT — position at the end
[title, subtitle, accessibilityListLabel(index, total)].filter(Boolean).join(', ')
```

## App-specific utilities quick reference

| Need | Use |
|---|---|
| List with item count | `AccessibleFlatList` or wrap in `<View accessibilityRole="list" accessibilityLabel={...}>` |
| List item position ("X of Y") | `accessibilityListLabel(index, total)` from `useAccessibilty` (note: one 'i') |
| Badge count | `getBadgeAccessibilityLabel` from `useAccessibilty` |
| Loading announcement | `announceLoading` / `useAnnounceLoading` from `useAccessibilty` |
| Conditional announcement | `announceIfEnabled` from `useAccessibilty` |
| Screen reader detection | `useScreenReader().isEnabled` |
| Mixed IT/EN text | `AccessibleText` / `MultiLingualText` from `src/core/components/AccessibleText.tsx` |
| Screen-reader-only content | `VisuallyHidden` from `lib/ui/components/VisuallyHidden.tsx` |
| Platform conditionals | `IS_IOS`, `IS_ANDROID` from `src/core/constants.ts` |
| Strip HTML for labels | `getHtmlTextContent` from `src/utils/html` |
