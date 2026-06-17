import asyncio, sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await asyncio.sleep(3)

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
                            bg: cs.backgroundColor,
                            fontSize: cs.fontSize,
                            fontWeight: cs.fontWeight,
                            borderRadius: cs.borderRadius,
                            border: cs.border,
                            className: el.className
                        };
                    }
                }
                return null;
            }
        """)
        print("--- 'Curso online' BADGE ---")
        if badge:
            for k, v in badge.items():
                print(f"  {k}: {v}")
        else:
            print("  NOT FOUND")

        blur = await page.evaluate("""
            () => {
                const all = document.querySelectorAll('*');
                for (const el of all) {
                    const cls = el.className;
                    if (typeof cls === 'string' && cls.includes('blur') && cls.includes('gold')) {
                        const cs = getComputedStyle(el);
                        return {
                            tag: el.tagName,
                            className: cls,
                            filter: cs.filter,
                            backdropFilter: cs.backdropFilter,
                            width: cs.width,
                            height: cs.height,
                            position: cs.position,
                            bg: cs.background,
                            bgColor: cs.backgroundColor,
                            top: cs.top,
                            left: cs.left,
                            opacity: cs.opacity,
                            zIndex: cs.zIndex
                        };
                    }
                }
                // fallback: find blur elements >= blur-xl
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
                            bg: cs.background,
                            bgColor: cs.backgroundColor
                        };
                    }
                }
                return null;
            }
        """)
        print("\n--- BLUR EFFECT BEHIND HERO ---")
        if blur:
            for k, v in blur.items():
                print(f"  {k}: {v}")
        else:
            print("  NOT FOUND")

        # tag counts
        counts = await page.evaluate("""
            () => {
                const tags = {};
                document.querySelectorAll('*').forEach(el => {
                    const t = el.tagName;
                    tags[t] = (tags[t] || 0) + 1;
                });
                return tags;
            }
        """)
        print("\n--- DOM TAG COUNTS ---")
        for k, v in sorted(counts.items()):
            print(f"  <{k}>: {v}")

        await browser.close()

asyncio.run(main())
