#!/usr/bin/env bash
set -euo pipefail

# Test 1: applyTheme musi synchronizować active + aria-selected.
rg -n "btn\.setAttribute\('aria-selected', isActive \? 'true' : 'false'\)" theme-switcher.js >/dev/null

# Test 2: nie powinno być duplikacji logiki aria-selected w click handlerze.
if rg -n "Update aria-selected" theme-switcher.js >/dev/null; then
  echo "Unexpected leftover aria-selected update block"
  exit 1
fi

# Test 3: komentarz czasu scrolla powinien zgadzać się z DURATION=520.
rg -n "Fast anchor smooth scroll \(520 ms\)" scroll-animations.js >/dev/null
rg -n "var DURATION  = 520;" scroll-animations.js >/dev/null

echo "Static checks passed"
