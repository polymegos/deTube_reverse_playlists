// ==UserScript==
// @name            deTube Reverse Playlists
// @version         0.0.1
// @description     Adds Alt+R to reverse YouTube playlist order and autoplay traversal
// @author          polymegos
// @namespace       https://github.com/polymegos/deTube_reverse_playlists
// @supportURL      https://github.com/polymegos/deTube_reverse_playlists/issues
// @license         MIT
// @match           *://www.youtube.com/*
// @match           *://www.youtube-nocookie.com/*
// @match           *://m.youtube.com/*
// @match           *://music.youtube.com/*
// @grant           none
// @run-at          document-start
// @compatible      firefox
// @compatible      edge
// @compatible      safari
// ==/UserScript==

(function() {
    'use strict';
    const debug = (...args) => console.log('[deTube RevPlay]', ...args);
  
    const getListId = () => new URL(location.href).searchParams.get('list');
    const FLAG = id => `yt_smart_rev_flag_${id}`;
    const LAST_HREF = id => `yt_smart_rev_href_${id}`;
    const DISABLED = id => `yt_smart_rev_disabled_${id}`;
  
    function setup() {
      window.addEventListener('keydown', onHotkey, true);
      window.addEventListener('keydown', onDisableHotkey, true);
      window.addEventListener('yt-navigate-finish', tryReverseJump);
      document.addEventListener('yt-page-data-updated', tryReverseJump);
      tryReverseJump();
    }
  
    function onHotkey(e) {
      if (!(e.altKey && e.key.toLowerCase() === 'r')) return;

      const active = document.activeElement;
      if (['INPUT', 'TEXTAREA'].includes(active.tagName) || active.isContentEditable) return;

      const listId = getListId();
      if (!listId) return debug('[!] No list ID found');
      if (sessionStorage.getItem(DISABLED(listId))) return debug('[!] Reverse traversal is disabled');

      const selected = document.querySelector('ytd-playlist-panel-video-renderer[selected]');
      if (!selected) return debug('[!] No selected playlist item');

      const link = selected.querySelector('a#thumbnail');
      const href = link?.getAttribute('href');
      if (!href) return debug('[!] No href in selected thumbnail');

      // Find and log previous item's href
      const allItems = Array.from(document.querySelectorAll('ytd-playlist-panel-video-renderer'));
      const idx = allItems.indexOf(selected);
      let prevHref = null;
      if (idx > 0) {
        const prevLink = allItems[idx - 1].querySelector('a#thumbnail');
        prevHref = prevLink?.getAttribute('href') || null;
      }
      debug('Alt+R pressed — current href =', href, '| previous href =', prevHref);

      if (prevHref) {
        sessionStorage.setItem(LAST_HREF(listId), prevHref);
        sessionStorage.setItem(FLAG(listId), '1');
        debug('[*] Reverse traversal enabled, prevHref saved:', prevHref);
      } else {
        debug('[!] No previous href to save, nothing done.');
      }
    }

    function onDisableHotkey(e) {
      if (!(e.altKey && e.key.toLowerCase() === 'l')) return;
      const listId = getListId();
      if (!listId) return debug('[!] No list ID found for disable');
      sessionStorage.removeItem(LAST_HREF(listId));
      sessionStorage.removeItem(FLAG(listId));
      sessionStorage.setItem(DISABLED(listId), '1');
      debug('[*] ALT+L pressed — reverse traversal disabled and storage cleared.');
    }
  
    function tryReverseJump() {
      const listId = getListId();
      if (!listId) return;
      if (sessionStorage.getItem(DISABLED(listId))) return debug('[!] Reverse traversal is disabled');

      const prevHref = sessionStorage.getItem(LAST_HREF(listId));
      const flag = sessionStorage.getItem(FLAG(listId));
      if (flag === '1' && prevHref) {
        sessionStorage.removeItem(FLAG(listId));
        debug('⏮ Reversing playback — jumping to prevHref:', prevHref);
        sessionStorage.removeItem(LAST_HREF(listId)); // Clear before navigating!
        location.href = prevHref;
        return;
      }
      // If storage is clear, start anew: save previous href from updated current state
      // Only if not just jumped (i.e., no flag and no prevHref)
      if (!flag && !prevHref) {
        const selected = document.querySelector('ytd-playlist-panel-video-renderer[selected]');
        if (!selected) return debug('[!] No selected playlist item to start anew');
        const link = selected.querySelector('a#thumbnail');
        const href = link?.getAttribute('href');
        if (!href) return debug('[!] No href in selected thumbnail to start anew');
        const allItems = Array.from(document.querySelectorAll('ytd-playlist-panel-video-renderer'));
        const idx = allItems.indexOf(selected);
        let newPrevHref = null;
        if (idx > 0) {
          const prevLink = allItems[idx - 1].querySelector('a#thumbnail');
          newPrevHref = prevLink?.getAttribute('href') || null;
        }
        if (newPrevHref) {
          sessionStorage.setItem(LAST_HREF(listId), newPrevHref);
          debug('[*] After jump: new prevHref saved for next ALT+R:', newPrevHref);
        } else {
          debug('[!] After jump: no previous href to save.');
        }
      }
    }
  
    console.log('[YT-Reverse-Playlists] Loaded');
    setup();
  })();