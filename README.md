# meoton-widgets

Kleine Skripte für Inline-Widgets im Claude-Chat, geladen über jsDelivr.

## ringkarte.js

Ringkarte für Outlets: Fadenkreuz in der Mitte, gestrichelte Entfernungsringe, Punkte mit Namen.

```html
<div id="rk"></div>
<script src="https://cdn.jsdelivr.net/gh/chrizbrln/meoton-widgets@<commit-hash>/ringkarte.min.js"></script>
<script>Ringkarte(document.getElementById('rk'), [["Outlet","PLZ Ort",49.49,8.47]], null)</script>
```

Dritter Parameter: `null` (Mitte = Median der Outlets) oder `["Name", lat, lon]`.

Das Repo enthält nur Code, keine Daten.
