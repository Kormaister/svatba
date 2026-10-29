// Základní údaje webu. Fotografie vložte do assets/photos/ a doplňte cestu.
window.WEDDING = {
  names: ['Alena', 'Dan'],
  date: '2027-07-17',
  ceremonyTime: '11:00',
  venue: 'Souvrať 81',
  address: '544 75 Mostek',
  photos: {
    firstDate: { src: './assets/photos/prvni-rande.jpg', alt: 'Alena a Dan spolu tančí na prvním rande, černobílá fotografie' },
    engagement: { src: './assets/photos/zasnuby.jpg', alt: 'Alena a Dan při zásnubách u tyrkysového jezera pod horami' }
  },
  demo: false,
  // Formulář na GitHub Pages ukládá odpovědi přes Google Apps Script.
  // Veřejná adresa přijímá odpovědi; samotná tabulka zůstává soukromá.
  formTransport: 'apps-script',
  apiBase: '',
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbyK_st5h-BergKApAMAMFBwkeHPc-H3ndLkImdi8SMjKsShFc4uQcuuP2OiLB1Tux1F/exec'
};
