#!/usr/bin/env python3
"""Génère www/index.html à partir de src/one-board.html.
Usage : python3 build.py
Ajoute ce qu'il faut pour une vraie application : document HTML complet, manifeste, icônes,
couleur de thème, enregistrement du service worker."""
import re, pathlib, json
root = pathlib.Path(__file__).resolve().parent
src = (root / 'src' / 'one-board.html').read_text(encoding='utf-8')
m = re.search(r'<title>(.*?)</title>', src, re.S)
title = m.group(1).strip() if m else 'One-Board'
body = re.sub(r'<title>.*?</title>\s*', '', src, count=1, flags=re.S)
body = re.sub(r'<meta name="claude:viewport-fit-sides"[^>]*>\s*', '', body)
cfgp = root / 'firebase-config.json'
fb = ''
if cfgp.exists():
    fb = '<script>window.OB_FIREBASE=' + json.dumps(json.loads(cfgp.read_text(encoding='utf-8'))) + ';</script>\n<script src="fb.js"></script>\n'
head = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="theme-color" content="#0c0f0d">
<meta name="description" content="Rituels, tâches et focus sur un seul écran.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="One-Board">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<style>
:root{{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}
html{{scroll-padding-top:env(safe-area-inset-top,0px);-webkit-text-size-adjust:100%}}
body{{margin:0}}
img{{max-width:100%}}
</style>
{fb}</head>
<body>
'''
tail = '''
<script>
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
}
</script>
</body>
</html>
'''
out = root / 'www' / 'index.html'
out.write_text(head + body.strip() + '\n' + tail, encoding='utf-8')
print('OK ->', out, f'({out.stat().st_size // 1024} Ko)')
