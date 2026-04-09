# Accessibility — Job Offers section

## What has been implemented

### `JobOffersScreen`
- `OverviewList` no longer uses `accessible={true}` — list semantics moved to a wrapping `<View accessibilityRole="list">` so iOS VoiceOver can reach individual items.
- Load-complete announcement: when data arrives, `AccessibilityInfo.announceForAccessibility` informs screen reader users.

### `JobOfferScreen`
- **Company Card**: removed `accessible={true}` and invalid `accessibilityRole="text"`. Inner `<Text accessibilityRole="header">` is now a reachable heading landmark.
- **Job details Card**: removed `accessible={true}` and invalid `accessibilityRole="text"`. Each child field (contract type, salary, location, expiry, free positions) is individually accessible with its own `accessibilityRole="text"` and label.
- **Email link**: fixed — `accessibilityRole="link"`, label, hint, and `onPress` are all on the same pressable `Text`. Double-tap now works correctly.
- **URL link**: same fix — all props consolidated on the single pressable element; no more split between outer and inner `Text`.
- **"Application" section heading**: `accessibilityRole="header"` added.

### `JobOfferListItem`
- `accessibilityRole="button"`, composite `accessibilityLabel` (title + location + company + expiry).
- Position info moved to the END of the label to avoid the `". ,"` double-pause cadence.

### Translations
- New keys added to `en.json` and `it.json`:
  - `jobOffersScreen.listLoaded`

---

## Best practices for this section

### Never use `accessible={true}` on a Card with structured children
```tsx
// WRONG — all field values invisible to screen readers
<Card accessible={true} accessibilityLabel="Job details">
  <Text>{contractType}</Text>
  <Text>{salary}</Text>
</Card>

// CORRECT — children individually traversable
<Card>
  <Text accessibilityRole="header">{t('jobOfferScreen.jobDetails')}</Text>
  <Text accessibilityRole="text" accessibilityLabel={`${t('jobOfferScreen.contractType')}: ${contractType}`}>
    {contractType}
  </Text>
</Card>
```

### Email and URL links — keep `onPress` and role on the same element
```tsx
// WRONG — onPress hidden under accessible={true}, double-tap does nothing
<Text accessible={true} accessibilityRole="link">
  Label
  <Text onPress={handlePress}>{email}</Text>   {/* unreachable */}
</Text>

// CORRECT
<Text
  accessibilityRole="link"
  accessibilityLabel={`${t('jobOfferScreen.email')}: ${email}`}
  accessibilityHint={t('jobOfferScreen.sendEmail')}
  onPress={() => onPressEmail(email)}
>
  {email}
</Text>
```

### Section headings
Every visually prominent heading must be a navigation landmark:
```tsx
<Text variant="subHeading" accessibilityRole="header">
  {t('jobOfferScreen.application')}
</Text>
```

### Position info at the end of list item labels
```tsx
// Avoid ". ," cadence — position last
accessibilityLabel={[title, location, companyInfos, accessibilityListLabel(index, total)].filter(Boolean).join(', ')}
```
