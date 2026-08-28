---
description: Curata un fisier .jtl JMeter - pastreaza doar samplerele [GET]/[POST] si normalizeaza labelurile
argument-hint: [cale catre .jtl sau director de run]
---

Curata fisierul JTL indicat: $ARGUMENTS

Daca nu s-a dat niciun argument, cere calea inainte de a face orice.
Daca argumentul e un director, proceseaza fiecare `*.jtl` din el, sarind peste
fisierele care se termina in `.bak.jtl` sau `_polished.jtl`.

## Ce trebuie facut

1. **Filtrare** — pastreaza randul de header si doar randurile unde coloana
   `label` (campul 3, separator `,`) contine `[GET]` sau `[POST]`.
   Elimina randurile de tip container/transaction, de ex.
   `Transaction Controller - *`, `Login Action`, `Search by term`, `Update cart`.

2. **Normalizare label** — in randurile ramase, corecteaza numele de sampleri
   care difera doar prin spatii albe: colapseaza spatiile multiple intr-unul
   singur si taie spatiile de la capete.
   Exemplu real din acest repo: `[GET] View  cart` (doua spatii, sampler-ul din
   transaction controller-ul `Update cart`) trebuie sa devina `[GET] View cart`,
   ca sa se uneasca cu celelalte. Aplica modificarea **strict pe coloana label**,
   nu pe URL sau pe restul campurilor.

3. **Iesire** — scrie rezultatul intr-un fisier nou, in acelasi director, cu
   acelasi nume plus sufixul `_polished` (ex. `jmeter_report_polished.jtl`).
   **Nu modifica fisierul original.**

## Verificari obligatorii

Inainte de a scrie:
- Listeaza labelurile distincte cu numarul de sample-uri (`awk -F',' '{print $3}' | sort | uniq -c | sort -rn`),
  ca sa se vada ce se elimina si ce se unifica.
- Verifica pe campul 3 (sau cu `cat -A`) ca variantele cu spatii duplicate apar
  doar in coloana label, nu si in URL sau alte campuri. Daca apar si altundeva,
  opreste-te si raporteaza.

Dupa ce scrii:
- Raporteaza numarul de linii inainte/dupa si cate randuri s-au eliminat.
- Afiseaza lista de labeluri ramase cu totalurile unificate.
- Confirma ca headerul e pastrat, ca fisierul sa ramana valid pentru
  `generate_report.bat`.

## Note

- Coloana `label` este campul 3; campurile 1 si 2 sunt numerice (`timeStamp`,
  `elapsed`), deci `awk -F','` pe campul 3 e sigur chiar daca alte campuri
  (`failureMessage`, `URL`) contin virgule.
- Cauza typo-ului `View  cart` e in fisierele `.jmx` (`load_test_run.jmx:887`
  si inca 7 fisiere). Curatarea JTL-ului nu o repara la sursa — rularile
  viitoare vor produce din nou labelul dublat.
