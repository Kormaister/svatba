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

**Příjem odpovědí:** adresa nasazené služby Google Apps Script je nastavená v `docs/wedding-config.js`. Odpovědi se zapisují do soukromé Google tabulky. Web potvrdí odeslání až po potvrzení uložení. Postup údržby a opětovného zapojení je v `FORMULAR.md`. Automatické e-maily nejsou zapnuté.

Do tohoto repozitáře nepatří vyplněné odpovědi hostů, přístupové údaje ani obsah soukromé tabulky.
