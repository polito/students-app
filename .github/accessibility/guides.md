# Accessibility — Guides section

## What has been implemented

### `GuidesScreen`
- `OverviewList` no longer uses `accessible={true}` — items wrapped in `<View accessibilityRole="list">` so iOS VoiceOver can reach individual guide rows.
- Removed duplicate `accessibilityRole="list"` from the `ScrollView`.
- Load-complete announcement via `AccessibilityInfo.announceForAccessibility` when guides arrive.

### `GuideScreen`
- Fields `OverviewList` no longer uses `accessible={true}` — `GuideFieldListItem` rows are individually reachable.
- Sections `Card` no longer uses `accessible={true}` — `GuideSectionListItem` children are individually traversable.
- `guide?.intro` guarded with `?? ''` — the literal string `"undefined"` is no longer announced before data loads.
- Count labels guarded against loading state — no more "0 fields/sections" while data is fetching.
- Invalid `accessibilityRole="text"` removed from sections `Card`.

### `GuideFieldListItem`
- Copy action lifted to the `ListItem`'s `onPress` — no more inner `TouchableOpacity` hidden by `importantForAccessibility="no-hide-descendants"`.
- `accessibilityRole` is `"button"` when `isCopyEnabled`, `"text"` otherwise.
- `accessibilityHint` on the `ListItem` (not inside a hidden child button).

### `GuideSectionListItem`
- `HtmlView` body wrapped in `<View accessible={true} accessibilityLabel={getHtmlTextContent(section.content)} importantForAccessibility="no-hide-descendants">` — plain text announced instead of raw HTML markup.
- Redundant `accessible={true}` removed from the heading `Text`.
- `// a11y: manual test required` comment added for image `alt` text (HtmlView does not expose custom image renderers externally).

### Translations
- New keys added to `en.json` and `it.json`:
  - `guidesScreen.listLoaded`
  - `guideScreen.fieldsLoading`

---

## Best practices for this section

### OverviewList — never pass `accessible={true}`
```tsx
// WRONG — all items collapsed into one VoiceOver node on iOS
<OverviewList accessible={true} accessibilityRole="list" accessibilityLabel={label}>
  {guide?.fields.map(f => <GuideFieldListItem key={f.id} field={f} />)}
</OverviewList>

// CORRECT
<View accessibilityRole="list" accessibilityLabel={label}>
  <OverviewList>
    {guide?.fields.map(f => <GuideFieldListItem key={f.id} field={f} />)}
  </OverviewList>
</View>
```

### Copy action — always on the `ListItem`
`ListItem`'s `importantForAccessibility="no-hide-descendants"` hides all descendants when a label is present. Lift interactive logic to the `ListItem`:
```tsx
<ListItem
  accessibilityRole={field.isCopyEnabled ? 'button' : 'text'}
  accessibilityLabel={`${field.label}: ${field.value}`}
  accessibilityHint={field.isCopyEnabled ? t('guideFieldListItem.tapToCopy') : undefined}
  onPress={field.isCopyEnabled ? handleCopy : undefined}
/>
```

### HTML content accessibility
Wrap `HtmlView` in an accessible container with stripped plain text:
```tsx
<View
  accessible={true}
  accessibilityLabel={getHtmlTextContent(section.content)}
  importantForAccessibility="no-hide-descendants"
>
  <HtmlView content={section.content} />
</View>
```

### Guard against undefined in accessibility labels
```tsx
// WRONG — reads "Introduction: undefined" before data loads
accessibilityLabel={`${t('guideScreen.introduction')}: ${guide?.intro}`}

// CORRECT
accessibilityLabel={`${t('guideScreen.introduction')}: ${guide?.intro ?? ''}`}
```

### Guard count labels during loading
```tsx
accessibilityLabel={
  isLoading
    ? t('guideScreen.fieldsLoading')
    : t('guideScreen.fieldsAvailable', { count: guide?.fields?.length ?? 0 })
}
```
