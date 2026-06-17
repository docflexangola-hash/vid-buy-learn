import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1
        )
        page = await context.new_page()

        console_errors = []
        console_warnings = []

        page.on("console", lambda msg: (
            console_errors.append(msg.text) if msg.type == "error" else None,
            console_warnings.append(msg.text) if msg.type == "warning" else None
        ))

        page.on("pageerror", lambda err: console_errors.append(str(err)))

        await page.goto("http://localhost:5173", wait_until="networkidle")
        await asyncio.sleep(3)

        await page.screenshot(path=r"C:\Users\Gio Pilav\Downloads\vid-buy-learn\dev-screenshot.png", full_page=True)
        print("[OK] Full-page screenshot saved to dev-screenshot.png")

        # 1. Check all images
        images = await page.evaluate("""
            () => {
                const imgs = document.querySelectorAll('img');
                return Array.from(imgs).map(img => ({
                    src: img.src,
                    alt: img.alt,
                    visible: img.offsetWidth > 0 && img.offsetHeight > 0 && img.offsetParent !== null,
                    width: img.offsetWidth,
                    height: img.offsetHeight,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    loaded: img.complete && img.naturalWidth > 0,
                    tag: img.tagName
                }));
            }
        """)
        print("\n--- IMAGE STATUS ---")
        for i, img in enumerate(images):
            status = "OK" if img["loaded"] and img["visible"] else "ISSUE"
            print(f"  [{status}] img#{i} src={img['src'][:80]}")
            print(f"         visible={img['visible']} w={img['width']} h={img['height']} naturalW={img['naturalWidth']} naturalH={img['naturalHeight']} loaded={img['loaded']}")

        # 2. Body background
        body_bg = await page.evaluate("""
            () => {
                const el = document.body;
                const bgColor = getComputedStyle(el).backgroundColor;
                const bgImage = getComputedStyle(el).backgroundImage;
                return { backgroundColor: bgColor, backgroundImage: bgImage };
            }
        """)
        print(f"\n--- BODY BACKGROUND ---")
        print(f"  background-color: {body_bg['backgroundColor']}")
        print(f"  background-image: {body_bg['backgroundImage']}")

        # 3. Gold icons (.text-gold class) - computed color
        gold_icons_color = await page.evaluate("""
            () => {
                const els = document.querySelectorAll('.text-gold');
                return Array.from(els).map(el => {
                    const cs = getComputedStyle(el);
                    return {
                        tag: el.tagName,
                        text: (el.textContent || '').trim().substring(0, 50),
                        color: cs.color,
                        className: el.className
                    };
                });
            }
        """)
        print(f"\n--- TEXT-GOLD ELEMENTS (computed color) ---")
        for el in gold_icons_color:
            print(f"  <{el['tag']}> color={el['color']} text=\"{el['text']}\" class=\"{el['className']}\"")

        # 4. Primary buttons computed background-color
        buttons = await page.evaluate("""
            () => {
                const candidates = document.querySelectorAll('button, a');
                const btns = [];
                for (const el of candidates) {
                    const text = (el.textContent || '').trim().toLowerCase();
                    if (text.includes('comprar') || text.includes('entrar') || text.includes('agora')) {
                        const cs = getComputedStyle(el);
                        btns.push({
                            tag: el.tagName,
                            text: el.textContent.trim(),
                            bgColor: cs.backgroundColor,
                            color: cs.color,
                            borderRadius: cs.borderRadius,
                            padding: cs.padding,
                            className: el.className
                        });
                    }
                }
                return btns;
            }
        """)
        print(f"\n--- PRIMARY BUTTONS (computed style) ---")
        for btn in buttons:
            print(f"  <{btn['tag']}> text=\"{btn['text']}\" bg={btn['bgColor']} color={btn['color']} radius={btn['borderRadius']} class=\"{btn['className']}\"")

        # 5. H1 headings computed color
        h1s = await page.evaluate("""
            () => {
                const els = document.querySelectorAll('h1');
                return Array.from(els).map(el => {
                    const cs = getComputedStyle(el);
                    return {
                        tag: el.tagName,
                        text: el.textContent.trim().substring(0, 80),
                        color: cs.color,
                        fontSize: cs.fontSize,
                        fontWeight: cs.fontWeight
                    };
                });
            }
        """)
        print(f"\n--- H1 HEADINGS ---")
        for h1 in h1s:
            print(f"  <h1> color={h1['color']} size={h1['fontSize']} weight={h1['fontWeight']} text=\"{h1['text']}\"")

        # 6. Card box-shadow
        cards = await page.evaluate("""
            () => {
                const all = document.querySelectorAll('*');
                const results = [];
                for (const el of all) {
                    const cs = getComputedStyle(el);
                    if (cs.boxShadow && cs.boxShadow !== 'none') {
                        const cls = el.className;
                        const text = (el.textContent || '').trim().substring(0, 40);
                        if (cls.includes('card') || cls.includes('bg-white') || cls.includes('bg-zinc') || cls.includes('rounded-xl') || cls.includes('rounded-2xl')) {
                            results.push({
                                tag: el.tagName,
                                className: cls,
                                boxShadow: cs.boxShadow,
                                text: text
                            });
                        }
                    }
                }
                return results;
            }
        """)
        print(f"\n--- CARD BOX-SHADOW ---")
        for c in cards:
            print(f"  <{c['tag']}> class=\"{c['className']}\" shadow={c['boxShadow']} text=\"{c['text']}\"")

        # 7. Header backdrop-blur
        header_blur = await page.evaluate("""
            () => {
                const headers = document.querySelectorAll('header, nav, [class*="header"], [class*="nav"]');
                return Array.from(headers).map(el => {
                    const cs = getComputedStyle(el);
                    return {
                        tag: el.tagName,
                        className: el.className,
                        backdropFilter: cs.backdropFilter,
                        WebkitBackdropFilter: cs.webkitBackdropFilter,
                        background: cs.background,
                        backgroundColor: cs.backgroundColor
                    };
                });
            }
        """)
        print(f"\n--- HEADER BACKDROP-BLUR ---")
        for h in header_blur:
            print(f"  <{h['tag']}> class=\"{h['className']}\"")
            print(f"    backdrop-filter: \"{h['backdropFilter']}\"")
            print(f"    -webkit-backdrop-filter: \"{h['WebkitBackdropFilter']}\"")
            print(f"    background: {h['background']}")
            print(f"    background-color: {h['backgroundColor']}")

        # 8. Font-family on body
        body_font = await page.evaluate("""
            () => {
                const cs = getComputedStyle(document.body);
                return {
                    fontFamily: cs.fontFamily,
                    fontSize: cs.fontSize,
                    lineHeight: cs.lineHeight,
                    color: cs.color
                };
            }
        """)
        print(f"\n--- BODY FONT ---")
        print(f"  font-family: {body_font['fontFamily']}")
        print(f"  font-size: {body_font['fontSize']}")
        print(f"  line-height: {body_font['lineHeight']}")
        print(f"  color: {body_font['color']}")

        # 9. Console errors/warnings
        print(f"\n--- CONSOLE ERRORS ({len(console_errors)}) ---")
        for err in console_errors:
            print(f"  [ERROR] {err}")
        print(f"\n--- CONSOLE WARNINGS ({len(console_warnings)}) ---")
        for warn in console_warnings:
            print(f"  [WARN] {warn}")

        # 10. Gold badge "Curso online"
        badge = await page.evaluate("""
            () => {
                const all = document.querySelectorAll('*');
                for (const el of all) {
                    if (el.textContent && el.textContent.trim().includes('Curso online')) {
                        const cs = getComputedStyle(el);
                        return {
                            tag: el.tagName,
                            text: el.textContent.trim(),
                            color: cs.color,
                            backgroundColor: cs.backgroundColor,
                            fontSize: cs.fontSize,
                            fontWeight: cs.fontWeight,
                            className: el.className
                        };
                    }
                }
                return null;
            }
        """)
        print(f"\n--- 'Curso online' BADGE ---")
        if badge:
            print(f"  <{badge['tag']}> class=\"{badge['className']}\"")
            print(f"  text: \"{badge['text']}\"")
            print(f"  color: {badge['color']}")
            print(f"  bg: {badge['backgroundColor']}")
            print(f"  font-size: {badge['fontSize']} weight: {badge['fontWeight']}")
        else:
            print("  [WARN] 'Curso online' badge not found in DOM")

        # 11. Blur effect behind hero card (bg-gold/10 blur-2xl)
        blur_el = await page.evaluate("""
            () => {
                const all = document.querySelectorAll('*');
                for (const el of all) {
                    const cls = el.className;
                    if (typeof cls === 'string' && (cls.includes('blur-2xl') || cls.includes('blur-3xl')) && cls.includes('gold')) {
                        const cs = getComputedStyle(el);
                        return {
                            tag: el.tagName,
                            className: cls,
                            filter: cs.filter,
                            backdropFilter: cs.backdropFilter,
                            width: cs.width,
                            height: cs.height,
                            position: cs.position,
                            background: cs.background,
                            backgroundColor: cs.backgroundColor
                        };
                    }
                }
                // fallback: find any blur element
                for (const el of all) {
                    const cls = el.className;
                    if (typeof cls === 'string' && (cls.includes('blur-2xl') || cls.includes('blur-3xl'))) {
                        const cs = getComputedStyle(el);
                        return {
                            tag: el.tagName,
                            className: cls,
                            filter: cs.filter,
                            backdropFilter: cs.backdropFilter,
                            width: cs.width,
                            height: cs.height,
                            position: cs.position,
                            background: cs.background,
                            backgroundColor: cs.backgroundColor
                        };
                    }
                }
                return null;
            }
        """)
        print(f"\n--- BLUR EFFECT BEHIND HERO CARD ---")
        if blur_el:
            print(f"  <{blur_el['tag']}> class=\"{blur_el['className']}\"")
            print(f"  filter: {blur_el['filter']}")
            print(f"  backdrop-filter: {blur_el['backdropFilter']}")
            print(f"  position: {blur_el['position']}")
            print(f"  size: {blur_el['width']}x{blur_el['height']}")
            print(f"  bg: {blur_el['background']}")
        else:
            print("  [WARN] No blur-2xl/blur-3xl element found in DOM")

        # 12. Additional: check for any CSS loading issues
        css_issues = await page.evaluate("""
            () => {
                const sheets = document.styleSheets;
                const issues = [];
                for (let i = 0; i < sheets.length; i++) {
                    try {
                        const rules = sheets[i].cssRules;
                    } catch(e) {
                        issues.push(`StyleSheet #${i} (${sheets[i].href || 'inline'}) blocked/error: ${e.message}`);
                    }
                }
                return issues;
            }
        """)
        print(f"\n--- CSS LOADING ISSUES ---")
        if css_issues:
            for iss in css_issues:
                print(f"  [ISSUE] {iss}")
        else:
            print("  No CSS loading issues detected")

        await browser.close()

asyncio.run(main())
