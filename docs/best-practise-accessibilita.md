# Guida all'Accessibilità — Students App PoliTo

Questo documento è il **punto di ingresso obbligatorio** per qualunque sviluppatore che lavori sulla students app. Raccoglie tutte le best practice emerse durante le sessioni di accessibilità su Teaching, Agenda, Offering, Contacts, Job Offers e Guides. Per ogni sezione è disponibile documentazione di dettaglio in `.github/accessibility/`.

---

## Indice

1. [Stack tecnologico e architettura](#1-stack-tecnologico-e-architettura)
2. [Regole fondamentali React Native a11y](#2-regole-fondamentali-react-native-a11y)
3. [Ruoli semantici — `accessibilityRole`](#3-ruoli-semantici--accessibilityrole)
4. [Label e descrizioni](#4-label-e-descrizioni)
5. [Stato accessibile — `accessibilityState`](#5-stato-accessibile--accessibilitystate)
6. [Elementi interattivi](#6-elementi-interattivi)
7. [Liste e FlatList](#7-liste-e-flatlist)
8. [Modal e Bottom Sheet](#8-modal-e-bottom-sheet)
9. [Form e input](#9-form-e-input)
10. [Contenuto dinamico e live region](#10-contenuto-dinamico-e-live-region)
11. [Gestione del focus](#11-gestione-del-focus)
12. [Contenuto HTML e testo misto](#12-contenuto-html-e-testo-misto)
13. [Internazionalizzazione](#13-internazionalizzazione)
14. [Platform specifics — iOS vs Android](#14-platform-specifics--ios-vs-android)
15. [Utility e componenti del progetto](#15-utility-e-componenti-del-progetto)
16. [Touch target](#16-touch-target)
17. [Checklist — bug ricorrenti](#17-checklist--bug-ricorrenti)
18. [Documentazione di dettaglio per sezione](#18-documentazione-di-dettaglio-per-sezione)

---

## 1. Stack tecnologico e architettura

L'app è costruita in **React Native con Expo** e supporta VoiceOver (iOS), TalkBack (Android) e Switch Access. I file e le cartelle principali su cui si lavora:

| Percorso | Contenuto |
|---|---|
| `src/core/components/` | Componenti condivisi (`AccessibleFlatList`, `AccessibleText`, `Checkbox`, …) |
| `src/core/hooks/` | Hook condivisi (`useAccessibilty`, `useScreenReader`, `useAccessibleListItem`) |
| `lib/ui/components/VisuallyHidden.tsx` | Wrapper zero-size per contenuto solo screen reader |
| `src/core/constants.ts` | `IS_IOS`, `IS_ANDROID` per conditionals di piattaforma |
| `assets/translations/en.json` | Stringhe i18n inglese — **sempre aggiornare** in coppia con it.json |
| `assets/translations/it.json` | Stringhe i18n italiano — **sempre aggiornare** in coppia con en.json |
| `.github/accessibility/` | Documentazione di dettaglio per ogni sezione |

> **Attenzione ai componenti condivisi.** Modificare `OverviewList`, `ListItem`, `Checkbox`, `BottomModal` ha effetto su **tutte** le sezioni dell'app. Prima di modificarli, verificare che le modifiche non rompano il contratto di accessibilità documentato nelle sezioni di dettaglio.

---

## 2. Regole fondamentali React Native a11y

### 2.1 Non passare `accessible={true}` a `OverviewList`

`OverviewList` internamente imposta `accessible={Platform.select({ android: true, ios: false })}` per mantenere gli item individualmente navigabili su iOS. Qualsiasi chiamante che passa `accessible={true}` sovrascrive questo comportamento via spread `{...rest}`, collassando l'intera lista in un unico elemento VoiceOver.

```tsx
// SBAGLIATO — collassa tutti i list item su iOS
<OverviewList accessible={true} accessibilityRole="list" accessibilityLabel={label}>
  {items.map(item => <MyListItem key={item.id} {...item} />)}
</OverviewList>

// CORRETTO — wrappa in View per la semantica di lista
<View accessibilityRole="list" accessibilityLabel={label}>
  <OverviewList>
    {items.map(item => <MyListItem key={item.id} {...item} />)}
  </OverviewList>
</View>
```

### 2.2 `accessibilityRole="text"` non è un valore valido

React Native non riconosce `"text"` come accessibility role — viene ignorato silenziosamente. Usare `"none"` per contenitori non interattivi, oppure omettere il role per elementi di puro testo.

```tsx
// SBAGLIATO — ignorato silenziosamente
<View accessibilityRole="text">...</View>

// CORRETTO — per contenitori non interattivi
<View accessibilityRole="none">...</View>
// oppure, per semplice testo
<Text>{content}</Text>
```

### 2.3 `accessible={true}` su un container elimina la semantica dei figli su iOS

Quando un `View` genitore ha `accessible={true}`, iOS lo rende un singolo elemento foglia. Qualsiasi `accessibilityRole`, `accessibilityLabel` o `onPress` sui figli viene silenziosamente ignorato. Usare `accessible={true}` sui container solo quando i figli sono puramente decorativi.

```tsx
// SBAGLIATO — heading e campi invisibili agli screen reader su iOS
<Card accessible={true} accessibilityLabel="Dettagli lavoro">
  <Text accessibilityRole="header">{title}</Text>  {/* morto su iOS */}
  <Text>{contractType}</Text>
</Card>

// CORRETTO — lascia i figli individualmente traversabili
<Card>
  <Text accessibilityRole="header">{title}</Text>
  <Text>{contractType}</Text>
</Card>
```

### 2.4 `ListItem` + `accessibilityLabel` nasconde tutti i discendenti

`ListItem` imposta `importantForAccessibility="no-hide-descendants"` sul proprio View interno ogni volta che è presente la prop `accessibilityLabel`. Qualsiasi figlio interattivo (es. un `TouchableOpacity` per copiare) diventa irraggiungibile. Spostare tutta l'interattività sul `ListItem` stesso tramite `onPress` e `accessibilityActions`.

```tsx
// SBAGLIATO — il TouchableOpacity figlio è irraggiungibile
<ListItem accessibilityLabel={label}>
  <TouchableOpacity onPress={handleCopy}>  {/* nascosto */}
    <Icon name="copy" />
  </TouchableOpacity>
</ListItem>

// CORRETTO — tutto sull'item
<ListItem
  accessibilityLabel={label}
  accessibilityRole="button"
  accessibilityHint={t('guideFieldListItem.tapToCopy')}
  onPress={handleCopy}
/>
```

### 2.5 `accessibilityState.disabled` deve essere esplicito

Passare `disabled` a `TouchableHighlight` / `TouchableOpacity` non imposta in modo affidabile `accessibilityState.disabled` su tutte le versioni di React Native. Impostarlo sempre esplicitamente:

```tsx
<ListItem
  disabled={isOffline}
  accessibilityState={{ disabled: isOffline }}
/>
```

### 2.6 Non annidare `accessible={true}` dentro un altro `accessible={true}`

```tsx
// SBAGLIATO — iOS collassa i figli; heading e interattivi spariscono
<Card accessible={true} accessibilityLabel="Sezione">
  <Text accessibilityRole="header">Titolo</Text>  {/* morto su iOS */}
</Card>

// CORRETTO — lascia i figli individualmente traversabili
<Card>
  <Text accessibilityRole="header">{title}</Text>
  <Text>{bodyText}</Text>
</Card>
```

### 2.7 Le informazioni di posizione vanno alla fine delle label composite

`accessibilityListLabel` restituisce una stringa che termina con `. `. Metterla all'inizio crea una cadenza `". ,"` con doppia pausa:

```tsx
// SBAGLIATO — produce "Elemento 1 di 5. , Titolo, Sottotitolo"
[accessibilityListLabel(index, total), title, subtitle].join(', ')

// CORRETTO — posizione alla fine
[title, subtitle, accessibilityListLabel(index, total)].filter(Boolean).join(', ')
```

---

## 3. Ruoli semantici — `accessibilityRole`

### Valori validi in React Native

Usare **solo** i valori riconosciuti dalla spec React Native. Ogni valore fuori specifica è ignorato silenziosamente.

```
button        → elemento che esegue un'azione
link          → elemento che apre una URL o naviga
checkbox      → checkbox con stato checked/unchecked
radio         → radio button
tab           → singola tab in un tab bar
header        → titolo/intestazione di sezione (landmark di navigazione)
image         → immagine con significato
imagebutton   → immagine interattiva
text          → NON VALIDO in React Native — non usare
none          → contenitore non interattivo
adjustable    → slider o controllo regolabile
search        → campo di ricerca
combobox      → dropdown/select
progressbar   → barra di avanzamento
list          → contenitore di una lista
radiogroup    → gruppo di radio button
switch        → toggle switch
```

### Regole pratiche

```tsx
// Ogni heading o titolo di sezione visivamente prominente
<Text accessibilityRole="header">{t('section.title')}</Text>

// Ogni elemento che naviga verso un'altra schermata
<ListItem accessibilityRole="button" accessibilityHint={t('common.tapToNavigate')} />

// Link che apre URL esterna o app esterna
<Text accessibilityRole="link" onPress={() => Linking.openURL(url)}>
  {label}
</Text>

// Checkbox già wrappata nel componente condiviso
<Checkbox
  isChecked={isSelected}
  onPress={handleToggle}
  text={label}  // accessibilityLabel impostato internamente
/>
```

> **Non reinventare `Checkbox`.** Il componente `src/core/components/Checkbox.tsx` gestisce già `accessibilityRole="checkbox"`, `accessibilityState`, e `hitSlop`. Non reimplementare manualmente.

---

## 4. Label e descrizioni

### 4.1 `accessibilityLabel` — etichetta principale

Ogni elemento interattivo deve avere un `accessibilityLabel` conciso e significativo. Non aggiungere suffissi come "bottone" o "pulsante" — il role lo comunica già.

```tsx
// SBAGLIATO — il role "button" aggiunge già "bottone"
<TouchableOpacity accessibilityRole="button" accessibilityLabel="Apri dettagli bottone">

// CORRETTO — label chiara senza ridondanza
<TouchableOpacity accessibilityRole="button" accessibilityLabel={t('section.openDetails')}>
```

### 4.2 `accessibilityHint` — azione non ovvia

Usare l'hint solo quando l'azione non è ovvia dal label. Descrivere il risultato dell'azione, non l'azione stessa.

```tsx
// SBAGLIATO — ridondante con il label
accessibilityHint="Tocca per aprire"

// CORRETTO — descrive il risultato
accessibilityHint={t('bookingScreen.checkInHint')}   // es. "Conferma la tua presenza alla lezione"
```

### 4.3 Label composita per card e list item

Costruire la label da tutti i dati contestuali disponibili, filtrandone i valori `undefined`:

```tsx
// Esempio da AgendaCard
const label = [
  t(`agendaCard.type.${item.type}`),  // "Lezione", "Prenotazione", "Scadenza"
  item.title,
  item.date ? format(item.date, 'PPP') : undefined,
  item.time,
  item.location,
].filter(Boolean).join(', ');
```

### 4.4 Icone e immagini decorative

```tsx
// Icona decorativa — nasconderla all'albero a11y
<Icon name="calendar" accessible={false} />

// Immagine di profilo già descritta dal parent ListItem
<Image source={avatarUri} accessible={false} />

// Immagine con significato proprio
<Image source={chartUri} accessibilityLabel={t('progressChart.description', { value })} />
```

### 4.5 Guard contro `undefined` nelle label

```tsx
// SBAGLIATO — produce "Introduzione: undefined" prima che i dati arrivino
accessibilityLabel={`${t('guideScreen.introduction')}: ${guide?.intro}`}

// CORRETTO
accessibilityLabel={`${t('guideScreen.introduction')}: ${guide?.intro ?? ''}`}
```

### 4.6 Guard sulle count label durante il caricamento

```tsx
// SBAGLIATO — produce "0 campi" mentre sta caricando
accessibilityLabel={t('guideScreen.fieldsAvailable', { count: guide?.fields?.length ?? 0 })}

// CORRETTO
accessibilityLabel={
  isLoading
    ? t('guideScreen.fieldsLoading')
    : t('guideScreen.fieldsAvailable', { count: guide?.fields?.length ?? 0 })
}
```

---

## 5. Stato accessibile — `accessibilityState`

Esporre sempre lo stato corrente su toggle, checkbox, sezioni espandibili e elementi disabilitati.

| Stato | Tipo | Quando usarlo |
|---|---|---|
| `disabled` | `boolean` | Elemento non interattivo (offline, pre-condizione non soddisfatta) |
| `checked` | `boolean \| 'mixed'` | Checkbox, switch |
| `expanded` | `boolean` | Sezioni espandibili, dropdown, accordion |
| `selected` | `boolean` | Tab selezionata, opzione selezionata |
| `busy` | `boolean` | Loading in corso sull'elemento |

```tsx
// Sezione espandibile
const [expanded, setExpanded] = useState(false);

<Pressable
  accessibilityRole="button"
  accessibilityState={{ expanded }}
  onPress={() => setExpanded(p => !p)}
/>

// Elemento disabilitato offline
<ListItem
  disabled={isOffline}
  accessibilityState={{ disabled: isOffline }}
  accessibilityHint={isOffline ? undefined : t('common.tapToNavigate')}
/>

// CTA disabilitato — spiegare il motivo nell'hint
<CtaButton
  disabled={!isReady}
  accessibilityState={{ disabled: !isReady }}
  accessibilityHint={!isReady ? t('examRescheduleScreen.ctaDisabledHint') : undefined}
/>
```

---

## 6. Elementi interattivi

### 6.1 Toggle con stato — annuncio del cambio di stato

Quando un toggle cambia stato, annunciarlo esplicitamente agli screen reader:

```tsx
const handleToggle = useCallback(() => {
  const next = !isVisible;
  setIsVisible(next);
  AccessibilityInfo.announceForAccessibility(
    next
      ? t('teachingScreen.gradesVisible')
      : t('teachingScreen.gradesHidden'),
  );
}, [isVisible]);
```

### 6.2 Sezioni espandibili — stato e annuncio

```tsx
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

### 6.3 Long-press — esporre via `accessibilityActions`

Ogni azione long-press deve essere raggiungibile tramite `accessibilityActions`:

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

### 6.4 Slide/page change — annuncio imperativo

`AccessibilityInfo.announceForAccessibility` deve essere chiamato in un callback, non in `useMemo`:

```tsx
// SBAGLIATO — useMemo non è il posto giusto per side effect
const label = useMemo(() => titles[currentIndex], [currentIndex]);

// CORRETTO — callback
const handlePageChange = useCallback((index: number) => {
  setCurrentIndex(index);
  AccessibilityInfo.announceForAccessibility(titles[index]);
}, [titles]);
```

---

## 7. Liste e FlatList

### 7.1 Preferire `AccessibleFlatList` al `FlatList` nudo

`AccessibleFlatList` (`src/core/components/AccessibleFlatList.tsx`) aggiunge automaticamente annuncio del conteggio e label di posizione per ogni item. Usarlo sempre quando la lista è esposta agli screen reader.

```tsx
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
```

### 7.2 `FlatList` con `accessibilityRole="list"` manuale

Se non si può usare `AccessibleFlatList`, aggiungere la semantica di lista manualmente:

```tsx
<View accessibilityRole="list" accessibilityLabel={t('section.listLabel', { count })}>
  <FlatList data={items} renderItem={renderItem} />
</View>
```

### 7.3 Non passare `accessible={true}` a `OverviewList`

Vedi [Sezione 2.1](#21-non-passare-accessibletrue-a-overviewlist).

### 7.4 Annuncio del caricamento completato

Quando i dati arrivano, annunciare agli screen reader:

```tsx
useEffect(() => {
  if (data && !isLoading) {
    announceIfEnabled(t('guidesScreen.listLoaded'));
  }
}, [data, isLoading]);
```

### 7.5 Annuncio dei risultati di ricerca (incluso 0 risultati)

```tsx
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
```

---

## 8. Modal e Bottom Sheet

### 8.1 Focus management all'apertura

Dopo l'apertura di qualsiasi modal o bottom sheet, spostare il focus al primo elemento interattivo:

```tsx
const firstRef = useRef<View>(null);

useLayoutEffect(() => {
  if (isOpen) {
    // Breve timeout necessario per attendere il completamento dell'animazione
    const timer = setTimeout(() => {
      const node = findNodeHandle(firstRef.current);
      if (node) AccessibilityInfo.setAccessibilityFocus(node);
    }, 100);
    return () => clearTimeout(timer);
  }
}, [isOpen]);

// Nel JSX: assegnare il ref al primo elemento interattivo
<CtaButton ref={firstRef} ... />
```

### 8.2 Focus trapping su Android

`BottomModal` aggiunge già `accessibilityViewIsModal={true}` su Android per il focus trapping di TalkBack. Non reinventarlo. Per modal custom, applicarlo manualmente:

```tsx
<View accessibilityViewIsModal={true}>
  {/* contenuto del modal */}
</View>
```

### 8.3 Titolo del modal come heading

Il titolo di ogni modal deve avere `accessibilityRole="header"`:

```tsx
// ModalContent lo fa già internamente — non sovrascrivere
<ModalContent title={t('modal.title')} />

// In un modal custom:
<Text accessibilityRole="header" style={styles.modalTitle}>
  {t('modal.title')}
</Text>
```

---

## 9. Form e input

### 9.1 Ogni `TextField` deve avere label e hint

```tsx
<TextField
  label={t('contactsScreen.searchLabel')}
  accessibilityLabel={t('contactsScreen.searchLabel')}
  accessibilityHint={t('contactsScreen.searchHint')}
  accessibilityState={{ disabled: isInputDisabled }}
/>
```

### 9.2 Errori di validazione — live region assertiva

```tsx
{state.isError && (
  <Text
    accessibilityLiveRegion="assertive"
    accessibilityRole="alert"
    style={styles.error}
  >
    {t('form.fieldRequired')}
  </Text>
)}
```

### 9.3 `RadioGroup` — non usare `accessible={true}` sul container

`RadioGroup` NON usa `accessible={true}` sul container — ogni radio item ha bisogno del focus individuale. Il container ha `accessibilityRole="radiogroup"` solo per la semantica di raggruppamento.

```tsx
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
```

### 9.4 CTA disabilitati — spiegare il perché

```tsx
<CtaButton
  disabled={!canSubmit}
  accessibilityState={{ disabled: !canSubmit }}
  accessibilityHint={!canSubmit ? t('examRescheduleScreen.ctaDisabledHint') : undefined}
/>
```

---

## 10. Contenuto dinamico e live region

### Quando usare quale approccio

| Scenario | Approccio corretto |
|---|---|
| Caricamento dati | `announceLoading` / `useAnnounceLoading` da `useAccessibilty` |
| Risultati di ricerca aggiornati | `announceIfEnabled` da `useAccessibilty` |
| Errore di validazione inline | `accessibilityLiveRegion="assertive"` + `accessibilityRole="alert"` |
| Messaggio di stato non urgente | `accessibilityLiveRegion="polite"` sul container |
| Cambio di pagina/slide | `AccessibilityInfo.announceForAccessibility` in callback |
| Conferma operazione (es. check-in ok) | `AccessibilityInfo.announceForAccessibility` |

```tsx
// Check-in riuscito
const handleCheckIn = async () => {
  await checkIn();
  AccessibilityInfo.announceForAccessibility(t('bookingScreen.checkInSuccess'));
};

// Loading state sull'elemento
<View accessibilityState={{ busy: isLoading }}>
  {isLoading ? <ActivityIndicator /> : <Content />}
</View>
```

> **Non usare `accessibilityLiveRegion` da solo per i loading.** Abbinarlo sempre a `announceLoading` da `useAccessibilty` — fornisce il meccanismo più robusto su entrambe le piattaforme.

---

## 11. Gestione del focus

### 11.1 Regole generali

1. **All'apertura di modal/bottom sheet** — il focus deve spostarsi al primo elemento interattivo
2. **Alla navigazione tra schermate** — lo screen reader deve annunciare il titolo della nuova schermata; assicurarsi che l'header o il titolo abbia `accessibilityRole="header"`
3. **Azioni distruttive** — valutare se verificare `useScreenReader().isEnabled` per aggiungere una conferma verbale

### 11.2 Spostare il focus programmaticamente

```tsx
import { AccessibilityInfo, findNodeHandle } from 'react-native';

const elementRef = useRef<View>(null);

const moveFocusToElement = () => {
  const node = findNodeHandle(elementRef.current);
  if (node) AccessibilityInfo.setAccessibilityFocus(node);
};

<View ref={elementRef} accessible={true} accessibilityRole="header">
  {/* primo elemento della nuova vista */}
</View>
```

### 11.3 `pointerEvents="none"` — mai su elementi focusabili

```tsx
// SBAGLIATO — TalkBack/VoiceOver non possono raggiungere l'elemento
<TouchableOpacity pointerEvents="none" accessibilityRole="button">

// CORRETTO — disabilitare tramite prop standard
<TouchableOpacity disabled={true} accessibilityState={{ disabled: true }}>
```

---

## 12. Contenuto HTML e testo misto

### 12.1 `HtmlView` — sempre wrappare per gli screen reader

`HtmlView` non espone attributi a11y su misura. Wrappare in un container accessibile con il testo ripulito:

```tsx
import { getHtmlTextContent } from 'src/utils/html';

<View
  accessible={true}
  accessibilityLabel={getHtmlTextContent(section.content)}
  importantForAccessibility="no-hide-descendants"
>
  <HtmlView content={section.content} />
</View>
```

### 12.2 Label da contenuto HTML

Quando si usa il testo HTML come `accessibilityLabel`, usare sempre `getHtmlTextContent` per rimuovere i tag:

```tsx
// SBAGLIATO — legge i tag HTML grezzi
accessibilityLabel={section.content}

// CORRETTO
accessibilityLabel={[section.title, getHtmlTextContent(section.content)].join(', ')}
```

### 12.3 Testo misto IT/EN — `AccessibleText`

Per testo che mescola italiano e inglese nello stesso elemento, usare `AccessibleText` con `accessibilityLanguage` in modo che VoiceOver/TalkBack pronuncino correttamente:

```tsx
import { AccessibleText, MultiLingualText } from 'src/core/components/AccessibleText';

// Blocco di testo in lingua diversa da quella dell'app
<AccessibleText accessibilityLanguage="en">
  {englishContent}
</AccessibleText>

// Testo misto inline
<MultiLingualText
  parts={[
    { text: 'Corso di ', lang: 'it' },
    { text: 'Machine Learning', lang: 'en' },
  ]}
/>
```

---

## 13. Internazionalizzazione

### 13.1 Nessuna stringa a11y hardcodata

Ogni stringa usata come `accessibilityLabel`, `accessibilityHint` o annuncio imperativo **deve** essere in entrambi i file di traduzione. Le stringhe hardcoded in inglese o italiano non sono accettabili.

```tsx
// SBAGLIATO — stringa hardcodata
accessibilityHint="Opens phone dialer"

// CORRETTO — chiave i18n
accessibilityHint={t('personScreen.callHint')}
```

### 13.2 Convenzione per i nomi delle chiavi

- `common.<key>` — stringhe condivise tra sezioni
- `<featureScreen>.<key>` — stringhe specifiche della schermata/sezione

### 13.3 Chiavi comuni già disponibili — riutilizzare prima di crearne

```
common.tapToNavigate           → "Tap to navigate"
common.tapToToggle             → "Tap to toggle"
common.tapToToggleSection      → "Tap to expand or collapse this section"
common.tapToViewContact        → "Tap to view contact details"
common.loading                 → "Loading"
common.elementCount            → "Element {{index}} of {{total}}"
common.listWithCount           → "{{count}} elements"
common.profilePicture          → "Profile picture of {{name}}"
common.cfu                     → "CFU"
common.progressChart           → …
common.progressChartMulti      → …
```

### 13.4 Sintassi delle traduzioni

```json
// Interpolazione variabile
"groupLabel": "{{name}}, {{count}} courses"

// Pluralizzazione
"resultFound_one": "Found {{count}} result",
"resultFound_plural": "Found {{count}} results"
```

---

## 14. Platform specifics — iOS vs Android

### 14.1 Importare le costanti di piattaforma

```tsx
import { IS_IOS, IS_ANDROID } from 'src/core/constants';
```

### 14.2 Nascondere sottostrutture decorative

```tsx
// Android — nasconde l'intero sottoalbero da TalkBack
<View importantForAccessibility="no-hide-descendants">
  <Icon name="decorative" />
</View>

// iOS — equivalente
<View accessibilityElementsHidden={true}>
  <Icon name="decorative" />
</View>

// Entrambe le piattaforme (il più comune)
<View
  importantForAccessibility="no-hide-descendants"
  accessibilityElementsHidden={IS_IOS}
>
  <Icon name="decorative" />
</View>
```

### 14.3 Comportamenti che divergono per piattaforma

```tsx
// accessibilityRole condizionale
accessibilityRole={IS_IOS ? 'button' : undefined}

// OverviewList — gestito internamente, non sovrascrivere
// iOS: accessible={false} → item navigabili singolarmente
// Android: accessible={true} → richiesto per TalkBack

// Focus trapping nei modal
// Android: accessibilityViewIsModal={true} → già in BottomModal
// iOS: automatico con VoiceOver quando il modal è presentato natively
```

### 14.4 `ProgressChart` — SVG e TalkBack

I componenti SVG come `RNCKProgressChart` vengono attraversati da TalkBack anche quando non è desiderato. Wrappare sempre con `importantForAccessibility="no-hide-descendants"`:

```tsx
<View importantForAccessibility="no-hide-descendants">
  <RNCKProgressChart ... />
</View>
```

---

## 15. Utility e componenti del progetto

### Quick reference

| Utility | Percorso | Quando usarla |
|---|---|---|
| `useAccessibilty` | `src/core/hooks/useAccessibilty.ts` | Hook centrale a11y (nota: typo intenzionale, manca la 'i') |
| `useScreenReader` | `src/core/hooks/useScreenReader.ts` | Rileva stato screen reader; espone `announce(msg)` |
| `useAccessibleListItem` | `src/core/hooks/useAccessibleListItem.ts` | Props list item con posizione, container props, annuncio lista |
| `AccessibleFlatList` | `src/core/components/AccessibleFlatList.tsx` | FlatList con count e posizione — preferire sempre al FlatList nudo |
| `AccessibleText` | `src/core/components/AccessibleText.tsx` | Aggiunge `accessibilityLanguage` per testo IT/EN misto |
| `MultiLingualText` | `src/core/components/AccessibleText.tsx` | Testo misto inline |
| `VisuallyHidden` | `lib/ui/components/VisuallyHidden.tsx` | Wrapper zero-size per contenuto solo screen reader |
| `Checkbox` | `src/core/components/Checkbox.tsx` | Già wrappa role, state, hitSlop — non reimplementare |
| `IS_IOS` / `IS_ANDROID` | `src/core/constants.ts` | Conditionals di piattaforma |

### `useAccessibilty` — funzioni esposte

```tsx
const {
  accessibilityListLabel,      // (index, total) → "Element X of Y"
  getListAccessibilityProps,   // (label) → props per il container lista
  getTappableAccessibilityProps, // (label, hint?) → props per elementi tappabili
  getBadgeAccessibilityLabel,  // (count, label) → "N new label"
  announceLoading,             // (isLoading) → annuncia loading/loaded
  announceIfEnabled,           // (msg) → annuncia solo se SR è attivo
  useAnnounceLoading,          // hook per gestire annunci loading
} = useAccessibilty();
```

### `VisuallyHidden` — contenuto solo screen reader

```tsx
import { VisuallyHidden } from 'lib/ui/components/VisuallyHidden';

// Testo visibile solo agli screen reader
<VisuallyHidden>
  <Text>{t('section.screenReaderOnly')}</Text>
</VisuallyHidden>
```

---

## 16. Touch target

### Requisiti minimi

- **iOS**: 44×44 pt
- **Android**: 48×48 dp

Quando l'area visiva è inferiore, usare `hitSlop`:

```tsx
// Icona piccola (24×24 pt) — hitSlop per espandere il target a 44×44
<TouchableOpacity
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  accessibilityRole="button"
  accessibilityLabel={t('common.close')}
  onPress={onClose}
>
  <Icon name="close" size={24} />
</TouchableOpacity>
```

> **`Checkbox` applica già `hitSlop`** — non aggiungerlo manualmente sulle checkbox.

---

## 17. Checklist — bug ricorrenti

Prima di chiudere qualsiasi sessione di accessibilità, verificare questi punti:

- [ ] **`OverviewList`**: nessun `accessible={true}` passato direttamente? La lista è wrappata in `<View accessibilityRole="list">`?
- [ ] **`accessible={true}` annidati**: nessun container `accessible={true}` con figli interattivi o con role?
- [ ] **`accessibilityRole="text"`**: rimosso ovunque? Sostituito con `"none"` o rimosso del tutto?
- [ ] **`accessibilityState.disabled`**: impostato esplicitamente su tutti gli elementi che usano `disabled`?
- [ ] **Label composite**: `accessibilityListLabel` è alla fine, non all'inizio?
- [ ] **Guard `undefined`**: tutte le label usano `?? ''` o `.filter(Boolean)` prima di `.join()`?
- [ ] **Guard loading**: le count label mostrano un testo di caricamento invece di "0 elementi"?
- [ ] **Icone decorative**: tutte con `accessible={false}`?
- [ ] **Immagini di profilo**: `accessible={false}` quando il parent ListItem già descrive la persona?
- [ ] **Long-press**: azioni long-press esposte via `accessibilityActions`?
- [ ] **Sezioni espandibili**: `accessibilityState={{ expanded }}` aggiornato? Annuncio del cambio di stato?
- [ ] **CTA disabilitati**: `accessibilityHint` spiega il motivo della disabilitazione?
- [ ] **Errori di form**: `accessibilityLiveRegion="assertive"` + `accessibilityRole="alert"` presenti?
- [ ] **Modal/bottom sheet**: focus spostato al primo elemento interattivo all'apertura?
- [ ] **`accessibilityViewIsModal`**: aggiunto ai modal custom su Android?
- [ ] **HtmlView**: wrappato con `accessibilityLabel={getHtmlTextContent(...)}` e `importantForAccessibility="no-hide-descendants"`?
- [ ] **Testo misto IT/EN**: usa `AccessibleText` con `accessibilityLanguage`?
- [ ] **`ProgressChart` / SVG**: wrappati con `importantForAccessibility="no-hide-descendants"` su Android?
- [ ] **Slide/page changes**: `announceForAccessibility` chiamato in callback (non `useMemo`)?
- [ ] **Annuncio caricamento**: usa `announceLoading` / `useAnnounceLoading` da `useAccessibilty`?
- [ ] **Stringhe hardcoded**: nessuna stringa a11y in inglese/italiano non in `en.json`/`it.json`?
- [ ] **Chiavi i18n**: aggiunte a **entrambi** `en.json` e `it.json`?
- [ ] **Touch target**: tutti gli elementi interattivi ≥ 44×44 pt (iOS) / 48×48 dp (Android)? `hitSlop` usato dove necessario?
- [ ] **`pointerEvents="none"`**: mai su elementi focusabili?
- [ ] **ListItem interattività**: tutta l'interattività su `ListItem` (non su figli nascosti)?

---

## 18. Documentazione di dettaglio per sezione

Ogni sezione ha documentazione completa con problemi trovati, soluzioni applicate e pattern specifici:

| Documento | Sezione coperta | Temi principali |
|---|---|---|
| [`.github/accessibility/teaching.md`](./.github/accessibility/teaching.md) | Teaching + Surveys | Checkbox, ProgressChart, RadioGroup, ExamCTA, BottomModal, SurveyListItem |
| [`.github/accessibility/agenda.md`](./.github/accessibility/agenda.md) | Agenda | AgendaCard composite label, WeekFilter, HiddenEventsScreen, BookingScreen, LectureScreen |
| [`.github/accessibility/offering.md`](./.github/accessibility/offering.md) | Offering | Sezioni espandibili, DegreeCourseScreen, HTML content, StaffListItem |
| [`.github/accessibility/contacts.md`](./.github/accessibility/contacts.md) | Contacts | Search con announcements, RecentSearch long-press, PersonScreen |
| [`.github/accessibility/job-offers.md`](./.github/accessibility/job-offers.md) | Job Offers | Card con figli navigabili, link email/URL, section heading |
| [`.github/accessibility/guides.md`](./.github/accessibility/guides.md) | Guides | GuideFieldListItem copy action, HtmlView, guard undefined |

---

## Quick reference — props React Native più usate

```
accessibilityRole="button"            → elemento che esegue un'azione
accessibilityRole="link"              → apre URL o naviga
accessibilityRole="header"            → titolo/intestazione di sezione
accessibilityRole="list"              → contenitore di lista
accessibilityRole="checkbox"          → checkbox
accessibilityRole="radiogroup"        → gruppo di radio button
accessibilityRole="progressbar"       → barra di avanzamento
accessibilityRole="search"            → campo di ricerca
accessibilityRole="image"             → immagine con significato
accessibilityRole="none"              → contenitore non interattivo

accessibilityLabel="..."              → etichetta principale (sempre su elementi interattivi)
accessibilityHint="..."               → descrive il risultato di azioni non ovvie
accessibilityState={{ disabled }}     → elemento non interattivo
accessibilityState={{ expanded }}     → sezione espandibile aperta/chiusa
accessibilityState={{ checked }}      → checkbox selezionata
accessibilityState={{ busy }}         → loading in corso sull'elemento
accessibilityLiveRegion="polite"      → aggiornamento non urgente annunciato automaticamente
accessibilityLiveRegion="assertive"   → errore/alert urgente annunciato immediatamente
accessibilityViewIsModal={true}       → focus trapping Android nei modal
accessibilityElementsHidden={true}    → nasconde all'albero a11y iOS (equiv. di importantForAccessibility)
accessible={false}                    → elemento decorativo, non raggiungibile da SR
importantForAccessibility="no-hide-descendants"  → nasconde sottoalbero da TalkBack (Android)
hitSlop={{ top, bottom, left, right }}            → espande il touch target
```
