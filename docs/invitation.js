(() => {
  'use strict';
  const root = document.documentElement;
  const invitation = document.getElementById('wedding-invitation');
  const site = document.getElementById('wedding-site');
  if (!invitation || !site) return;
  const seal = invitation.querySelector('.envelope-open');
  const skip = invitation.querySelector('.invitation-skip');
  const openText = invitation.querySelector('.invitation-open-text');
  const replay = document.getElementById('invitation-replay');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let finishTimer;
  let active = false;
  let opening = false;

  function resetToTop() {
    // Starý odkaz na sekci ani obnovená pozice nesmí přeskočit úvod webu.
    if (location.hash) {
      const url = new URL(location.href);
      url.hash = '';
      history.replaceState(history.state, '', url.href);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }

  function finish() {
    if (!active) return;
    active = false;
    opening = false;
    clearTimeout(finishTimer);
    clearTimeout(window.weddingInvitationFallback);
    invitation.hidden = true;
    invitation.classList.remove('invitation-opening');
    site.inert = false;
    root.classList.remove('invitation-pending', 'invitation-transitioning');
    site.classList.remove('invitation-revealed');
    if (!reducedMotion.matches) {
      void site.offsetWidth;
      site.classList.add('invitation-revealed');
    }
    // Klávesnice pokračuje od začátku webu, bez rámečku kolem jmen.
    site.focus({ preventScroll: true });
    window.getSelection()?.removeAllRanges();
    resetToTop();
    requestAnimationFrame(() => {
      if (!active) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  }

  function open() {
    if (!active || opening) return;
    opening = true;
    if (reducedMotion.matches) { finish(); return; }
    root.classList.add('invitation-transitioning');
    invitation.classList.add('invitation-opening');
    finishTimer = setTimeout(finish, 4000);
  }

  function show() {
    if (active) return;
    active = true;
    opening = false;
    root.classList.add('invitation-pending');
    site.inert = true;
    invitation.hidden = false;
    invitation.classList.remove('invitation-opening');
    resetToTop();
    seal.focus({ preventScroll: true });
    // Po úspěšné inicializaci může obálka počkat na návštěvníka libovolně dlouho.
    clearTimeout(window.weddingInvitationFallback);
  }

  const sealArt = invitation.querySelector('.seal-art');
  if (sealArt) {
    const revealSeal = () => seal.classList.add('seal-ready');
    sealArt.addEventListener('load', revealSeal);
    if (sealArt.complete && sealArt.naturalWidth) revealSeal();
  }
  seal.addEventListener('click', open);
  openText.addEventListener('click', open);
  skip.addEventListener('click', finish);
  replay?.addEventListener('click', show);
  invitation.addEventListener('animationend', event => {
    if (event.target === invitation && event.animationName === 'invitation-away') finish();
  });
  invitation.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); finish(); }
    if (event.key !== 'Tab') return;
    const buttons = [skip, seal, openText];
    const index = buttons.indexOf(document.activeElement);
    if (event.shiftKey && index <= 0) { event.preventDefault(); openText.focus(); }
    else if (!event.shiftKey && index === buttons.length - 1) { event.preventDefault(); skip.focus(); }
  });
  if (root.classList.contains('invitation-pending')) show();
})();
