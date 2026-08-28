---
description: Genereaza pagina de grafice (Samples / Average / 95% / Throughput) pentru un run JMeter, din aggregate CSV
argument-hint: [cale catre aggregate_polished.csv sau catre directorul run-ului]
---

Genereaza pagina de grafice pentru run-ul: $ARGUMENTS

Daca nu s-a dat argument, cere calea. Daca argumentul e un director, foloseste
`aggregate_polished.csv` din el; daca lipseste, ruleaza intai `/polish-jtl` pe
`.jtl`-ul din acel director si exporta agregatul, apoi continua.

## Context

Repo de teste de performanta JMeter pentru PrestaShop. Raportul in lucru e
`load testing report - draft.txt` (in engleza) si are la final
`### TODO: Add graphs, interpretations, etc` — pagina asta e ce intra acolo.
Parametrii fiecarui run (threads, ramp-up, duration, start/end) sunt in acel
draft, la sectiunea `## Testing sessions`, si in `*_metadata_*.txt` din
directorul run-ului. **Citeste-i de acolo, nu-i inventa.**

## Ce trebuie sa contina pagina

Metricile cerute: **# Samples, Average, 95% Line, Throughput**.

1. **Header** — titlu, un paragraf de context (threads, durata, mix guest/login,
   ce s-a exclus din date), o cifra-erou (cel mai prost p95 din run) si o banda
   cu parametrii run-ului.
2. **Rand de KPI** — total sample-uri, media ponderata pe sample-uri, throughput
   agregat, rata de eroare ponderata. Calculeaza-le din date, nu le hardcoda.
3. **Grafic 1 — Response time**: bare orizontale grupate, Average vs 95% Line,
   sortate descrescator dupa p95. Linie de reper la 3 s, etichetata clar ca
   **reper, nu SLA** (clientul nu a definit target-uri).
4. **Grafic 2 — Volum + throughput**: bare orizontale cu # Samples, cu throughput
   afisat pe acelasi rand ca a doua unitate.
5. **Grafic 3 — Throughput vs 95% Line**: scatter, cu evidentierea grupului
   lent-si-intens folosit; leader lines unde punctele se suprapun.
6. **Interpretari** — sectiune cu observatiile reale din date (nu generice), cu
   pastile de severitate.
7. **Tabel** — toate valorile plotate, `tabular-nums`, scroll orizontal propriu.

## Regula importanta despre Throughput

Intr-un singur run, **throughput nu e informatie independenta**: fiecare sampler
ruleaza aceeasi fereastra de timp, deci `throughput = #Samples / durata`.
Verifica raportul (`#Samples / Throughput` ~ aceeasi valoare pe toate randurile)
si, daca se confirma, **nu face un al doilea grafic cu bare doar pentru
throughput** — ar fi acelasi desen la alta scara. Pune-l pe acelasi rand cu
sample-urile si foloseste-l ca axa reala in scatter. Spune explicit in pagina de
ce nu are grafic separat si ca devine metrica utila abia la comparatia intre
run-uri.

## Cum se construieste

- Incarca skill-ul **dataviz** inainte de a scrie prima linie de cod de grafic,
  si **artifact-design** inainte de a scrie fisierul.
- Ruleaza validatorul de paleta pe suprafetele efectiv folosite (light si dark),
  nu presupune ca trece.
- Bare <= 24px, capat rotunjit 4px, gap de 2px intre bare, grid hairline solid
  (niciodata punctat), etichete selective (nu numar pe fiecare bara la grafice cu
  doua serii), legenda cand sunt >= 2 serii, tooltip pe hover + focus la tastatura.
- SVG generat din JS dintr-un array `DATA` la inceputul scriptului — transcris din
  CSV, ca sa fie usor de verificat si de refolosit.
- Light + dark din tokens pe `:root`, `@media (prefers-color-scheme: dark)` cu
  garda `:not([data-theme="light"])`, si `:root[data-theme="dark"]`.
- Un singur fisier HTML, self-contained (fonturile de la Google Fonts sunt singura
  resursa externa admisa).

## Iesire

- Publica pagina ca Artifact si da-mi link-ul.
- **Copiaza fisierul si local**, in directorul run-ului, ca `charts.html`.

## Verificari inainte de a raporta gata

- Verifica numeric ca nimic nu iese din `viewBox` (capete de bare + etichete).
- Confirma totalurile calculate (sample-uri, medie ponderata, throughput agregat)
  fata de CSV.
- Spune explicit ce ai derivat si ce ai citit direct, si semnaleaza orice
  neconcordanta (ex. fereastra reala de esantionare vs `DURATION` configurat).
