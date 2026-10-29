# Svatba Aleny a Dana

17. července 2027 v 11:00 · Souvrať 81, Mostek.

Statický svatební web pro GitHub Pages. Obsahuje animovanou obálku, fotografie, program, mapu, odpočet a formulář pro potvrzení účasti. Nevyžaduje Node.js, sestavení ani vlastní server.

## Spuštění na GitHub Pages

V repozitáři otevřete **Settings → Pages**, zvolte **Deploy from a branch**, větev **main** a složku **/docs** a uložte nastavení. Po dokončení publikace GitHub zobrazí odkaz na web.

## Soubory

- `docs/` — hotový web včetně obrázků, fontu a všech skriptů.
- `docs/wedding-config.js` — jména, datum, fotografie a adresa přijímací služby formuláře.
- `backend/google-apps-script/` — kód, který ukládá odpovědi do soukromé Google tabulky.
- `FORMULAR.md` — postup zapojení formuláře.

Web používá relativní cesty a funguje také pod cestou repozitáře `/svatba/`. Pracovní štítek je vypnutý. Soubor `.nojekyll` zachovává přímé publikování statických souborů.

**Formulář zatím není aktivní:** jeho přijímací službu je potřeba jednorázově nasadit podle návodu. Do té doby formulář neslibuje úspěšné uložení a odkáže hosty na telefon nebo e-mail.

Do tohoto repozitáře nepatří vyplněné odpovědi hostů, přístupové údaje ani obsah soukromé tabulky.
