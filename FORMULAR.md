# Potvrzení účasti bez vlastního hostingu

Web běží na GitHub Pages. Odpovědi přijímá Google Apps Script a zapisuje je do soukromé Google tabulky. Hosté nemusejí mít účet Google; samotnou tabulku veřejně nesdílejte.

## Jednorázové zapojení

1. V soukromé Google tabulce vytvořte list **Odpovědi**. Do prvního řádku vložte těchto devět hlaviček, každou do samostatného sloupce:

   `ID odpovědi` · `Přijato (UTC)` · `Jméno a příjmení` · `E-mail` · `Účast` · `Doprovod` · `Počet osob` · `Přespání` · `Písnička`

2. Otevřete [Google Apps Script](https://script.google.com/) pod účtem vlastníka tabulky a vytvořte projekt. Do `Code.gs` vložte obsah souboru `backend/google-apps-script/Code.gs`.
3. V `RSVP_CONFIG.spreadsheetId` doplňte identifikátor tabulky: část její adresy mezi `/d/` a `/edit`. `sheetName` je `Odpovědi`. Povolený origin už je nastavený na `https://kormaister.github.io`; vlastní doménu případně přidejte zvlášť. Tento seznam není heslo ani ochrana proti cílenému spamu.
4. V nastavení projektu zapněte zobrazení manifestu `appsscript.json` a vložte obsah stejnojmenného souboru z tohoto repozitáře.
5. Uložte projekt, spusťte funkci `setup` a dokončete autorizaci Google. Funkce ověří tabulku a hlavičky, nevytváří zkušební hosty.
6. Zvolte **Nasadit → Nové nasazení → Webová aplikace**. Spouštět jako: **váš účet**. Přístup: **kdokoli**, včetně nepřihlášených návštěvníků. Veřejný skript dovoluje příjem odpovědí, ne výpis hostů.
7. Výslednou adresu končící `/exec` vložte do `appsScriptUrl` v `docs/wedding-config.js` a změnu uložte do repozitáře. Nikdy sem nevkládejte heslo, OAuth token ani klíč.
8. Po zveřejnění webu odešlete jednu vlastní kontrolní odpověď. Ověřte, že se objeví v soukromé tabulce a že web ukáže potvrzení s číslem odpovědi. Teprve tím je propojení ověřené.

Web zobrazí úspěch až po potvrzení skriptu, že odpověď uložil. Opakované odeslání stejné odpovědi nevytváří druhý řádek. Automatické e-mailové zprávy nejsou zapnuté.

## Aktualizace

Po úpravě skriptu v Googlu vytvořte novou verzi v **Nasadit → Spravovat nasazení**. U existujícího nasazení lze zachovat stejnou adresu `/exec`.

## Dokumentace

- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Webové aplikace Apps Script](https://developers.google.com/apps-script/guides/web)
- [Limity služby Apps Script](https://developers.google.com/apps-script/guides/services/quotas)
