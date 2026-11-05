# Suunnittele varausjärjestelmä

**User:** Anonymous  
**Created:** 8/18/2026 15:01:58  
**Updated:** 9/7/2026 16:56:18  
**Exported:** 9/11/2026 17:09:50  
**Link:** [https://chatgpt.com/g/g-p-6a8447b08e448191ba86d6879208423f/c/6a84493b-6f58-83ed-ba57-f5fa69181d03](https://chatgpt.com/g/g-p-6a8447b08e448191ba86d6879208423f/c/6a84493b-6f58-83ed-ba57-f5fa69181d03)  

## Prompt:
8/18/2026, 3:01:56 PM

Suunnitellaan ohjelma diplomityön projektia varten. Aiheeksi on valittu resurrsien varausjärjestelmä.
Työssä mitataan AI:n avulla kehitetyn ohjelman koodin laatua. Työkaluiksi on valittu Cursor kehittykseen, SolarQube, ESLint ja vitest coverage aineiston keruuseen sekä React+Typescript ja Node.js+typescript ohjelmointiin.

## Response:
8/18/2026, 3:01:58 PM

Hyvä aihe. **Resurssien varausjärjestelmä** sopii diplomityön kokeelliseksi ohjelmistoksi hyvin, koska siihen saadaan riittävästi erilaisia komponentteja, liiketoimintalogiikkaa, tietokantakäsittelyä, validointia ja testattavaa koodia, mutta projekti voidaan silti rajata hallittavaksi.

Kannattaa suunnitella ohjelma nimenomaan niin, että se **tuottaa hyvää tutkimusaineistoa koodin laadun arviointiin**, eikä vain niin, että saadaan toimiva sovellus.

## 1. Ehdotettu järjestelmä

Esimerkiksi:

**Resurssien varausjärjestelmä**, jossa käyttäjä voi:

- tarkastella varattavia resursseja
- nähdä resurssien vapaat ajat
- tehdä varauksen
- muokata omaa varaustaan
- perua varauksen
- tarkastella omia varauksiaan
- ylläpitäjänä hallita resursseja
- ylläpitäjänä tarkastella kaikkia varauksia

Resurssi voisi olla esimerkiksi:

- neuvotteluhuone
- työtila
- ajoneuvo
- laite
- projektori

Tutkimuksen kannalta ei kuitenkaan tarvitse tehdä järjestelmästä liian laajaa.

---

# 2. Tekninen rakenne

Ehdottaisin seuraavaa:

```text
React + TypeScript
        │
        │ REST / JSON
        ▼
Node.js + TypeScript
        │
        ▼
Tietokanta
```

Frontend:

- React
- TypeScript
- React Router
- mahdollisesti jokin komponenttikirjasto, esimerkiksi MUI
- ESLint
- Vitest + Testing Library

Backend:

- Node.js
- TypeScript
- esimerkiksi Express
- REST API
- tietokanta

Laatutyökalut:

- **SonarQube**
- **ESLint**
- **Vitest + coverage**
- Git

Kehitys:

- **Cursor**
- Git-committeihin voidaan tallentaa kehityksen eteneminen
- AI:n käyttö dokumentoidaan tutkimusaineistoksi

---

# 3. Toiminnallisuudet

Järjestelmä kannattaa jakaa muutamaan selkeään kokonaisuuteen.

### Käyttäjät

Käyttäjällä on esimerkiksi:

```text
id
name
email
role
```

Rooleja voisi olla:

```text
USER
ADMIN
```

### Resurssit

```text
id
name
description
type
location
capacity
available
```

Esimerkiksi:

```text
Neuvotteluhuone A
Neuvotteluhuone B
Projektori 1
Pakettiauto 1
```

### Varaukset

```text
id
resourceId
userId
startTime
endTime
status
description
```

Varausten tiloja:

```text
ACTIVE
CANCELLED
```

---

# 4. Tärkein liiketoimintalogiikka

Tässä projektista tulee tutkimuksen kannalta kiinnostava.

Järjestelmän pitää esimerkiksi estää päällekkäiset varaukset.

Jos:

```text
Huone A
10:00–12:00
```

on varattu, käyttäjä ei voi tehdä:

```text
Huone A
11:00–13:00
```

Mutta:

```text
Huone A
12:00–14:00
```

voi olla sallittu.

Tämän lisäksi voidaan tehdä validointeja:

- varauksen päättymisaika ei saa olla ennen alkua
- varauksen kesto ei saa ylittää tiettyä rajaa
- resurssin täytyy olla olemassa
- käyttäjän täytyy olla olemassa
- peruttu varaus ei saa estää uutta varausta
- käyttäjä ei saa muokata toisen käyttäjän varausta
- ylläpitäjä voi hallita kaikkia varauksia

Näistä syntyy luonnollisesti **testattavaa liiketoimintalogiikkaa**.

---

# 5. Frontendin näkymät

Riittävä mutta hallittava kokonaisuus voisi olla:

```text
Login
  │
  └── Dashboard
       │
       ├── Resources
       │    └── Resource details
       │
       ├── Calendar
       │
       ├── My reservations
       │
       └── Admin
            ├── Resources
            └── Reservations
```

Esimerkiksi käyttäjä valitsee resurssin:

```text
Neuvotteluhuone A

[Kalenteri]

10:00 ───────── 12:00
       VARATTU

12:00 ───────── 14:00
       [Varaa]
```

Tällaisessa käyttöliittymässä on myös paljon komponentteja, joiden rakennetta voidaan arvioida.

---

# 6. Backendin rakenne

Kannattaa tehdä backendistä riittävän strukturoitu, jotta SonarQube ja muut työkalut pystyvät arvioimaan rakennetta.

Esimerkiksi:

```text
src/
├── controllers/
│   ├── reservationController.ts
│   ├── resourceController.ts
│   └── userController.ts
│
├── services/
│   ├── reservationService.ts
│   ├── resourceService.ts
│   └── userService.ts
│
├── repositories/
│   ├── reservationRepository.ts
│   ├── resourceRepository.ts
│   └── userRepository.ts
│
├── routes/
│   ├── reservationRoutes.ts
│   ├── resourceRoutes.ts
│   └── userRoutes.ts
│
├── models/
│   ├── reservation.ts
│   ├── resource.ts
│   └── user.ts
│
├── validation/
│   └── reservationValidation.ts
│
└── app.ts
```

Tämä antaa mahdollisuuden tarkastella esimerkiksi:

- moduulien välistä riippuvuutta
- funktioiden kompleksisuutta
- koodin duplikaatiota
- luettavuutta
- ylläpidettävyyttä
- testattavuutta

---

# 7. Frontendin rakenne

Esimerkiksi:

```text
src/
├── components/
│   ├── ResourceCard.tsx
│   ├── ReservationForm.tsx
│   ├── ReservationList.tsx
│   └── Calendar.tsx
│
├── pages/
│   ├── Dashboard.tsx
│   ├── Resources.tsx
│   ├── ResourceDetails.tsx
│   ├── MyReservations.tsx
│   └── Admin.tsx
│
├── services/
│   ├── resourceApi.ts
│   └── reservationApi.ts
│
├── hooks/
│   └── useReservations.ts
│
├── types/
│   ├── resource.ts
│   ├── reservation.ts
│   └── user.ts
│
└── App.tsx
```

Tässäkin syntyy mahdollisuuksia arvioida esimerkiksi komponenttien kokoa, kompleksisuutta ja duplikaatiota.

---

# 8. Tutkimuksen kannalta tärkeä asia: älä tee kaikkea kerralla

Tässä diplomityössä itse **kehitysprosessi on tutkimuksen aineistoa**.

Siksi suosittelen rakentamaan järjestelmän vaiheittain.

Esimerkiksi:

### Vaihe 1 – Perusrakenne

- React-projekti
- Node-projekti
- TypeScript
- REST API
- tietokanta
- ESLint
- Vitest
- Git

### Vaihe 2 – Resurssit

- resurssien listaaminen
- resurssin lisääminen
- resurssin muokkaaminen
- resurssin poistaminen

### Vaihe 3 – Varaukset

- varauksen luominen
- varausten hakeminen
- varauksen muuttaminen
- varauksen poistaminen

### Vaihe 4 – Validointi

- päällekkäiset varaukset
- aikarajat
- resurssin saatavuus
- käyttöoikeudet

### Vaihe 5 – Käyttöliittymä

- resurssinäkymä
- kalenteri
- varauslomake
- omat varaukset
- ylläpitäjän näkymä

### Vaihe 6 – Testit

- unit-testit
- komponenttitestit
- palvelukerroksen testit
- API-testit tarvittaessa

---

# 9. AI:n käyttö pitää suunnitella tutkimusta varten

Koska tutkimuskysymys liittyy **AI:n avulla tuotetun koodin laatuun**, Cursorin käyttö kannattaa pitää mahdollisimman systemaattisena.

Esimerkiksi kehityksessä:

> "Implement reservation creation endpoint."

Cursor tuottaa ensimmäisen version.

Sen jälkeen voit:

1. tarkistaa toiminnallisuuden
2. tehdä tarvittavat muutokset
3. kirjoittaa/testauttaa testit
4. ajaa ESLintin
5. ajaa Vitestin
6. kerätä coverage-tulokset
7. ajaa SonarQuben
8. tehdä commitin

Näin kehitysprosessista syntyy aineistoa.

---

# 10. Työkalujen roolit kannattaa erottaa

Tämä on myös tärkeää diplomityön metodologiassa.

| Työkalu | Mitä sillä arvioidaan? |
|---|---|
| Cursor | AI-avusteinen kehitys |
| SonarQube | Rakenteellinen koodin laatu |
| ESLint | Staattisen analyysin havainnot |
| Vitest | Testien toimivuus |
| Vitest Coverage | Testikattavuus |
| Git | Kehityshistoria |
| TypeScript | Tyypityksen tuottama laadullinen rakenne |

SonarQube voisi antaa esimerkiksi:

- Bugs
- Vulnerabilities
- Code Smells
- Duplications
- Complexity
- Maintainability
- Technical Debt

ESLint puolestaan antaa yksityiskohtaisempaa tietoa koodityylin ja staattisen analyysin ongelmista.

Vitest coverage antaa esimerkiksi:

- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

Näistä muodostuu varsin hyvä kokonaisuus **rakenteellisen laadun arviointiin**.

---

# 11. Yksi tärkeä rajaus

En lähtisi tässä työssä tekemään esimerkiksi:

- monimutkaista autentikaatiota
- sähköpostipalvelua
- maksamista
- kalenterisynkronointia
- reaaliaikaista WebSocket-järjestelmää
- monimutkaista käyttöoikeusjärjestelmää

Ne kasvattavat projektin kokoa, mutta eivät välttämättä paranna tutkimuksen kannalta aineistoa suhteessa työmäärään.

**Parempi tavoite on keskikokoinen, realistinen sovellus, jossa on riittävästi erilaisia koodirakenteita analysoitavaksi.**

---

## Ehdotus seuraavaksi

Rakentaisin tästä seuraavaksi **tarkan MVP-määrittelyn**, jossa määritellään:

1. käyttäjäroolit
2. resurssit
3. varaukset
4. kaikki tarvittavat API-endpointit
5. tietokannan taulut
6. React-näkymät
7. tärkeimmät liiketoimintasäännöt
8. testattavat tapaukset
9. mitä Cursorilla toteutetaan
10. missä kohdissa SonarQube-, ESLint- ja coverage-mittaukset tehdään

Tämä olisi hyvä tehdä ennen varsinaisen ohjelmoinnin aloittamista, koska samalla saadaan diplomityölle selkeä **projektin rajaus ja toteutussuunnitelma**.

## Prompt:
8/25/2026, 1:56:15 PM

Muodosta suunniteltu arkkitehtuuri

## Response:
8/25/2026, 1:56:17 PM

Resurssien varausjärjestelmälle sopii hyvin **kerrosarkkitehtuuri**, jossa React-frontend ja Node.js-backend ovat erillisiä kokonaisuuksia. Diplomityön kannalta arkkitehtuuri kannattaa pitää riittävän selkeänä, jotta AI:n tuottaman koodin laatua voidaan mitata eri kerroksissa.

## Suunniteltu arkkitehtuuri

```text
┌─────────────────────────────────────────────────────────────┐
│                        KÄYTTÄJÄ                              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND – React + TypeScript               │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │    Pages    │  │  Components  │  │   State / Hooks    │ │
│  └─────────────┘  └──────────────┘  └────────────────────┘ │
│                                                             │
│                    API Client / Services                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                       REST / JSON
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND – Node.js + TypeScript              │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                       Routes                          │  │
│  │  /users    /resources    /reservations                │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              ▼                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Controllers                        │  │
│  │  HTTP-pyyntöjen vastaanotto ja vastaukset             │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              ▼                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      Services                         │  │
│  │  Liiketoimintalogiikka                                │  │
│  │  - varauksen luonti                                   │  │
│  │  - päällekkäisyyksien tarkistus                       │  │
│  │  - resurssien hallinta                                │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              ▼                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Repositories                        │  │
│  │  Tietokannan käsittely                                │  │
│  └───────────────────────────┬───────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         DATABASE                            │
│                                                             │
│       Users       Resources       Reservations              │
└─────────────────────────────────────────────────────────────┘
```

### Frontend

Frontend kannattaa jakaa neljään pääosaan:

```text
frontend/
└── src/
    ├── pages/
    ├── components/
    ├── hooks/
    ├── services/
    └── types/
```

**Pages** sisältää sovelluksen näkymät, kuten:

- Dashboard
- Resources
- ResourceDetails
- MyReservations
- Admin

**Components** sisältää uudelleenkäytettävät käyttöliittymäkomponentit:

- ResourceCard
- ReservationForm
- ReservationList
- Calendar
- ResourceSelector

**Hooks** sisältää esimerkiksi varauksiin ja resursseihin liittyvän tilanhallinnan.

**Services** vastaa backendin API-kutsujen tekemisestä.

---

### Backend

Backendin tärkein rakenne olisi:

```text
backend/
└── src/
    ├── routes/
    ├── controllers/
    ├── services/
    ├── repositories/
    ├── models/
    ├── validation/
    ├── middleware/
    └── app.ts
```

Riippuvuuksien pitäisi kulkea pääasiassa yhteen suuntaan:

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Repositories
   ↓
Database
```

Tämä on tutkimuksen kannalta hyödyllistä, koska SonarQube pystyy analysoimaan eri kerroksissa tuotettua koodia ja niiden välisiä riippuvuuksia.

## Keskeiset moduulit

Järjestelmän domain voidaan jakaa kolmeen pääalueeseen:

```text
                    Reservation System
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
       Users           Resources        Reservations
          │                │                │
          │                │                │
          └────────────────┴────────────────┘
                           │
                     Business Rules
```

### User

Vastaa käyttäjistä ja käyttöoikeuksista.

```text
User
├── id
├── name
├── email
└── role
```

### Resource

Vastaa varattavista resursseista.

```text
Resource
├── id
├── name
├── description
├── type
├── location
├── capacity
└── available
```

### Reservation

Vastaa varsinaisista varauksista.

```text
Reservation
├── id
├── resourceId
├── userId
├── startTime
├── endTime
├── status
└── description
```

## Tärkein liiketoimintalogiikka

Reservation Service olisi arkkitehtuurin keskeinen osa:

```text
ReservationService
       │
       ├── createReservation()
       │       ├── validateTime()
       │       ├── checkResource()
       │       └── checkOverlap()
       │
       ├── updateReservation()
       │
       ├── cancelReservation()
       │
       └── getReservations()
```

Esimerkiksi uuden varauksen yhteydessä:

```text
POST /reservations
        │
        ▼
ReservationController
        │
        ▼
ReservationService
        │
        ├── Onko resurssi olemassa?
        │
        ├── Onko aika validi?
        │
        ├── Onko resurssi vapaana?
        │
        └── Onko päällekkäisiä varauksia?
                │
                ▼
       ReservationRepository
                │
                ▼
            Database
```

Tämä on erityisen hyvä kohta AI:n tuottaman koodin laadun tutkimiseen, koska sama toiminnallisuus sisältää sekä yksinkertaista CRUD-koodia että monimutkaisempaa liiketoimintalogiikkaa.

## Testaus sijoittuu jokaiseen kerrokseen

Testauksen näkökulmasta arkkitehtuuri voidaan esittää näin:

```text
React Components
       │
       └── Component tests
              │
              ▼
       Services / Hooks
       └── Unit tests
              │
              ▼
       Backend Services
       └── Unit tests
              │
              ▼
       Controllers / API
       └── Integration tests
```

Vitestillä voidaan kerätä coverage-tiedot koko testikokonaisuudesta tai frontend- ja backend-projekteista erikseen.

## Laadun mittaus arkkitehtuurissa

Varsinainen tutkimusasetelma voidaan sijoittaa arkkitehtuurin ympärille:

```text
                    Cursor
                      │
                      ▼
              AI-avusteinen kehitys
                      │
                      ▼
┌──────────────────────────────────────────────┐
│              React + TypeScript              │
│                    +                         │
│             Node.js + TypeScript             │
└──────────────────────┬───────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      SonarQube      ESLint    Vitest Coverage
          │            │            │
          ▼            ▼            ▼
      Rakenteellinen koodin laatu
```

Tässä arkkitehtuurissa **Cursor ei ole osa tuotantokoodin arkkitehtuuria**, vaan kehitysympäristö ja tutkimuksen kannalta keskeinen AI-avusteisen kehityksen väline. Vastaavasti SonarQube, ESLint ja Vitest ovat **laadun arvioinnin ja aineiston keruun välineitä**, eivät sovelluksen runtime-komponentteja.

Tällä rakenteella projektista tulee sopivan kokoinen ja samalla arkkitehtuuri tukee hyvin diplomityön varsinaista tavoitetta: **AI-avusteisesti tuotetun ohjelmiston koodin laadun systemaattista arviointia.**

## Prompt:
8/25/2026, 2:09:03 PM

Aukaise lisää backendin arkkitehtuuria

## Response:
8/25/2026, 2:09:05 PM

Backendissä suosittelisin **kerrosarkkitehtuuria**, jossa jokaisella kerroksella on selkeä vastuu. Diplomityön kannalta tämä on hyvä ratkaisu, koska rakenne antaa SonarQubelle ja ESLintille paljon analysoitavaa ja samalla AI:n tuottaman koodin laatua voidaan tarkastella eri tasoilla.

## 1. Backendin kokonaisrakenne

```text
backend/
└── src/
    │
    ├── app.ts
    │
    ├── routes/
    │   ├── resourceRoutes.ts
    │   ├── reservationRoutes.ts
    │   └── userRoutes.ts
    │
    ├── controllers/
    │   ├── resourceController.ts
    │   ├── reservationController.ts
    │   └── userController.ts
    │
    ├── services/
    │   ├── resourceService.ts
    │   ├── reservationService.ts
    │   └── userService.ts
    │
    ├── repositories/
    │   ├── resourceRepository.ts
    │   ├── reservationRepository.ts
    │   └── userRepository.ts
    │
    ├── models/
    │   ├── Resource.ts
    │   ├── Reservation.ts
    │   └── User.ts
    │
    ├── validation/
    │   ├── resourceValidation.ts
    │   └── reservationValidation.ts
    │
    ├── middleware/
    │   ├── errorHandler.ts
    │   └── authMiddleware.ts
    │
    └── types/
        └── ...
```

Ajatus on:

```text
HTTP
 ↓
Routes
 ↓
Controllers
 ↓
Services
 ↓
Repositories
 ↓
Database
```

Lisäksi:

```text
Validation ────────► Controllers / Services
Middleware ────────► HTTP-käsittely
Models / Types ────► Muut kerrokset
```

---

# 2. Routes

**Routes määrittelevät API:n rajapinnan.**

Esimerkiksi:

```text
GET    /api/resources
GET    /api/resources/:id
POST   /api/resources
PUT    /api/resources/:id
DELETE /api/resources/:id

GET    /api/reservations
GET    /api/reservations/:id
POST   /api/reservations
PUT    /api/reservations/:id
DELETE /api/reservations/:id
```

`reservationRoutes.ts` voisi siis määritellä esimerkiksi:

```text
POST /api/reservations
        ↓
reservationController.createReservation
```

Routes-kerroksen ei pitäisi sisältää liiketoimintalogiikkaa.

Sen tehtävä on lähinnä:

> "Kun tähän URL-osoitteeseen tulee tietyn tyyppinen pyyntö, ohjaa se oikealle controllerille."

---

# 3. Controllers

Controller toimii HTTP:n ja sovelluksen sisäisen logiikan välissä.

Esimerkiksi:

```text
POST /api/reservations
```

saapuu:

```text
ReservationController
        │
        ├── lukee requestin
        ├── validoi syötteen
        ├── kutsuu serviceä
        └── muodostaa HTTP-responsen
```

Controllerin ei pitäisi päättää esimerkiksi sitä, onko resurssi varattavissa.

Huono:

```text
Controller
 ├── tarkista käyttäjä
 ├── tarkista resurssi
 ├── tarkista päällekkäisyys
 ├── tallenna tietokantaan
 └── muodosta response
```

Parempi:

```text
Controller
     │
     ▼
ReservationService
     │
     ▼
ReservationRepository
```

Controller vastaa siis ensisijaisesti **HTTP-tason käsittelystä**.

---

# 4. Services – backendin tärkein kerros

Service-kerroksessa sijaitsee **liiketoimintalogiikka**.

Tämä on mielestäni koko projektin kannalta tärkein osa backendistä.

Esimerkiksi:

```text
reservationService.ts

createReservation()
updateReservation()
cancelReservation()
getReservation()
getReservations()
```

### Varausta luotaessa

Logiikka voisi olla:

```text
createReservation()
        │
        ├── Tarkista käyttäjä
        │
        ├── Tarkista resurssi
        │
        ├── Tarkista alkamis- ja päättymisaika
        │
        ├── Tarkista päällekkäiset varaukset
        │
        ├── Tarkista käyttöoikeudet
        │
        └── Luo varaus
```

Esimerkiksi:

```text
                    createReservation
                           │
             ┌─────────────┼──────────────┐
             ▼             ▼              ▼
          User          Resource       Reservation
          exists?       exists?        overlaps?
             │             │              │
             └─────────────┼──────────────┘
                           ▼
                     Create reservation
```

Juuri tässä syntyy koodia, jossa voidaan tarkastella esimerkiksi:

- cyclomatic complexityä
- funktioiden kokoa
- koodin duplikaatiota
- maintainabilitya
- testattavuutta
- virheenkäsittelyä

Siksi tämä kerros on erittäin relevantti diplomityön aineistolle.

---

# 5. Repositoryt

Repository vastaa **tiedon tallentamisesta ja hakemisesta**.

Esimerkiksi:

```text
reservationRepository.ts
```

voisi sisältää:

```text
create()
findById()
findByUserId()
findByResourceId()
findOverlapping()
update()
delete()
```

Service ei siis suoraan käsittele SQL:ää tai tietokantakirjastoa.

Sen sijaan:

```text
ReservationService
        │
        ▼
ReservationRepository
        │
        ▼
Database
```

Esimerkiksi päällekkäisen varauksen tarkistaminen voisi olla:

```text
reservationService
        │
        │ findOverlapping(resourceId, start, end)
        ▼
reservationRepository
        │
        ▼
database
```

Tämä erottelu tekee arkkitehtuurista huomattavasti testattavamman.

---

# 6. Models

Models kuvaavat järjestelmän tietomalleja.

Esimerkiksi `Reservation`:

```text
Reservation
├── id
├── resourceId
├── userId
├── startTime
├── endTime
├── status
└── description
```

TypeScriptissä tämä voisi olla esimerkiksi:

```text
Reservation
```

jonka avulla varmistetaan, että eri kerrokset käsittelevät oikean muotoista dataa.

Tässä kannattaa kuitenkin tehdä myöhemmin päätös siitä, käytetäänkö erillisiä:

- domain-tyyppejä
- database-malleja
- DTO-tyyppejä

Diplomityön ensimmäiseen versioon en tekisi tästä tarpeettoman monimutkaista.

---

# 7. Validation

Validointi kannattaa erottaa liiketoimintalogiikasta ainakin osittain.

Esimerkiksi:

```text
POST /reservations
```

lähettää:

```text
{
    resourceId: 12,
    startTime: "...",
    endTime: "...",
    description: "..."
}
```

Validation tarkistaa esimerkiksi:

- `resourceId` on numero
- `startTime` on oikeassa muodossa
- `endTime` on oikeassa muodossa
- pakolliset kentät ovat olemassa

Sen sijaan:

> "Onko resurssi jo varattu kyseisenä ajankohtana?"

on liiketoimintalogiikkaa ja kuuluu **Service-kerrokseen**.

Tämä ero on tärkeä:

```text
Validation
    ↓
Onko data rakenteellisesti kelvollista?

Service
    ↓
Onko toiminto liiketoimintasääntöjen mukaan sallittu?
```

---

# 8. Middleware

Middleware käsittelee HTTP-pyyntöihin liittyviä yleisiä asioita.

Esimerkiksi:

```text
Request
   │
   ▼
authMiddleware
   │
   ▼
validation
   │
   ▼
controller
```

Middleware voisi myöhemmin vastata:

- autentikoinnista
- käyttöoikeuksista
- virheiden käsittelystä
- request loggingista

Esimerkiksi:

```text
authMiddleware
```

tarkistaa:

> Onko käyttäjä kirjautunut?

Mutta Service voi tarkistaa:

> Saako tämä käyttäjä poistaa tämän varauksen?

---

# 9. Esimerkki kokonaisesta pyynnöstä

Otetaan tärkein käyttötapaus:

**Käyttäjä tekee varauksen.**

### 1. Frontend

React lähettää:

```text
POST /api/reservations
```

### 2. Route

```text
reservationRoutes
        ↓
createReservation()
```

### 3. Controller

Controller vastaanottaa:

```text
req.body
```

ja kutsuu:

```text
reservationService.createReservation(...)
```

### 4. Service

Service suorittaa liiketoimintasäännöt:

```text
1. Käyttäjä löytyy
2. Resurssi löytyy
3. Resurssi on käytettävissä
4. Aika on validi
5. Varaus ei mene päällekkäin
6. Käyttäjällä on oikeus tehdä varaus
```

### 5. Repository

Jos kaikki on kunnossa:

```text
reservationRepository.create(...)
```

### 6. Database

Tietokantaan syntyy:

```text
Reservation
```

### 7. Response

Tieto kulkee takaisin:

```text
Database
   ↓
Repository
   ↓
Service
   ↓
Controller
   ↓
HTTP 201
   ↓
React
```

---

# 10. Backendin riippuvuudet

Arkkitehtuurin kannalta pyrkisin tähän:

```text
┌──────────────┐
│    Routes    │
└──────┬───────┘
       ▼
┌──────────────┐
│ Controllers  │
└──────┬───────┘
       ▼
┌──────────────┐
│   Services   │
└──────┬───────┘
       ▼
┌──────────────┐
│ Repositories │
└──────┬───────┘
       ▼
┌──────────────┐
│   Database   │
└──────────────┘
```

Ei esimerkiksi:

```text
Controller ─────► Database
     │
     └───────────► Repository
```

eikä:

```text
Repository ─────► Controller
```

Eli riippuvuudet kulkevat **alaspäin**, mikä tekee rakenteesta helpommin ymmärrettävän ja testattavan.

---

# 11. Testaus tässä arkkitehtuurissa

Tämä rakenne sopii erittäin hyvin Vitestille.

```text
Routes
   │
   └── tarvittaessa API/integration tests

Controllers
   │
   └── controller tests

Services
   │
   └── unit tests  ← tärkein

Repositories
   │
   └── repository/integration tests

Validation
   │
   └── unit tests
```

Erityisesti **Service-kerroksen unit-testit** ovat tutkimuksen kannalta kiinnostavia.

Esimerkiksi `ReservationService` voi sisältää 10–20 erilaista liiketoimintasääntöä, jolloin AI:n tuottaman testauksen kattavuutta ja itse koodin rakennetta voidaan arvioida.

---

## 12. Lopullinen backend-arkkitehtuuri

Diplomityötä varten lähtisin siis tästä:

```text
                    ┌───────────────┐
                    │    React      │
                    │   Frontend    │
                    └───────┬───────┘
                            │
                         REST API
                            │
                            ▼
┌─────────────────────────────────────────────────┐
│                  Node.js Backend                │
│                                                 │
│  ┌─────────────┐                                │
│  │   Routes    │                                │
│  └──────┬──────┘                                │
│         ▼                                       │
│  ┌─────────────┐                                │
│  │ Controllers │                                │
│  └──────┬──────┘                                │
│         ▼                                       │
│  ┌─────────────┐                                │
│  │  Services   │ ◄── Business Logic             │
│  └──────┬──────┘                                │
│         ▼                                       │
│  ┌─────────────┐                                │
│  │Repositories │ ◄── Data Access               │
│  └──────┬──────┘                                │
│         │                                       │
│  ┌──────┴──────┐                                │
│  │  Database   │                                │
│  └─────────────┘                                │
│                                                 │
│  Validation / Middleware / Types                │
└─────────────────────────────────────────────────┘
```

**Tämä olisi mielestäni hyvä lähtökohta diplomityön toteutukselle.** Se ei ole tarpeettoman monimutkainen, mutta sisältää riittävästi kerroksia ja liiketoimintalogiikkaa, jotta AI:n tuottaman koodin laatua voidaan aidosti mitata SonarQubella, ESLintillä ja Vitestillä.

## Prompt:
9/1/2026, 4:08:31 PM

Mitä tietokantaa suosittelet

## Response:
9/1/2026, 4:08:33 PM

Tähän diplomityöprojektiin suosittelisin **PostgreSQL:ää**.

### Miksi PostgreSQL?

Resurssien varausjärjestelmä on luonteeltaan hyvin **relaatiotietokantaongelma**:

```text
User
  │
  └────< Reservation >──── Resource
```

Varauksella on siis viittaukset sekä käyttäjään että resurssiin, ja tietokannan pitää pystyä käsittelemään esimerkiksi:

- käyttäjät
- resurssit
- varaukset
- käyttäjien ja varausten suhteet
- resurssien ja varausten suhteet
- aikavälien päällekkäisyydet
- transaktiot
- tietojen eheys

PostgreSQL sopii näihin erittäin hyvin.

### Ehdottamani kokonaisuus

```text
React + TypeScript
        │
        │ REST / JSON
        ▼
Node.js + TypeScript
        │
        │
        ▼
PostgreSQL
```

Backendissä käyttäisin esimerkiksi:

```text
Node.js
   │
   ├── Express
   │
   ├── TypeScript
   │
   └── PostgreSQL
          ▲
          │
      PostgreSQL driver
```

ORM:n suhteen on kaksi järkevää vaihtoehtoa:

**Prisma** olisi helppo ja moderni valinta:

```text
Node.js
   │
   ▼
Prisma
   │
   ▼
PostgreSQL
```

Tai jos haluat pitää tietokantakerroksen mahdollisimman lähellä SQL:ää, voit käyttää esimerkiksi `pg`-kirjastoa.

### Diplomityön kannalta valitsisin Prisman

Syynä ei ole pelkästään kehityksen helppous. Tutkimuksessasi **tietokanta ei itsessään ole tutkimuksen kohde**, vaan AI:n tuottaman sovelluskoodin laatu.

Prisma vähentää tietokantaan liittyvän boilerplaten määrää, jolloin Cursorin tuottamasta koodista jää enemmän analysoitavaa esimerkiksi:

- service-kerrokseen
- validointiin
- API-logiikkaan
- React-komponentteihin
- testaukseen
- liiketoimintasääntöihin

Esimerkiksi:

```text
ReservationService
        │
        ▼
ReservationRepository
        │
        ▼
      Prisma
        │
        ▼
   PostgreSQL
```

Tämä sopii hyvin aiemmin suunniteltuun backend-arkkitehtuuriin.

### Tietokannan rakenne

Aloittaisin vain kolmella päätaululla:

```text
┌──────────────┐
│    users     │
├──────────────┤
│ id           │
│ name         │
│ email        │
│ role         │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────────┐
│   reservations   │
├──────────────────┤
│ id               │
│ user_id          │
│ resource_id      │
│ start_time       │
│ end_time         │
│ status           │
│ description      │
└────────┬─────────┘
         │
         │ N:1
         ▼
┌──────────────┐
│  resources   │
├──────────────┤
│ id           │
│ name         │
│ description  │
│ type         │
│ location     │
│ capacity     │
│ available    │
└──────────────┘
```

Tällä saadaan jo varsin paljon mielenkiintoista backend-logiikkaa.

**Suositukseni siis: PostgreSQL + Prisma + Node.js + TypeScript.**

Seuraavaksi olisi järkevää suunnitella tästä **tarkka tietokantamalli (ER-kaavio + taulujen kentät + suhteet + rajoitteet)** ennen kuin lähdetään määrittelemään API-endpointteja.

## Prompt:
9/1/2026, 4:14:17 PM

Muodosta vielä selkeä hahmotelma ohjelmiston vaatimuksista

## Response:
9/1/2026, 4:14:19 PM

Tässä kannattaa erottaa **toiminnalliset vaatimukset**, **ei-toiminnalliset vaatimukset** ja **tekniset vaatimukset**. Diplomityössä tämä antaa myös hyvän pohjan myöhemmälle toteutukselle ja testaukselle.

# Resurssien varausjärjestelmän vaatimukset

## 1. Järjestelmän tarkoitus

Järjestelmän tarkoituksena on mahdollistaa erilaisten resurssien varaaminen tietylle ajanjaksolle. Käyttäjä voi tarkastella käytettävissä olevia resursseja, tehdä ja hallita omia varauksiaan. Ylläpitäjä voi hallita järjestelmän resursseja ja varauksia.

Järjestelmä toteutetaan web-sovelluksena.

---

# 2. Käyttäjäroolit

Järjestelmässä on kaksi käyttäjäroolia:

### Tavallinen käyttäjä

Voi:

- kirjautua järjestelmään
- tarkastella resursseja
- tarkastella resurssien saatavuutta
- tehdä varauksia
- tarkastella omia varauksiaan
- muokata omia aktiivisia varauksiaan
- perua omia varauksiaan

### Ylläpitäjä

Voi lisäksi:

- lisätä resursseja
- muokata resursseja
- poistaa resursseja
- tarkastella kaikkien käyttäjien varauksia
- muokata ja perua muiden käyttäjien varauksia

---

# 3. Toiminnalliset vaatimukset

## 3.1 Käyttäjien hallinta

**V1.** Järjestelmän tulee mahdollistaa käyttäjän kirjautuminen.

**V2.** Järjestelmän tulee tunnistaa kirjautuneen käyttäjän rooli.

**V3.** Järjestelmän tulee rajoittaa toimintoja käyttäjän roolin perusteella.

**V4.** Käyttäjän tulee voida tarkastella omia tietojaan.

---

## 3.2 Resurssien hallinta

**V5.** Käyttäjän tulee voida tarkastella järjestelmän resursseja.

**V6.** Käyttäjän tulee voida tarkastella yksittäisen resurssin tietoja.

**V7.** Ylläpitäjän tulee voida lisätä uusi resurssi.

**V8.** Ylläpitäjän tulee voida muokata resurssin tietoja.

**V9.** Ylläpitäjän tulee voida poistaa resurssi.

**V10.** Resurssilla tulee olla vähintään nimi, kuvaus ja resurssityyppi.

Esimerkiksi:

```text
Neuvotteluhuone A
Tyyppi: Kokoustila
Sijainti: 2. kerros
Kapasiteetti: 8 henkilöä
```

---

# 4. Varausten hallinta

Tämä on järjestelmän keskeinen toiminnallinen kokonaisuus.

**V11.** Käyttäjän tulee voida tarkastella resurssin varattuja ajankohtia.

**V12.** Käyttäjän tulee voida valita varauksen alku- ja loppuaika.

**V13.** Käyttäjän tulee voida tehdä varaus vapaana olevalle resurssille.

**V14.** Järjestelmän tulee tallentaa varaus käyttäjän tietoihin.

**V15.** Käyttäjän tulee voida tarkastella omia varauksiaan.

**V16.** Käyttäjän tulee voida muokata omaa aktiivista varaustaan.

**V17.** Käyttäjän tulee voida perua oma varauksensa.

**V18.** Ylläpitäjän tulee voida tarkastella kaikkia varauksia.

**V19.** Ylläpitäjän tulee voida perua muiden käyttäjien varauksia.

---

# 5. Varausten liiketoimintasäännöt

Näihin kannattaa panostaa erityisesti, koska ne tuottavat projektiin mielekästä testattavaa liiketoimintalogiikkaa.

### Päällekkäiset varaukset

**V20.** Sama resurssi ei saa olla varattuna kahdelle käyttäjälle samanaikaisesti.

```text
10:00 ───────── 12:00
        VARAUS A

11:00 ───────── 13:00
        ❌ EI SALLITTU
```

Mutta:

```text
10:00 ───────── 12:00
        VARAUS A

12:00 ───────── 14:00
        ✓ SALLITTU
```

### Aikojen validointi

**V21.** Varauksen loppuajan tulee olla alkamisajan jälkeen.

**V22.** Varaus ei saa olla tyhjä tai kestoltaan nolla.

**V23.** Varauksen enimmäiskesto tulee määritellä järjestelmän säännöissä.

Esimerkiksi enintään 8 tuntia.

### Resurssin saatavuus

**V24.** Poistettu tai käytöstä poistettu resurssi ei saa olla varattavissa.

**V25.** Järjestelmän tulee tarkistaa resurssin saatavuus ennen varauksen luomista.

### Varausten muuttaminen

**V26.** Käyttäjä ei saa muokata toisen käyttäjän varausta.

**V27.** Peruttua varausta ei saa muokata aktiiviseksi varaukseksi ilman erillistä toimintoa.

---

# 6. Käyttöliittymän vaatimukset

Järjestelmään toteutetaan vähintään seuraavat näkymät:

```text
┌──────────────────────────────┐
│ Login                        │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ Dashboard                    │
├──────────────────────────────┤
│ • Resurssit                  │
│ • Varauskalenteri            │
│ • Omat varaukset             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Resource details             │
│                              │
│ Resource information         │
│ Availability                 │
│ [Make reservation]           │
└──────────────────────────────┘
```

Ylläpitäjälle:

```text
Admin
├── Resources
│   ├── List
│   ├── Add
│   └── Edit
│
└── Reservations
    ├── List
    └── Manage
```

---

# 7. API-vaatimukset

Backend tarjoaa REST-rajapinnan.

### Users

```text
GET    /api/users/me
```

### Resources

```text
GET    /api/resources
GET    /api/resources/:id
POST   /api/resources
PUT    /api/resources/:id
DELETE /api/resources/:id
```

### Reservations

```text
GET    /api/reservations
GET    /api/reservations/:id
POST   /api/reservations
PUT    /api/reservations/:id
DELETE /api/reservations/:id
```

Kaikki tarvittavat käyttöoikeus- ja liiketoimintasäännöt käsitellään backendissä.

---

# 8. Ei-toiminnalliset vaatimukset

Nämä ovat diplomityön kannalta erityisen kiinnostavia.

### Koodin laatu

**N1.** Sovelluksen tulee noudattaa TypeScriptin tyypitystä.

**N2.** Koodin tulee noudattaa määriteltyjä ESLint-sääntöjä.

**N3.** Sovelluksen koodin tulee olla analysoitavissa SonarQubella.

**N4.** Sovelluksen keskeisille toiminnoille tulee olla automatisoidut testit.

**N5.** Testauksesta tulee kerätä coverage-mittarit Vitestillä.

### Ylläpidettävyys

**N6.** Backend tulee jakaa selkeisiin kerroksiin:

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Repositories
   ↓
Database
```

**N7.** Frontend ja backend tulee pitää erillisinä kokonaisuuksina.

**N8.** Liiketoimintalogiikka tulee sijoittaa palvelukerrokseen eikä HTTP-käsittelyn yhteyteen.

---

# 9. Teknologiset vaatimukset

Projektin teknologiat voidaan määritellä tässä vaiheessa:

| Osa | Teknologia |
|---|---|
| Frontend | React |
| Frontend-kieli | TypeScript |
| Backend | Node.js |
| Backend-kieli | TypeScript |
| API | REST |
| Tietokanta | PostgreSQL |
| ORM | Prisma |
| Testaus | Vitest |
| Test coverage | Vitest Coverage |
| Staattinen analyysi | ESLint |
| Koodin laadun analyysi | SonarQube |
| AI-kehitystyökalu | Cursor |
| Versionhallinta | Git |

---

# 10. Tutkimuksen kannalta tärkeä vaatimus

Lisäisin vielä yhden kokonaisuuden, jota tavallisessa ohjelmistoprojektissa ei välttämättä olisi:

### Kehitysprosessin dokumentointi

**T1.** AI:n käyttö kehityksen aikana tulee dokumentoida.

**T2.** Merkittävät Cursorille annetut tehtävänannot/promptit tulee säilyttää.

**T3.** AI:n tuottamat merkittävät koodimuutokset tulee pystyä yhdistämään kehityshistoriaan.

**T4.** SonarQuben analyysitulokset tulee tallentaa määritellyissä mittauspisteissä.

**T5.** ESLint-analyysin tulokset tulee tallentaa määritellyissä mittauspisteissä.

**T6.** Vitest coverage -tulokset tulee tallentaa määritellyissä mittauspisteissä.

Tällöin ohjelmiston kehitysprosessi voidaan myöhemmin yhdistää mitattuihin laatutuloksiin.

---

## Kokonaisuus tiivistettynä

```text
                RESURSSIEN VARAUSJÄRJESTELMÄ
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
    USERS              RESOURCES          RESERVATIONS
       │                   │                   │
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                     BUSINESS RULES
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
      Validation       Permissions      Availability
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                     PostgreSQL
```

Ja diplomityön näkökulmasta:

```text
                    Cursor
                      │
                      ▼
              AI-avusteinen kehitys
                      │
                      ▼
                 Sovellus
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
    SonarQube       ESLint      Vitest
        │             │             │
        └─────────────┼─────────────┘
                      ▼
                Tutkimusaineisto
                      │
                      ▼
             Koodin laadun arviointi
```

**Rajaisin ensimmäisen version juuri näihin vaatimuksiin.** Niitä on tarpeeksi, jotta sovelluksesta tulee realistinen ja koodia syntyy riittävästi laadun analysointiin, mutta järjestelmä ei kasva diplomityön kannalta tarpeettoman suureksi.

## Prompt:
9/1/2026, 4:24:15 PM

Tarkoitan erityisesti toiminnallisia vaatimuksia

## Response:
9/1/2026, 4:24:18 PM

Kyllä. Jos keskitytään **nimenomaan ohjelmiston toiminnallisiin vaatimuksiin**, tekisin niistä hieman yksinkertaisemmat ja käyttäjän näkökulmasta määritellyt. Tässä vaiheessa ei vielä tarvitse määritellä teknistä toteutusta.

## Resurssien varausjärjestelmän toiminnalliset vaatimukset

### 1. Käyttäjän kirjautuminen

**V1. Käyttäjä voi kirjautua järjestelmään.**

**V2. Järjestelmä tunnistaa kirjautuneen käyttäjän ja tämän käyttöoikeudet.**

**V3. Käyttäjä voi kirjautua ulos järjestelmästä.**

---

### 2. Resurssien tarkastelu

**V4. Käyttäjä voi tarkastella järjestelmän resursseja.**

**V5. Käyttäjä voi tarkastella yksittäisen resurssin tietoja.**

Resurssin tietoja voivat olla esimerkiksi:

- nimi
- tyyppi
- kuvaus
- sijainti
- kapasiteetti
- saatavuus

**V6. Käyttäjä voi suodattaa resursseja esimerkiksi resurssityypin tai sijainnin perusteella.**

**V7. Käyttäjä voi hakea resursseja nimen perusteella.**

---

### 3. Resurssin saatavuuden tarkastelu

**V8. Käyttäjä voi tarkastella resurssin varauksia valitulta ajanjaksolta.**

**V9. Järjestelmä näyttää käyttäjälle, mitkä ajankohdat resurssista ovat vapaana ja mitkä varattuna.**

**V10. Käyttäjä voi valita ajankohdan, jolle haluaa tehdä varauksen.**

Esimerkiksi:

```text
Neuvotteluhuone A

08:00 ────────────────
09:00     Vapaa
10:00     Varattu
11:00     Varattu
12:00     Vapaa
13:00     Vapaa
14:00     Varattu
15:00 ────────────────
```

---

# 4. Varausten tekeminen

Tämä on järjestelmän tärkein toiminnallinen kokonaisuus.

**V11. Käyttäjä voi tehdä varauksen vapaana olevalle resurssille.**

**V12. Käyttäjä määrittelee varaukselle alkamis- ja päättymisajan.**

**V13. Käyttäjä voi antaa varaukselle kuvauksen tai lisätiedon.**

**V14. Järjestelmä tarkistaa resurssin saatavuuden ennen varauksen vahvistamista.**

**V15. Järjestelmä estää päällekkäisten varausten tekemisen samalle resurssille.**

**V16. Järjestelmä vahvistaa onnistuneen varauksen käyttäjälle.**

Esimerkiksi:

```text
Käyttäjä
   │
   ▼
Valitsee resurssin
   │
   ▼
Valitsee ajan
   │
   ▼
Lisää lisätiedot
   │
   ▼
Varaa
   │
   ├── Aika vapaa → Varaus luodaan
   │
   └── Aika varattu → Varausta ei luoda
```

---

# 5. Omat varaukset

**V17. Käyttäjä voi tarkastella omia varauksiaan.**

**V18. Käyttäjä voi tarkastella yksittäisen varauksen tietoja.**

**V19. Käyttäjä voi muokata omaa varaustaan.**

**V20. Käyttäjä voi perua oman varauksensa.**

**V21. Järjestelmä näyttää varauksen tilan.**

Esimerkiksi:

```text
Omat varaukset

┌────────────────────────────────────┐
│ Neuvotteluhuone A                  │
│ 15.9.2026  10:00–12:00             │
│ Tila: Aktiivinen                   │
│                                    │
│ [Muokkaa] [Peruuta]                │
└────────────────────────────────────┘
```

---

# 6. Varausten hallinta

Järjestelmän pitää käsitellä varausten elinkaarta.

**V22. Varaus voidaan luoda.**

**V23. Varausta voidaan muokata.**

**V24. Varaus voidaan perua.**

**V25. Peruttu varaus ei enää estä resurssin varaamista samalle ajankohdalle.**

**V26. Järjestelmä säilyttää tiedon perutusta varauksesta.**

Tämä on parempi kuin fyysinen poistaminen, koska tutkimusprojektissa voidaan samalla pitää tietomalli suhteellisen realistisena.

---

# 7. Ylläpitäjän resurssienhallinta

Ylläpitäjällä on tavallista käyttäjää laajemmat oikeudet.

**V27. Ylläpitäjä voi lisätä uuden resurssin.**

**V28. Ylläpitäjä voi muokata resurssin tietoja.**

**V29. Ylläpitäjä voi poistaa resurssin käytöstä.**

**V30. Ylläpitäjä voi palauttaa resurssin käytettäväksi.**

Itse asiassa käyttäisin tässä mieluummin **aktiivinen / epäaktiivinen**-tilaa kuin resurssin fyysistä poistamista.

```text
Resource
    │
    ├── ACTIVE
    │
    └── INACTIVE
```

Tällöin vanhat varaukset eivät rikkoudu, vaikka resurssi poistetaan käytöstä.

---

# 8. Ylläpitäjän varaustenhallinta

**V31. Ylläpitäjä voi tarkastella kaikkia varauksia.**

**V32. Ylläpitäjä voi suodattaa varauksia resurssin, käyttäjän tai ajankohdan perusteella.**

**V33. Ylläpitäjä voi tarkastella yksittäisen varauksen tietoja.**

**V34. Ylläpitäjä voi perua varauksen.**

---

# 9. Käyttöoikeudet

Nämä ovat toiminnallisia vaatimuksia, koska ne määrittelevät järjestelmän käyttäjän toiminnan.

**V35. Tavallinen käyttäjä voi hallita ainoastaan omia varauksiaan.**

**V36. Tavallinen käyttäjä ei voi hallita resursseja.**

**V37. Tavallinen käyttäjä ei voi hallita muiden käyttäjien varauksia.**

**V38. Ylläpitäjä voi hallita kaikkia resursseja.**

**V39. Ylläpitäjä voi hallita kaikkia varauksia.**

---

# 10. Varausten liiketoimintasäännöt

Näistä tekisin omat vaatimuksensa, koska ne ovat myös erittäin hyviä testitapauksia.

**V40. Resurssille ei voi tehdä päällekkäisiä aktiivisia varauksia.**

**V41. Varauksen päättymisajan tulee olla alkamisajan jälkeen.**

**V42. Käyttäjä ei voi tehdä varausta epäaktiiviselle resurssille.**

**V43. Käyttäjä ei voi muokata toisen käyttäjän varausta.**

**V44. Peruttua varausta ei voi muokata normaalisti.**

**V45. Järjestelmä tarkistaa varausten päällekkäisyydet myös varausta muokattaessa.**

**V46. Varaus voidaan tehdä vain määritellylle ajanjaksolle.**

---

# 11. Kokonaisuus käyttäjän näkökulmasta

Näistä muodostuu melko selkeä käyttötapaus:

```text
                    KIRJAUTUMINEN
                         │
                         ▼
                    DASHBOARD
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
         RESURSSIT              VARAUKSET
              │                     │
              ▼                     ▼
     Resurssin tiedot          Omat varaukset
              │                     │
              ▼                     │
       Saatavuuskalenteri           │
              │                     │
              ▼                     │
        Tee varaus ◄────────────────┘
              │
              ▼
       Tarkista saatavuus
              │
        ┌─────┴─────┐
        ▼           ▼
      Vapaa       Varattu
        │           │
        ▼           ▼
     Luo varaus   Ilmoita käyttäjälle
```

Ylläpitäjälle:

```text
                     ADMIN
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
       RESURSSIT              VARAUKSET
            │                     │
      ┌─────┼─────┐               │
      ▼     ▼     ▼               ▼
    Lisää  Muokkaa Aktivoi/   Tarkastele
                  poista      kaikkia
                               varauksia
```

## Suosittelisin lopulliseksi MVP-rajoitukseksi

En ottaisi kaikkia 46 vaatimusta välttämättä ensimmäiseen toteutusversioon. **Varsinaiseksi MVP:ksi** rajaisin:

| Kokonaisuus | Vaatimukset |
|---|---|
| Käyttäjät | kirjautuminen, roolit |
| Resurssit | listaus, tiedot, haku/suodatus |
| Saatavuus | kalenteri / vapaat ajat |
| Varaaminen | luonti, validointi, päällekkäisyyksien esto |
| Omat varaukset | tarkastelu, muokkaus, peruminen |
| Ylläpito | resurssien hallinta |
| Ylläpito | kaikkien varausten tarkastelu |
| Liiketoimintalogiikka | aikojen ja käyttöoikeuksien validointi |

Tämä antaa jo **varsin hyvän keskikokoisen web-sovelluksen**, jossa on CRUD-toimintoja, tilanhallintaa, käyttöoikeuksia, API-kutsuja ja ennen kaikkea ei-triviaalia liiketoimintalogiikkaa. Se on juuri sitä koodia, jonka laadun arviointiin SonarQube, ESLint ja Vitest coverage soveltuvat hyvin.

## Prompt:
9/7/2026, 4:50:48 PM

Muodostetaan pohjustus prompt cursorille jossa tehtdään perus setup projektia varten

## Response:
9/7/2026, 4:50:53 PM

Kyllä. Tässä vaiheessa tekisin Cursorille **yhden selkeän pohjustuspromptin**, jonka tarkoitus on ainoastaan luoda projektin tekninen perusta. Varsinaisia ominaisuuksia ei vielä toteuteta.

Promptissa kannattaa myös kertoa Cursorille, että kyseessä on diplomityön tutkimusprojekti. Tällöin se ymmärtää, että **selkeä ja ylläpidettävä arkkitehtuuri on tärkeämpi kuin mahdollisimman nopea toteutus**.

### Pohjustusprompt Cursorille

**document: **

# Resource Reservation System - Project Setup

We are developing a resource reservation web application as part of a Master's thesis.

The purpose of the thesis is to study the structural quality and maintainability of software developed with AI assistance. The application will be developed primarily using Cursor.

The application itself is a resource reservation system where users can browse resources, view availability and make reservations. Administrators will later be able to manage resources and reservations.

At this stage, **do not implement application features or business logic**. The goal of this task is only to create a clean and maintainable project foundation.

## Technology stack

Use the following technologies:

### Frontend
- React
- TypeScript
- Vite
- ESLint
- Vitest
- Vitest Coverage

### Backend
- Node.js
- TypeScript
- Express
- ESLint
- Vitest
- Vitest Coverage

### Database
- PostgreSQL
- Prisma ORM

### Development
- Git
- npm or pnpm

Do not introduce additional frameworks or libraries unless they are clearly necessary for the basic project setup.

## Project structure

Create a monorepo-style project with clearly separated frontend and backend applications.

Suggested structure:

```text
resource-reservation/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── validation/
│   │   ├── middleware/
│   │   └── app.ts
│   ├── prisma/
│   ├── package.json
│   └── ...
│
├── README.md
├── .gitignore
└── ...
```

The frontend and backend must remain independent applications.

## Backend architecture

Prepare the backend for the following layered architecture:

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Repositories
   ↓
Database
```

The responsibilities should be clearly separated:

- Routes define API endpoints and route requests to controllers.
- Controllers handle HTTP requests and responses.
- Services contain business logic.
- Repositories handle database access.
- Models and types define application data structures.
- Validation handles input validation.
- Middleware handles cross-cutting HTTP concerns such as error handling and, later, authentication.

Do not implement actual reservation, resource or user functionality yet.

## Frontend architecture

Prepare the frontend for a component-based architecture.

Use the following structure:

```text
frontend/src/
├── components/
├── pages/
├── hooks/
├── services/
├── types/
├── App.tsx
└── main.tsx
```

The purpose of these directories should be clear from the beginning:

- components: reusable UI components
- pages: application-level views
- hooks: reusable React logic
- services: communication with the backend API
- types: shared frontend TypeScript types

Do not create unnecessary abstractions before they are needed.

## TypeScript

Use strict TypeScript configuration.

Enable appropriate strict compiler options and avoid using `any` unless there is a strong technical reason.

The project should be configured so that TypeScript errors are treated seriously during development.

## ESLint

Configure ESLint for both frontend and backend.

The configuration should support:

- TypeScript
- React and JSX in the frontend
- common TypeScript safety rules
- unused variable detection
- consistent code quality rules

Do not introduce an excessively large collection of stylistic rules.

The goal is to detect actual code quality and correctness issues rather than enforce arbitrary formatting preferences.

## Formatting

Set up a consistent code formatting solution.

Use Prettier if it is appropriate for the project.

Formatting should be separate from ESLint's responsibility where possible.

## Testing

Configure Vitest for both frontend and backend.

The initial setup should include at least one simple test in each application to verify that the testing environment works.

Also configure Vitest Coverage so that coverage reports can later be generated.

Do not attempt to achieve meaningful application coverage at this stage because application functionality has not yet been implemented.

## SonarQube

Prepare the project so that SonarQube can later analyze both frontend and backend source code.

Add the necessary configuration files, but do not require a SonarQube server to run during the initial setup.

The configuration should allow us to analyze:

- bugs
- code smells
- vulnerabilities
- code duplication
- complexity
- maintainability
- test coverage

Avoid excluding large parts of the application from SonarQube analysis.

## Environment configuration

Create an appropriate environment configuration strategy.

Do not commit secrets or database credentials to Git.

Provide an example environment file such as:

```text
.env.example
```

The actual `.env` files must be excluded through `.gitignore`.

The PostgreSQL connection should later be provided through an environment variable such as:

```text
DATABASE_URL
```

## Database

Initialize Prisma in the backend.

Configure PostgreSQL as the database provider.

At this stage, create only the Prisma configuration and database connection setup.

Do not yet create the final application schema for users, resources and reservations.

The database schema will be designed separately before implementing the application functionality.

## API

Prepare Express for a REST API.

Create a basic API structure and a simple health-check endpoint such as:

```text
GET /api/health
```

The endpoint should return a simple JSON response confirming that the backend is running.

Do not implement resource, user or reservation endpoints yet.

## Error handling

Prepare a centralized error-handling middleware for the backend.

Do not add complex error handling yet.

The purpose is to establish the architectural location for future error handling.

## Code quality principles

The project is part of a thesis where code quality is being measured.

Therefore:

1. Prefer simple and explicit solutions.
2. Keep responsibilities separated.
3. Avoid unnecessary abstraction.
4. Avoid duplicated code where practical.
5. Keep functions reasonably small.
6. Use descriptive names.
7. Use TypeScript types instead of `any`.
8. Do not hide errors.
9. Do not introduce libraries without a clear reason.
10. Keep the architecture understandable for a developer unfamiliar with the project.

Do not optimize prematurely.

## Git

Create a useful initial `.gitignore`.

Do not commit:

- node_modules
- `.env`
- build output
- coverage output
- IDE-specific files
- temporary files

Create an initial README explaining:

- project purpose
- technology stack
- frontend setup
- backend setup
- database setup
- testing commands
- linting commands
- coverage commands

## Important constraint

This task is **only project initialization**.

Do NOT implement:

- authentication
- users
- resources
- reservations
- reservation logic
- calendar functionality
- administrator functionality
- business rules
- production deployment
- unnecessary UI functionality

Only create the technical foundation required to begin implementing these features later.

After completing the setup, provide a concise summary of:

1. Files created
2. Dependencies installed
3. Project structure
4. Available npm/pnpm scripts
5. How to start frontend and backend
6. How to run tests
7. How to generate coverage
8. Any decisions or assumptions made

Before making architectural changes beyond this specification, explain why the change is necessary.

### Miksi tämä rajaus on hyvä diplomityöhön?

Tässä ensimmäisessä vaiheessa Cursor saa tehdä **setupin**, mutta ei vielä varsinaista sovellusta. Tämä on tutkimuksen kannalta hyödyllistä, koska myöhemmin voidaan aloittaa varsinainen AI-avusteinen kehitys selkeästä lähtötilanteesta.

Samalla saadaan heti käyttöön:

```text
React + TS
      │
      ├── ESLint
      ├── Vitest
      └── Coverage
           
Node + TS
      │
      ├── Express
      ├── ESLint
      ├── Vitest
      └── Prisma
             │
             ▼
         PostgreSQL
```

**Yksi asia, jonka muuttaisin vielä ennen promptin ajamista:** en lisäisi vielä MUI:ta, React Routeria, autentikointikirjastoa tai muuta ylimääräistä. Ne voidaan antaa Cursorille myöhemmin konkreettisen toiminnallisuuden toteutuksen yhteydessä. Näin myös kehitysprosessi pysyy tutkimuksessa paremmin seurattavana.

Haluatko seuraavaksi promptin **tietokantamallin (User-Resource-Reservation) suunnitteluun** vai **ensimmäisen toiminnallisuuden toteuttamiseen Cursorilla**?



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)