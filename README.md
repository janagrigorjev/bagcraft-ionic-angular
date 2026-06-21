# BagCraft - Ionic Angular aplikacija

BagCraft je hibridna mobilna aplikacija za poručivanje personalizovanih ručno izrađenih torbica. Aplikacija je napravljena u Ionic + Angular tehnologijama i koristi Firebase Realtime Database preko REST/HTTP zahteva, ali Firebase se ne koristi za podatke.

Funkcionalnosti

Korisnik

- registracija korisnika preko Firebase Authentication REST API-ja
- prijavljivanje i odjavljivanje korisnika
- kreiranje personalizovane torbice
- automatski obračun cene na osnovu izabranih opcija
- pregled svojih porudžbina
- pregled detalja porudžbine
- izmena porudžbine dok je status Poslata
- otkazivanje porudžbine
- brisanje porudžbine

Administrator

- pregled svih porudžbina
- filtriranje porudžbina po statusu
- promena statusa porudžbine: poslata, prihvaćena, u izradi, spremna, završena, otkazana

Administratorski prikaz se uključuje za email adrese navedene u src/environments/environment.ts u polju adminEmails

Složeni slučaj korišćenja

Složeni slučaj korišćenja je konfiguracija personalizovane torbice i automatski obračun cene. Korisnik bira model, materijal, boju, veličinu, ručku/kaiš, dodatne ukrase i količinu. Aplikacija zatim računa ukupnu cenu i kreira porudžbinu u Firebase Realtime Database.

CRUD operacije

CRUD se radi nad entitetom orders u Firebase Realtime Database:

- Create: POST /orders/{userId}.json?auth={idToken}
- Read: GET /orders/{userId}.json?auth={idToken}
- Update: PATCH /orders/{userId}/{orderId}.json?auth={idToken}
- Delete: DELETE /orders/{userId}/{orderId}.json?auth={idToken}

U Angular projektu se za komunikaciju koristi HttpClient

Podešavanje Firebase projekta
Preko Firebase Console se napravi novi projekat i doda se nasa web aplikacija. Nakon podesavanja autentifikacije i database-a, kopiramo Web API Key i u fajl src/environments/environment.ts unosimo firebaseApiKey, firebaseDatabaseUrl i adminEmails.


Firebase Realtime Database rules za demonstraciju

{
  "rules": {
    "orders": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}

Ova pravila omogućavaju pristup samo prijavljenim korisnicima. U aplikaciji se običnim korisnicima prikazuju samo njihove porudžbine, dok administrator ima poseban prikaz za sve porudžbine.

Pokretanje projekta
ionic serve

ili

npm start

Aplikacija se otvara na lokalnoj adresi koju prikaže terminal, obično http://localhost:8100.

Najvažniji fajlovi

- src/app/services/auth.service.ts - registracija, login, logout preko Firebase Authentication REST API-ja
- src/app/services/order.service.ts - CRUD operacije preko Firebase Realtime Database REST API-ja
- src/app/pages/order-form - forma za kreiranje/izmenu torbice i obračun cene
- src/app/pages/orders - pregled korisnikovih porudžbina
- src/app/pages/order-detail - detalji, izmena, otkazivanje i brisanje porudžbine
- src/app/pages/admin-orders - administratorski prikaz i promena statusa
- src/app/shared/price-calculator.ts - logika za automatski obračun cene

