// ==UserScript==
// @name           deTube Reverse Playlists
// @name:el        deTube Αντεστραμμένες λίστες αναπαραγωγής
// @name:es        deTube Listas de reproducción invertidas
// @name:fr        deTube Listes de lecture inversées
// @name:de        deTube Umgekehrte Playlists
// @name:zh        deTube 反转播放列表
// @name:hi        deTube उलटी प्लेलिस्ट्स
// @name:ar        deTube قوائم تشغيل معكوسة
// @name:pt        deTube Playlists invertidas
// @name:ru        deTube Обратные плейлисты
// @name:bn        deTube উল্টানো প্লেলিস্ট
// @name:ja        deTube 逆順プレイリスト
// @name:pa        deTube ਉਲਟੀ ਪਲੇਲਿਸਟਾਂ
// @name:ms        deTube Senarai main songsang
// @name:tr        deTube Ters oynatma listeleri
// @name:it        deTube Playlist invertite
// @name:vi        deTube Danh sách phát đảo ngược
// @name:ko        deTube 역순 재생목록
// @name:ur        deTube الٹی پلے لسٹس
// @version        0.0.1 Dev
// @description    Adds Alt+R shortcut to reverse YouTube playlist order and autoplay traversal
// @description:el Προσθέτει τη συντόμευση ALT+R για αναστροφή της σειράς αναπαραγωγής λιστών YT και αυτόματη αναπαραγωγή
// @description:es Agrega el atajo ALT+R para invertir el orden de reproducción de listas de YT
// @description:fr Ajoute le raccourci ALT+R pour inverser l'ordre de lecture des playlists YT
// @description:de Fügt das ALT+R Tastaturkürzel hinzu, um YT-Playlists in umgekehrter Reihenfolge abspielen zu lassen
// @description:zh 添加 ALT+R 快捷键以反转 YT 播放列表的顺序并自动播放
// @description:hi ALT+R शॉर्टकट जोड़ता है जिससे YT प्लेलिस्ट का क्रम उल्टा हो जाता है और स्वतः चलती है
// @description:ar يضيف اختصار ALT+R لعكس ترتيب تشغيل قوائم YT والتشغيل التلقائي
// @description:pt Adiciona o atalho ALT+R para reverter a ordem da playlist do YT e reprodução automática
// @description:ru Добавляет сочетание клавиш ALT+R для инверсии порядка плейлиста YT и автопроигрывания
// @description:bn ALT+R শর্টকাট যোগ করে YT প্লেলিস্ট উল্টে দিয়ে অটোপ্লে চালু করে
// @description:ja ALT+R ショートカットを追加して、YT プレイリストの順序を逆にして自動再生します
// @description:pa ALT+R ਸ਼ਾਰਟਕੱਟ ਸ਼ਾਮਲ ਕਰਦਾ ਹੈ ਤਾਂ ਜੋ YT ਪਲੇਲਿਸਟ ਦੀ ਉਲਟੀ ਕਰਮਵਾਰ ਚਲਾਏ ਅਤੇ ਆਟੋਪਲੇ ਹੋਵੇ
// @description:ms Menambah pintasan ALT+R untuk membalikkan susunan senarai main YT dan main automatik
// @description:tr ALT+R kısayolunu ekler, YT oynatma listesi sırasını tersine çevirir ve otomatik oynatmayı etkinleştirir
// @description:it Aggiunge la scorciatoia ALT+R per invertire l'ordine della playlist YT e attivare la riproduzione automatica
// @description:vi Thêm phím tắt ALT+R để đảo ngược thứ tự danh sách phát YT và tự động phát
// @description:ko ALT+R 단축키를 추가하여 YT 재생목록 순서를 반대로 하고 자동 재생합니다
// @description:ur ALT+R شارٹ کٹ شامل کرتا ہے تاکہ YT پلے لسٹ کا ترتیب الٹا ہو جائے اور خودکار پلے ہو
// @author         polymegos
// @namespace      https://github.com/polymegos/deTube_reverse_playlists
// @supportURL     https://github.com/polymegos/deTube_reverse_playlists/issues
// @license        MIT
// @match          *://www.youtube.com/*
// @match          *://www.youtube-nocookie.com/*
// @match          *://m.youtube.com/*
// @match          *://music.youtube.com/*
// @grant          none
// @run-at         document-start
// @compatible     firefox
// @compatible     edge
// @compatible     safari
// ==/UserScript==

(function() {
    'use strict';
    const log = (...a) => console.log('%c[deTube Reverse Playlists]', 'color: blue; font-weight: bold;', ...a);
  
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
      if (!listId) return log('[!] No list ID found');
      if (sessionStorage.getItem(DISABLED(listId))) return log('[!] Reverse traversal is disabled');

      const selected = document.querySelector('ytd-playlist-panel-video-renderer[selected]');
      if (!selected) return log('[!] No selected playlist item');

      const link = selected.querySelector('a#thumbnail');
      const href = link?.getAttribute('href');
      if (!href) return log('[!] No href in selected thumbnail');

      // Find and log previous item's href
      const allItems = Array.from(document.querySelectorAll('ytd-playlist-panel-video-renderer'));
      const idx = allItems.indexOf(selected);
      let prevHref = null;
      if (idx > 0) {
        const prevLink = allItems[idx - 1].querySelector('a#thumbnail');
        prevHref = prevLink?.getAttribute('href') || null;
      }
      log('Alt+R pressed. Current href =', href, '| previous href =', prevHref);

      if (prevHref) {
        sessionStorage.setItem(LAST_HREF(listId), prevHref);
        sessionStorage.setItem(FLAG(listId), '1');
        log('[*] Reverse traversal enabled, prevHref saved:', prevHref);
      } else {
        log('[!] No previous href to save, nothing done.');
      }
    }

    function onDisableHotkey(e) {
      if (!(e.altKey && e.key.toLowerCase() === 'l')) return;
      const listId = getListId();
      if (!listId) return log('[!] No list ID found for disable');
      sessionStorage.removeItem(LAST_HREF(listId));
      sessionStorage.removeItem(FLAG(listId));
      sessionStorage.setItem(DISABLED(listId), '1');
      log('[*] ALT+L pressed. Reverse traversal disabled and storage cleared.');
    }
  
    function tryReverseJump() {
      const listId = getListId();
      if (!listId) return;
      if (sessionStorage.getItem(DISABLED(listId))) return log('[!] Reverse traversal is disabled');

      const prevHref = sessionStorage.getItem(LAST_HREF(listId));
      const flag = sessionStorage.getItem(FLAG(listId));
      if (flag === '1' && prevHref) {
        sessionStorage.removeItem(FLAG(listId));
        log('⏮ Reversing playback. Jumping to prevHref:', prevHref);
        sessionStorage.removeItem(LAST_HREF(listId)); // Clear before navigating
        location.href = prevHref;
        return;
      }
      // If storage is clear, start anew: Save previous href from updated current state
      // Only if not just jumped (i.e., no flag and no prevHref)
      if (!flag && !prevHref) {
        const selected = document.querySelector('ytd-playlist-panel-video-renderer[selected]');
        if (!selected) return log('[!] No selected playlist item to start anew');
        const link = selected.querySelector('a#thumbnail');
        const href = link?.getAttribute('href');
        if (!href) return log('[!] No href in selected thumbnail to start anew');
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
  
    log('Loaded');
    setup();
  })();