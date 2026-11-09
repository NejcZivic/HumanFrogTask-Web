## Predpogoji

- Node.js 20.19+ ali 22.12+ (potreba Vite 7)
- Zagnani API del aplikacije na `http://localhost:5131`

## Zagon v razvijalskem okolju

```sh
npm install
npm run dev
```

Web je odprt na `http://localhost:3000`.

Aplikacija kliče API skozi `/api/...`. Vite razvijalskio okolje pošlje te zahtevke na `http://localhost:5131` (`server.proxy` v `vite.config.ts`) in zato ne potrebujemo CORS. Če je API na drugem naslovu spremenite `target` v `server.proxy`.

## Produkcijska različica

```sh
npm run build     # naredi statične HTML datoteke
npm run serve     # Prikaže dist/ lokalno na http://localhost:4173
```

`dist/` ima statične datoteke, ki se lahko gostijo kjerkoli. Sam strežnik, ki gosti aplikacijo pa more vse klice `/api/*` posredovati na API z `/api` delom odstranjenim. Primer z nginx:

```nginx
location /api/ {
    proxy_pass http://localhost:5131/;
}
```

## Strani

Aplikacija uporablja hash-based routing:

- `#/` seznam dogodkov. Filter je v samem URl npr. `#/?od=2026-11-15&do=2026-11-30`
- `#/events/{id}` prikaže detajle, zasedenost in obrazec za prijavo

## Uporaba AI
AI je pri tej nalogi bil uporabljen za začetek projekta (scafolding) in nato lepši izgled. Sama logika in struktura je napisana brez AI.

## Odločitve
Odločil sem se za uporabo SolidJS zaradi dveh točk.

### Ne uporablja virtualnega DOM kot ostale knjižnice
React, Vue, Preact, etc. uporabljajo virtualni DOM, ki je za tako aplikacijo domače rečeno overkill. SolidJS uporablja tako imenovano fine-grained reaktivnost s signali, ki posodobi točna vozlišča DOMa direktno.

### Znana sintaksa
Za razliko od ostalih ogrodji, ki ne uporabljajo virtualnega DOM (angular, svelte, ...), SolidJS uporablja JSX sintakso, ki mi je najbližje in se nanjo precej dobro spoznam.

### Ostale odločitve
Za izgled je uporabljena CSS knjižnica tailwindCSS. Tailwind zelo pospeši izdelavo izgleda strani in ponuja standardizirane razrede CSS.

Klicanje API preko `/api` je za tako aplikacijo smiselno, saj tako ne potrebujemo CORS policy-a in nam ni treba zakodirati naslova API v statične datoteke, ki jih SolidJS zgenerira. Prav tako pa ni potrebno API-ja narediti javno dostopnega in lahko teče lokalno na gostujočem strežniku.

Hash based routing je bil uporabljen zato, da nam ni treba imeti knjižnice za routing, ki jo ponuja SolidJS. S tem se zato zgenerira samo en index.html in imamo SPA.

## Izboljšave
Samo spletno aplikacijo bi lahko izboljšal s tem, če bi API poslal ali so še prosta mesta ali ne. S tem bi lahko na dogodke, ki so polni lahko dodal pill (oz. badge), ki bi obvestil uporabnika, da so vsa mesta že zasedena.

Sortiranje in paginiranje dogodkov. Ta sprememba bi se morala narediti tudi na API.

V primeru, da bi aplikacija šla v dejanski produkt bi bilo potrebno aplikacijo razviti z dejanskim routing sistemom.