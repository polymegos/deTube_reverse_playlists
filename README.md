# deTube Reverse Playlists

**deTube Reverse Playlists** is a userscript to reverse YT playlist traversal using keyboard shortcuts.<br>
It allows you to jump to the previous video in a playlist with **ALT+R**, and to disable or reset the feature with **ALT+L**.

## How it works

- When you press **ALT+R** on a playlist page, the script saves the previous video in the playlist.
- On page load or navigation, if a previous video is saved, the script automatically jumps to it, then sets up the next previous video for the next jump.
- Press **ALT+L** at any time to clear the chain and disable the feature until you press **ALT+R** again.

## Supported Browsers

- Firefox
- ~~Chrome~~
- Brave
- Edge
- Safari

## Installation

To use this userscript, you will need a userscript manager extension installed in your browser:

- [Violentmonkey](https://violentmonkey.github.io/)
- [Greasemonkey (for Firefox)](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)

### Steps:

1. Install a userscript manager above.
2. Create a new, empty userscript in the manager.
3. Copy-paste this script into the empty userscript.
4. Reload YT and use **ALT+R** and **ALT+L** in any playlist!

## Usage

- Go to any YT playlist.
- Select a video, then press **ALT+R** to begin reverse traversal.
- The script will automatically jump to the previous video on each navigation.
- Press **ALT+L** to stop and clear the chain.

## Technical Notes

```
deTube_reverse_playlists/
├── deTube_reverse_playlists.js  # Main userscript file
├── README.md                    # This file
└── LICENSE                      # MIT License
```

- The script hooks into YT's player configuration before the page fully loads to avoid race conditions.
- It monitors navigation events (important for SPA behavior) to maintain behavior on dynamically loaded pages.
- It does **not** collect or transmit any user data at any point

## License

MIT.

This software is provided "as is", without warranty of any kind.<br>
**Use at your own risk.** Intended for educational use.<br>
You assume full responsibility for compliance with YouTube's Terms of Service and for any consequences arising from its use.
