# Accessibility Guide — Students App PoliTo This document is the **mandatory entry point** for any developer working on the Students app. It collects all best practices identified during accessibility sessions on Teaching, Agenda, Offering, Contacts, Job Offers, and Guides. Detailed documentation for each section is available in .github/accessibility/. --- ## Table of Contents 1. [Technology stack and architecture](#1-technology-stack-and-architecture) 2. [Core React Native a11y rules](#2-core-react-native-a11y-rules) 3. [Semantic roles — accessibilityRole](#3-semantic-roles--accessibilityrole) 4. [Labels and descriptions](#4-labels-and-descriptions) 5. [Accessible state — accessibilityState](#5-accessible-state--accessibilitystate) 6. [Interactive elements](#6-interactive-elements) 7. [Lists and FlatList](#7-lists-and-flatlist) 8. [Modals and Bottom Sheets](#8-modals-and-bottom-sheets) 9. [Forms and inputs](#9-forms-and-inputs) 10. [Dynamic content and live regions](#10-dynamic-content-and-live-regions) 11. [Focus management](#11-focus-management) 12. [HTML content and mixed text](#12-html-content-and-mixed-text) 13. [Internationalization](#13-internationalization) 14. [Platform specifics — iOS vs Android](#14-platform-specifics--ios-vs-android) 15. [Project utilities and components](#15-project-utilities-and-components) 16. [Touch target](#16-touch-target) 17. [Checklist — recurring bugs](#17-checklist--recurring-bugs) 18. [Detailed documentation by section](#18-detailed-documentation-by-section) --- ## 1. Technology stack and architecture The app is built with **React Native and Expo** and supports VoiceOver (iOS), TalkBack (Android), and Switch Access. Main files and folders to work on: | Path | Content | |---|---| | src/core/components/ | Shared components (AccessibleFlatList, AccessibleText, Checkbox, …) | | src/core/hooks/ | Shared hooks (useAccessibilty, useScreenReader, useAccessibleListItem) | | lib/ui/components/VisuallyHidden.tsx | Zero-size wrapper for screen-reader-only content | | src/core/constants.ts | IS_IOS, IS_ANDROID for platform conditionals | | assets/translations/en.json | English i18n strings — **always update** together with it.json | | assets/translations/it.json | Italian i18n strings — **always update** together with en.json | | .github/accessibility/ | Detailed documentation for each section | > **Pay attention to shared components.** Changing OverviewList, ListItem, Checkbox, or BottomModal affects **all** app sections. Before changing them, verify that the changes do not break the accessibility contract documented in the detailed section files. --- ## 2. Core React Native a11y rules ### 2.1 Do not pass accessible={true} to OverviewList OverviewList internally sets accessible={Platform.select({ android: true, ios: false })} to keep items individually navigable on iOS. Any caller passing accessible={true} overrides this behavior through the {...rest} spread, collapsing the entire list into a single VoiceOver element.

tsx
// WRONG — collapses all list items on iOS
<OverviewList accessible={true} accessibilityRole="list" accessibilityLabel={label}>
{items.map(item => <MyListItem key={item.id} {...item} />)}
</OverviewList>

// CORRECT — wrap in View for list semantics
<View accessibilityRole="list" accessibilityLabel={label}>
<OverviewList>
{items.map(item => <MyListItem key={item.id} {...item} />)}
</OverviewList>
</View>

### 2.2 accessibilityRole="text" is not a valid value React Native does not recognize "text" as an accessibility role — it is silently ignored. Use "none" for non-interactive containers, or omit the role for plain text elements.

tsx
// WRONG — silently ignored
<View accessibilityRole="text">...</View>

// CORRECT — for non-interactive containers
<View accessibilityRole="none">...</View>
// or, for simple text
<Text>{content}</Text>

### 2.3 accessible={true} on a container removes child semantics on iOS When a parent View has accessible={true}, iOS makes it a single leaf element. Any accessibilityRole, accessibilityLabel, or onPress on its children is silently ignored. Use accessible={true} on containers only when the children are purely decorative.

tsx
// WRONG — heading and fields are invisible to screen readers on iOS
<Card accessible={true} accessibilityLabel="Job details">
<Text accessibilityRole="header">{title}</Text> {/_ dead on iOS _/}
<Text>{contractType}</Text>
</Card>

// CORRECT — keep children individually traversable
<Card>
<Text accessibilityRole="header">{title}</Text>
<Text>{contractType}</Text>
</Card>

### 2.4 ListItem + accessibilityLabel hides all descendants ListItem sets importantForAccessibility="no-hide-descendants" on its internal View whenever the accessibilityLabel prop is present. Any interactive child (e.g. a TouchableOpacity for copying) becomes unreachable. Move all interactivity to the ListItem itself through onPress and accessibilityActions.

tsx
// WRONG — the child TouchableOpacity is unreachable
<ListItem accessibilityLabel={label}>
<TouchableOpacity onPress={handleCopy}> {/_ hidden _/}
<Icon name="copy" />
</TouchableOpacity>
</ListItem>

// CORRECT — everything on the item
<ListItem
accessibilityLabel={label}
accessibilityRole="button"
accessibilityHint={t('guideFieldListItem.tapToCopy')}
onPress={handleCopy}
/>

### 2.5 accessibilityState.disabled must be explicit Passing disabled to TouchableHighlight / TouchableOpacity does not reliably set accessibilityState.disabled across all React Native versions. Always set it explicitly:

tsx
<ListItem
disabled={isOffline}
accessibilityState={{ disabled: isOffline }}
/>

### 2.6 Do not nest accessible={true} inside another accessible={true}

tsx
// WRONG — iOS collapses children; headings and interactive elements disappear
<Card accessible={true} accessibilityLabel="Section">
<Text accessibilityRole="header">Title</Text> {/_ dead on iOS _/}
</Card>

// CORRECT — keep children individually traversable
<Card>
<Text accessibilityRole="header">{title}</Text>
<Text>{bodyText}</Text>
</Card>

### 2.7 Position information goes at the end of composite labels accessibilityListLabel returns a string ending with . . Placing it at the beginning creates a ". ," cadence with a double pause:

tsx
// WRONG — produces "Element 1 of 5. , Title, Subtitle"
[accessibilityListLabel(index, total), title, subtitle].join(', ')

// CORRECT — position at the end
[title, subtitle, accessibilityListLabel(index, total)].filter(Boolean).join(', ')
--- ## 3. Semantic roles — accessibilityRole ### Valid values in React Native Use **only** the values recognized by the React Native spec. Any out-of-spec value is silently ignored.
button → element that performs an action
link → element that opens a URL or navigates
checkbox → checkbox with checked/unchecked state
radio → radio button
tab → single tab in a tab bar
header → section title/heading (navigation landmark)
image → meaningful image
imagebutton → interactive image
text → NOT VALID in React Native — do not use
none → non-interactive container
adjustable → slider or adjustable control
search → search field
combobox → dropdown/select
progressbar → progress bar
list → list container
radiogroup → radio button group
switch → toggle switch

### Practical rules

tsx
// Any visually prominent heading or section title
<Text accessibilityRole="header">{t('section.title')}</Text>

// Any element that navigates to another screen
<ListItem accessibilityRole="button" accessibilityHint={t('common.tapToNavigate')} />

// Link that opens an external URL or external app
<Text accessibilityRole="link" onPress={() => Linking.openURL(url)}>
{label}
</Text>

// Checkbox already wrapped in the shared component
<Checkbox
isChecked={isSelected}
onPress={handleToggle}
text={label} // accessibilityLabel set internally
/>

> **Do not reinvent Checkbox.** The src/core/components/Checkbox.tsx component already handles accessibilityRole="checkbox", accessibilityState, and hitSlop. Do not reimplement it manually. --- ## 4. Labels and descriptions ### 4.1 accessibilityLabel — main label Every interactive element must have a concise and meaningful accessibilityLabel. Do not add suffixes such as "button" — the role already communicates that.
> tsx
> // WRONG — the "button" role already adds "button"
> <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open details button">

// CORRECT — clear label without redundancy
<TouchableOpacity accessibilityRole="button" accessibilityLabel={t('section.openDetails')}>

### 4.2 accessibilityHint — non-obvious action Use the hint only when the action is not obvious from the label. Describe the result of the action, not the action itself.

tsx
// WRONG — redundant with the label
accessibilityHint="Tap to open"

// CORRECT — describes the result
accessibilityHint={t('bookingScreen.checkInHint')} // e.g. "Confirms your attendance for the lecture"

### 4.3 Composite label for cards and list items Build the label from all available contextual data, filtering out undefined values:

tsx
// Example from AgendaCard
const label = [
t(`agendaCard.type.${item.type}`), // "Lecture", "Booking", "Deadline"
item.title,
item.date ? format(item.date, 'PPP') : undefined,
item.time,
item.location,
].filter(Boolean).join(', ');

### 4.4 Decorative icons and images

tsx
// Decorative icon — hide it from the a11y tree
<Icon name="calendar" accessible={false} />

// Profile image already described by the parent ListItem
<Image source={avatarUri} accessible={false} />

// Image with its own meaning
<Image source={chartUri} accessibilityLabel={t('progressChart.description', { value })} />

### 4.5 Guard against undefined in labels

tsx
// WRONG — produces "Introduction: undefined" before data arrives
accessibilityLabel={`${t('guideScreen.introduction')}: ${guide?.intro}`}

// CORRECT
accessibilityLabel={`${t('guideScreen.introduction')}: ${guide?.intro ?? ''}`}

### 4.6 Guard count labels while loading

tsx
// WRONG — produces "0 fields" while loading
accessibilityLabel={t('guideScreen.fieldsAvailable', { count: guide?.fields?.length ?? 0 })}

// CORRECT
accessibilityLabel={
isLoading
? t('guideScreen.fieldsLoading')
: t('guideScreen.fieldsAvailable', { count: guide?.fields?.length ?? 0 })
}
--- ## 5. Accessible state — accessibilityState Always expose the current state on toggles, checkboxes, expandable sections, and disabled elements. | State | Type | When to use it | |---|---|---| | disabled | boolean | Non-interactive element (offline, precondition not met) | | checked | boolean \| 'mixed' | Checkbox, switch | | expanded | boolean | Expandable sections, dropdowns, accordion | | selected | boolean | Selected tab, selected option | | busy | boolean | Loading in progress on the element |
tsx
// Expandable section
const [expanded, setExpanded] = useState(false);

<Pressable
accessibilityRole="button"
accessibilityState={{ expanded }}
onPress={() => setExpanded(p => !p)}
/>

// Offline disabled element
<ListItem
disabled={isOffline}
accessibilityState={{ disabled: isOffline }}
accessibilityHint={isOffline ? undefined : t('common.tapToNavigate')}
/>

// Disabled CTA — explain the reason in the hint
<CtaButton
disabled={!isReady}
accessibilityState={{ disabled: !isReady }}
accessibilityHint={!isReady ? t('examRescheduleScreen.ctaDisabledHint') : undefined}
/>
--- ## 6. Interactive elements ### 6.1 Toggle with state — announcement of the state change When a toggle changes state, explicitly announce it to screen readers:
tsx
const handleToggle = useCallback(() => {
const next = !isVisible;
setIsVisible(next);
AccessibilityInfo.announceForAccessibility(
next
? t('teachingScreen.gradesVisible')
: t('teachingScreen.gradesHidden'),
);
}, [isVisible]);

### 6.2 Expandable sections — state and announcement

tsx
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

### 6.3 Long press — expose via accessibilityActions Every long-press action must be reachable through accessibilityActions:

tsx
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

### 6.4 Slide/page change — imperative announcement AccessibilityInfo.announceForAccessibility must be called in a callback, not in useMemo:

tsx
// WRONG — useMemo is not the right place for side effects
const label = useMemo(() => titles[currentIndex], [currentIndex]);

// CORRECT — callback
const handlePageChange = useCallback((index: number) => {
setCurrentIndex(index);
AccessibilityInfo.announceForAccessibility(titles[index]);
}, [titles]);
--- ## 7. Lists and FlatList ### 7.1 Prefer AccessibleFlatList over bare FlatList AccessibleFlatList (src/core/components/AccessibleFlatList.tsx) automatically adds the count announcement and position label for each item. Always use it when the list is exposed to screen readers.
tsx
import { AccessibleFlatList } from 'src/core/components/AccessibleFlatList';

<AccessibleFlatList
data={items}
renderItem={({ item, index }) => (
<MyListItem
{...item}
accessibilityLabel={[item.title, accessibilityListLabel(index, items.length)].filter(Boolean).join(', ')}
/>
)}
accessibilityLabel={t('section.listLabel', { count: items.length })}
/>

### 7.2 FlatList with manual accessibilityRole="list" If AccessibleFlatList cannot be used, add list semantics manually:

tsx
<View accessibilityRole="list" accessibilityLabel={t('section.listLabel', { count })}>
<FlatList data={items} renderItem={renderItem} />
</View>

### 7.3 Do not pass accessible={true} to OverviewList See [Section 2.1](#21-do-not-pass-accessibletrue-to-overviewlist). ### 7.4 Announce loading completion When data arrives, announce it to screen readers:

tsx
useEffect(() => {
if (data && !isLoading) {
announceIfEnabled(t('guidesScreen.listLoaded'));
}
}, [data, isLoading]);

### 7.5 Announce search results (including 0 results)

tsx
useEffect(() => {
if (!results) return;
if (results.length === 0) {
AccessibilityInfo.announceForAccessibility(t('contactsScreen.noResultsFound'));
} else {
AccessibilityInfo.announceForAccessibility(
`${t('contactsScreen.resultFound')} ${results.length} ${t('contactsScreen.resultFoundRes')}`,
);
}
}, [results]);
--- ## 8. Modals and Bottom Sheets ### 8.1 Focus management on open After opening any modal or bottom sheet, move focus to the first interactive element:
tsx
const firstRef = useRef<View>(null);

useLayoutEffect(() => {
if (isOpen) {
// Short timeout needed to wait for the animation to complete
const timer = setTimeout(() => {
const node = findNodeHandle(firstRef.current);
if (node) AccessibilityInfo.setAccessibilityFocus(node);
}, 100);
return () => clearTimeout(timer);
}
}, [isOpen]);

// In JSX: assign the ref to the first interactive element
<CtaButton ref={firstRef} ... />

### 8.2 Focus trapping on Android BottomModal already adds accessibilityViewIsModal={true} on Android for TalkBack focus trapping. Do not reinvent it. For custom modals, apply it manually:

tsx
<View accessibilityViewIsModal={true}>
{/_ modal content _/}
</View>

### 8.3 Modal title as heading Every modal title must have accessibilityRole="header":

tsx
// ModalContent already does this internally — do not override it
<ModalContent title={t('modal.title')} />

// In a custom modal:
<Text accessibilityRole="header" style={styles.modalTitle}>
{t('modal.title')}
</Text>
--- ## 9. Forms and inputs ### 9.1 Every TextField must have label and hint
tsx
<TextField
label={t('contactsScreen.searchLabel')}
accessibilityLabel={t('contactsScreen.searchLabel')}
accessibilityHint={t('contactsScreen.searchHint')}
accessibilityState={{ disabled: isInputDisabled }}
/>

### 9.2 Validation errors — assertive live region

tsx
{state.isError && (
<Text
accessibilityLiveRegion="assertive"
accessibilityRole="alert"
style={styles.error}

>

    {t('form.fieldRequired')}

  </Text>
)}
### 9.3 RadioGroup — do not use accessible={true} on the container RadioGroup does NOT use accessible={true} on the container — each radio item needs individual focus. The container has accessibilityRole="radiogroup" only for grouping semantics.
tsx
<View accessibilityRole="radiogroup">
  {options.map(option => (
    <RadioItem
      key={option.id}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected === option.id }}
      accessibilityLabel={option.label}
      onPress={() => setSelected(option.id)}
    />
  ))}
</View>
### 9.4 Disabled CTAs — explain why
tsx
<CtaButton
  disabled={!canSubmit}
  accessibilityState={{ disabled: !canSubmit }}
  accessibilityHint={!canSubmit ? t('examRescheduleScreen.ctaDisabledHint') : undefined}
/>
--- ## 10. Dynamic content and live regions ### When to use each approach | Scenario | Correct approach | |---|---| | Data loading | announceLoading / useAnnounceLoading from useAccessibilty | | Updated search results | announceIfEnabled from useAccessibilty | | Inline validation error | accessibilityLiveRegion="assertive" + accessibilityRole="alert" | | Non-urgent status message | accessibilityLiveRegion="polite" on the container | | Page/slide change | AccessibilityInfo.announceForAccessibility in callback | | Operation confirmation (e.g. successful check-in) | AccessibilityInfo.announceForAccessibility |
tsx
// Successful check-in
const handleCheckIn = async () => {
  await checkIn();
  AccessibilityInfo.announceForAccessibility(t('bookingScreen.checkInSuccess'));
};

// Loading state on the element
<View accessibilityState={{ busy: isLoading }}>
{isLoading ? <ActivityIndicator /> : <Content />}
</View>

> **Do not use accessibilityLiveRegion alone for loading.** Always pair it with announceLoading from useAccessibilty — it provides the most robust mechanism across both platforms. --- ## 11. Focus management ### 11.1 General rules 1. **When opening modals/bottom sheets** — focus must move to the first interactive element 2. **When navigating between screens** — the screen reader must announce the title of the new screen; make sure the header or title has accessibilityRole="header" 3. **Destructive actions** — consider checking useScreenReader().isEnabled to add a verbal confirmation ### 11.2 Move focus programmatically
> tsx
> import { AccessibilityInfo, findNodeHandle } from 'react-native';

const elementRef = useRef<View>(null);

const moveFocusToElement = () => {
const node = findNodeHandle(elementRef.current);
if (node) AccessibilityInfo.setAccessibilityFocus(node);
};

<View ref={elementRef} accessible={true} accessibilityRole="header">
  {/* first element of the new view */}
</View>
### 11.3 pointerEvents="none" — never on focusable elements
tsx
// WRONG — TalkBack/VoiceOver cannot reach the element
<TouchableOpacity pointerEvents="none" accessibilityRole="button">

// CORRECT — disable through the standard prop
<TouchableOpacity disabled={true} accessibilityState={{ disabled: true }}>
--- ## 12. HTML content and mixed text ### 12.1 HtmlView — always wrap for screen readers HtmlView does not expose custom a11y attributes. Wrap it in an accessible container with cleaned text:
tsx
import { getHtmlTextContent } from 'src/utils/html';

<View
accessible={true}
accessibilityLabel={getHtmlTextContent(section.content)}
importantForAccessibility="no-hide-descendants"

>   <HtmlView content={section.content} />
> </View>

### 12.2 Labels from HTML content When using HTML text as an accessibilityLabel, always use getHtmlTextContent to remove the tags:

tsx
// WRONG — reads raw HTML tags
accessibilityLabel={section.content}

// CORRECT
accessibilityLabel={[section.title, getHtmlTextContent(section.content)].join(', ')}

### 12.3 Mixed IT/EN text — AccessibleText For text that mixes Italian and English in the same element, use AccessibleText with accessibilityLanguage so VoiceOver/TalkBack pronounce it correctly:

tsx
import { AccessibleText, MultiLingualText } from 'src/core/components/AccessibleText';

// Text block in a language different from the app language
<AccessibleText accessibilityLanguage="en">
{englishContent}
</AccessibleText>

// Inline mixed text
<MultiLingualText
parts={[
{ text: 'Corso di ', lang: 'it' },
{ text: 'Machine Learning', lang: 'en' },
]}
/>
--- ## 13. Internationalization ### 13.1 No hardcoded a11y strings Every string used as accessibilityLabel, accessibilityHint, or imperative announcement **must** be in both translation files. Hardcoded English or Italian strings are not acceptable.
tsx
// WRONG — hardcoded string
accessibilityHint="Opens phone dialer"

// CORRECT — i18n key
accessibilityHint={t('personScreen.callHint')}

### 13.2 Key naming convention - common.<key> — strings shared across sections - <featureScreen>.<key> — screen/section-specific strings ### 13.3 Common keys already available — reuse before creating new ones

common.tapToNavigate → "Tap to navigate"
common.tapToToggle → "Tap to toggle"
common.tapToToggleSection → "Tap to expand or collapse this section"
common.tapToViewContact → "Tap to view contact details"
common.loading → "Loading"
common.elementCount → "Element {{index}} of {{total}}"
common.listWithCount → "{{count}} elements"
common.profilePicture → "Profile picture of {{name}}"
common.cfu → "CFU"
common.progressChart → …
common.progressChartMulti → …

### 13.4 Translation syntax

json
// Variable interpolation
"groupLabel": "{{name}}, {{count}} courses"

// Pluralization
"resultFound_one": "Found {{count}} result",
"resultFound_plural": "Found {{count}} results"
--- ## 14. Platform specifics — iOS vs Android ### 14.1 Import platform constants
tsx
import { IS_IOS, IS_ANDROID } from 'src/core/constants';

### 14.2 Hide decorative substructures

tsx
// Android — hides the entire subtree from TalkBack
<View importantForAccessibility="no-hide-descendants">
<Icon name="decorative" />
</View>

// iOS — equivalent
<View accessibilityElementsHidden={true}>
<Icon name="decorative" />
</View>

// Both platforms (the most common case)
<View
importantForAccessibility="no-hide-descendants"
accessibilityElementsHidden={IS_IOS}

>   <Icon name="decorative" />
> </View>

### 14.3 Behaviors that differ by platform

tsx
// Conditional accessibilityRole
accessibilityRole={IS_IOS ? 'button' : undefined}

// OverviewList — handled internally, do not override
// iOS: accessible={false} → items individually navigable
// Android: accessible={true} → required for TalkBack

// Focus trapping in modals
// Android: accessibilityViewIsModal={true} → already in BottomModal
// iOS: automatic with VoiceOver when the modal is presented natively

### 14.4 ProgressChart — SVG and TalkBack SVG components such as RNCKProgressChart are traversed by TalkBack even when this is not desired. Always wrap them with importantForAccessibility="no-hide-descendants":

tsx
<View importantForAccessibility="no-hide-descendants">
<RNCKProgressChart ... />
</View>
--- ## 15. Project utilities and components ### Quick reference | Utility | Path | When to use it | |---|---|---| | useAccessibilty | src/core/hooks/useAccessibilty.ts | Central a11y hook (note: intentional typo, missing the 'i') | | useScreenReader | src/core/hooks/useScreenReader.ts | Detects screen reader state; exposes announce(msg) | | useAccessibleListItem | src/core/hooks/useAccessibleListItem.ts | List item props with position, container props, list announcement | | AccessibleFlatList | src/core/components/AccessibleFlatList.tsx | FlatList with count and position — always prefer over bare FlatList | | AccessibleText | src/core/components/AccessibleText.tsx | Adds accessibilityLanguage for mixed IT/EN text | | MultiLingualText | src/core/components/AccessibleText.tsx | Inline mixed text | | VisuallyHidden | lib/ui/components/VisuallyHidden.tsx | Zero-size wrapper for screen-reader-only content | | Checkbox | src/core/components/Checkbox.tsx | Already wraps role, state, hitSlop — do not reimplement | | IS_IOS / IS_ANDROID | src/core/constants.ts | Platform conditionals | ### useAccessibilty — exposed functions
tsx
const {
accessibilityListLabel, // (index, total) → "Element X of Y"
getListAccessibilityProps, // (label) → props for the list container
getTappableAccessibilityProps, // (label, hint?) → props for tappable elements
getBadgeAccessibilityLabel, // (count, label) → "N new label"
announceLoading, // (isLoading) → announces loading/loaded
announceIfEnabled, // (msg) → announces only if SR is enabled
useAnnounceLoading, // hook for handling loading announcements
} = useAccessibilty();

### VisuallyHidden — screen-reader-only content

tsx
import { VisuallyHidden } from 'lib/ui/components/VisuallyHidden';

// Text visible only to screen readers
<VisuallyHidden>
<Text>{t('section.screenReaderOnly')}</Text>
</VisuallyHidden>
--- ## 16. Touch target ### Minimum requirements - **iOS**: 44×44 pt - **Android**: 48×48 dp When the visual area is smaller, use hitSlop:
tsx
// Small icon (24×24 pt) — hitSlop expands the target to 44×44
<TouchableOpacity
hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
accessibilityRole="button"
accessibilityLabel={t('common.close')}
onPress={onClose}

>   <Icon name="close" size={24} />
> </TouchableOpacity>
> **Checkbox already applies hitSlop** — do not add it manually on checkboxes. --- ## 17. Checklist — recurring bugs Before closing any accessibility session, check these points: - [ ] **OverviewList**: no accessible={true} passed directly? Is the list wrapped in <View accessibilityRole="list">? - [ ] **nested accessible={true}**: no accessible={true} container with interactive children or children with roles? - [ ] **accessibilityRole="text"**: removed everywhere? Replaced with "none" or removed completely? - [ ] **accessibilityState.disabled**: explicitly set on all elements that use disabled? - [ ] **Composite labels**: is accessibilityListLabel at the end, not at the beginning? - [ ] **undefined guards**: do all labels use ?? '' or .filter(Boolean) before .join()? - [ ] **Loading guards**: do count labels show loading text instead of "0 elements"? - [ ] **Decorative icons**: all set with accessible={false}? - [ ] **Profile images**: accessible={false} when the parent ListItem already describes the person? - [ ] **Long press**: are long-press actions exposed via accessibilityActions? - [ ] **Expandable sections**: is accessibilityState={{ expanded }} updated? Is the state change announced? - [ ] **Disabled CTAs**: does accessibilityHint explain why they are disabled? - [ ] **Form errors**: are accessibilityLiveRegion="assertive" + accessibilityRole="alert" present? - [ ] **Modals/bottom sheets**: is focus moved to the first interactive element on open? - [ ] **accessibilityViewIsModal**: added to custom modals on Android? - [ ] **HtmlView**: wrapped with accessibilityLabel={getHtmlTextContent(...)} and importantForAccessibility="no-hide-descendants"? - [ ] **Mixed IT/EN text**: does it use AccessibleText with accessibilityLanguage? - [ ] **ProgressChart / SVG**: wrapped with importantForAccessibility="no-hide-descendants" on Android? - [ ] **Slide/page changes**: announceForAccessibility called in a callback (not useMemo)? - [ ] **Loading announcement**: uses announceLoading / useAnnounceLoading from useAccessibilty? - [ ] **Hardcoded strings**: no a11y string in English/Italian missing from en.json/it.json? - [ ] **i18n keys**: added to **both** en.json and it.json? - [ ] **Touch target**: all interactive elements ≥ 44×44 pt (iOS) / 48×48 dp (Android)? hitSlop used where necessary? - [ ] **pointerEvents="none"**: never on focusable elements? - [ ] **ListItem interactivity**: all interactivity on ListItem (not on hidden children)? --- ## 18. Detailed documentation by section Each section has complete documentation with issues found, applied solutions, and specific patterns: | Document | Covered section | Main topics | |---|---|---| | [.github/accessibility/teaching.md](./.github/accessibility/teaching.md) | Teaching + Surveys | Checkbox, ProgressChart, RadioGroup, ExamCTA, BottomModal, SurveyListItem | | [.github/accessibility/agenda.md](./.github/accessibility/agenda.md) | Agenda | AgendaCard composite label, WeekFilter, HiddenEventsScreen, BookingScreen, LectureScreen | | [.github/accessibility/offering.md](./.github/accessibility/offering.md) | Offering | Expandable sections, DegreeCourseScreen, HTML content, StaffListItem | | [.github/accessibility/contacts.md](./.github/accessibility/contacts.md) | Contacts | Search with announcements, RecentSearch long press, PersonScreen | | [.github/accessibility/job-offers.md](./.github/accessibility/job-offers.md) | Job Offers | Card with navigable children, email/URL links, section heading | | [.github/accessibility/guides.md](./.github/accessibility/guides.md) | Guides | GuideFieldListItem copy action, HtmlView, undefined guards | --- ## Quick reference — most used React Native props
> accessibilityRole="button"            → element that performs an action
> accessibilityRole="link"              → opens URL or navigates
> accessibilityRole="header"            → section title/heading
> accessibilityRole="list"              → list container
> accessibilityRole="checkbox"          → checkbox
> accessibilityRole="radiogroup"        → radio button group
> accessibilityRole="progressbar"       → progress bar
> accessibilityRole="search"            → search field
> accessibilityRole="image"             → meaningful image
> accessibilityRole="none"              → non-interactive container

accessibilityLabel="..." → main label (always on interactive elements)
accessibilityHint="..." → describes the result of non-obvious actions
accessibilityState={{ disabled }} → non-interactive element
accessibilityState={{ expanded }} → expandable section open/closed
accessibilityState={{ checked }} → selected checkbox
accessibilityState={{ busy }} → loading in progress on the element
accessibilityLiveRegion="polite" → non-urgent update announced automatically
accessibilityLiveRegion="assertive" → urgent error/alert announced immediately
accessibilityViewIsModal={true} → Android focus trapping in modals
accessibilityElementsHidden={true} → hides from the iOS a11y tree (equiv. of importantForAccessibility)
accessible={false} → decorative element, not reachable by SR
importantForAccessibility="no-hide-descendants" → hides subtree from TalkBack (Android)
hitSlop={{ top, bottom, left, right }} → expands the touch target
