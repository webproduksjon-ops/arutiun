#!/usr/bin/env python3
"""Build approved Markdown files from content/pages into static materialy/*.html pages."""
from html import escape
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parents[1]
config = json.loads((root / 'site-seo.json').read_text(encoding='utf-8'))
base = config['canonical_host'].rstrip('/')
out = root / 'materialy'
out.mkdir(exist_ok=True)

def parse_page(path):
    raw = path.read_text(encoding='utf-8')
    if not raw.startswith('---\n'):
        raise ValueError(f'{path}: front matter is required')
    _, front, body = raw.split('---\n', 2)
    data = {}
    for line in front.splitlines():
        if ':' in line:
            key, value = line.split(':', 1)
            data[key.strip()] = value.strip()
    required = ('slug', 'title', 'description', 'section', 'route', 'updated', 'index', 'intent', 'query', 'parent', 'cta')
    missing = [key for key in required if not data.get(key)]
    if missing:
        raise ValueError(f'{path}: missing SEO front matter: {", ".join(missing)}')
    return data, body.strip()

def render_body(body):
    result = []
    paragraph = []
    def flush():
        if paragraph:
            text = ' '.join(paragraph).strip()
            text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', escape(text))
            result.append(f'<p>{text}</p>')
            paragraph.clear()
    for line in body.splitlines():
        line = line.strip()
        if not line:
            flush()
        elif line.startswith('## '):
            flush(); result.append(f'<h2>{escape(line[3:])}</h2>')
        elif line.startswith('# '):
            flush(); result.append(f'<h1>{escape(line[2:])}</h1>')
        elif line.startswith('> '):
            flush(); result.append(f'<blockquote>{escape(line[2:])}</blockquote>')
        else:
            paragraph.append(line)
    flush()
    return '\n'.join(result)

def page_html(data, body_html):
    slug = data['slug']
    title = data['title']
    description = data['description']
    canonical = f'{base}/materialy/{slug}.html'
    schema = {'@context': 'https://schema.org', '@type': 'Article', 'headline': title, 'description': description, 'articleSection': data['section'], 'dateModified': data['updated'], 'inLanguage': 'ru', 'author': {'@type': 'Person', 'name': 'Арутюн Панчоян'}, 'mainEntityOfPage': canonical}
    breadcrumb = {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Главная', 'item': base + '/'}, {'@type': 'ListItem', 'position': 2, 'name': data['section'], 'item': base + '/materialy.html'}, {'@type': 'ListItem', 'position': 3, 'name': title, 'item': canonical}]}
    return f'''<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{escape(title)} — Арутюн Панчоян</title><meta name="description" content="{escape(description)}"><meta name="author" content="Арутюн Панчоян"><link rel="canonical" href="{canonical}"><meta property="og:locale" content="ru_RU"><meta property="og:type" content="article"><meta property="og:site_name" content="Арутюн Панчоян"><meta property="og:title" content="{escape(title)}"><meta property="og:description" content="{escape(description)}"><meta property="og:url" content="{canonical}"><meta property="og:image" content="{base}/{config['social_image']}"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script><script type="application/ld+json">{json.dumps(breadcrumb, ensure_ascii=False)}</script><link rel="icon" type="image/svg+xml" href="../favicon.svg"><link rel="apple-touch-icon" href="../favicon.svg"><link rel="stylesheet" href="../assets/css/design-system.css"></head><body><a class="skip-link" href="#main-content">Перейти к содержанию</a><div class="site-frame"><header class="site-header"><div class="container header-inner"><a class="brand" href="../index.html" aria-label="Арутюн Панчоян — на главную"><span class="brand-mark" aria-hidden="true">АР</span><span>АРУТЮН ПАНЧОЯН</span></a><button type="button" class="menu-toggle" aria-label="Открыть меню" aria-expanded="false"><span></span><span></span><span></span></button><nav class="site-nav" aria-label="Основная навигация"><a class="nav-link nav-primary" href="../entrepreneurs.html">Предпринимателям</a><a class="nav-link nav-primary" href="../individual.html">Для себя</a><details class="nav-more"><summary>Ещё <span aria-hidden="true">⌄</span></summary><div class="nav-more-panel"><div class="nav-more-group"><span>Как это работает</span><a class="nav-link" href="../approach.html">Подход и процесс</a><a class="nav-link" href="../format.html">Формат и стоимость</a><a class="nav-link" href="../online.html">Онлайн-работа</a></div><div class="nav-more-group"><span>Материалы</span><a class="nav-link" href="../materialy.html">Все материалы</a><a class="nav-link" href="../video.html">Видео и идеи</a><a class="nav-link" href="../cases.html">Отзывы и кейсы</a></div><div class="nav-more-group"><span>О специалисте</span><a class="nav-link" href="../about.html">О специалисте</a><a class="nav-link" href="../contact.html">Контакты</a></div></div></details><a class="nav-cta" href="../diagnostic.html">Записаться <span>↗</span></a></nav></div></header><main id="main-content"><section class="inner-hero"><div class="container"><div class="breadcrumb"><a href="../index.html">Главная</a><span>›</span><a href="../materialy.html">Материалы</a><span>›</span><span>{escape(data.get('section','Материалы'))}</span></div><a class="article-back" href="../materialy.html">← Все материалы</a><span class="eyebrow">{escape(data.get('section','Материалы'))}</span>{body_html.split('</h1>',1)[0]+'</h1>' if '</h1>' in body_html else '<h1>'+escape(title)+'</h1>'}<p class="article-standfirst">{escape(description)}</p><span class="article-meta">Материал · обновлено {escape(data.get('updated','2026'))}</span></div></section><article class="section"><div class="container article-content">{body_html.replace(body_html.split('</h1>',1)[0]+'</h1>','',1) if '</h1>' in body_html else body_html}<section class="related-materials" aria-labelledby="related-title"><span class="eyebrow">Продолжить чтение</span><h2 id="related-title">Ещё по теме</h2><div class="related-grid"><a href="../materialy.html">Все материалы <span>↗</span></a><a href="../approach.html">Подход и процесс <span>↗</span></a><a href="../diagnostic.html">Диагностическая встреча <span>↗</span></a></div></section><p><a class="button button-primary" href="../{escape(data.get('route','diagnostic.html'))}">Обсудить запрос ↗</a></p></div></article></main><footer class="site-footer"><div class="container footer-grid"><div class="footer-brand"><a class="brand" href="../index.html"><span class="brand-mark" aria-hidden="true">АР</span><span>АРУТЮН ПАНЧОЯН</span></a><p class="footer-note">Психотерапия для предпринимателей, руководителей и людей в сложных жизненных периодах.</p><a class="footer-contact-link" href="../diagnostic.html">Записаться на встречу <span>↗</span></a></div><div class="footer-group"><h2>Навигация</h2><a href="../entrepreneurs.html">Предпринимателям</a><a href="../individual.html">Индивидуальная работа</a><a href="../approach.html">Как это работает</a><a href="../about.html">О специалисте</a></div><div class="footer-group"><h2>Материалы и формат</h2><a href="../format.html">Формат и стоимость</a><a href="../online.html">Онлайн-работа</a><a href="../materialy.html">Материалы</a><a href="../cases.html">Отзывы и кейсы</a><a href="../kasuti.html">К СУТИ</a></div><div class="footer-group footer-socials"><h2>Связь</h2><a href="../contact.html">Контакты</a><a href="https://t.me/Arutiun_Keropovich" target="_blank" rel="noreferrer">Telegram</a><a href="https://vk.com/kbtterapevt" target="_blank" rel="noreferrer">VK</a><a href="https://www.instagram.com/arutiun.keropovich/" target="_blank" rel="noreferrer">Instagram</a></div></div><div class="container footer-bottom"><span>Панчоян Арутюн Керопович · ИНН самозанятого: 911102541805</span><span><a href="../politika-obrabotki-pd.html">Конфиденциальность</a> · <a href="../polzovatelskoe-soglashenie.html">Пользовательское соглашение</a></span></div></footer></div><script src="../assets/js/site.js"></script></body></html>'''

built = 0
for path in sorted((root / 'content/pages').glob('*.md')):
    if path.name == 'README.md':
        continue
    data, body = parse_page(path)
    if data.get('index', 'false').lower() != 'true':
        continue
    (out / f"{data['slug']}.html").write_text(page_html(data, render_body(body)), encoding='utf-8')
    built += 1
print(f'built {built} approved content pages')
