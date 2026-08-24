#!/usr/bin/env node
/**
 * Headless Chrome interaction tests for Lingua Pro.
 * Usage: node scripts/test-interaction.js http://127.0.0.1:8767/
 */
const puppeteer = require('puppeteer-core');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const url = process.argv[2] || 'http://127.0.0.1:8767/';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
    const browser = await puppeteer.launch({
        executablePath: CHROME,
        headless: 'new',
        args: ['--no-sandbox', '--disable-gpu']
    });
    const page = await browser.newPage();
    const vp = { width: 390, height: 667, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
    await page.setViewport(vp);
    const logs = [];
    page.on('pageerror', (e) => logs.push(e.message));
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await delay(1000);

    const fails = [];
    const check = (ok, msg) => { if (!ok) fails.push(msg); };

    const boot = await page.evaluate(() => ({
        lingua: !!window.LinguaData,
        onboarding: document.getElementById('onboarding-modal').classList.contains('active'),
        nodes: document.querySelectorAll('.node-wrapper').length,
        submit: (() => {
            const b = document.getElementById('onboarding-submit-btn');
            const r = b.getBoundingClientRect();
            return { top: r.top, bottom: r.bottom, h: window.innerHeight };
        })()
    }));
    check(boot.lingua, 'LinguaData did not load');
    check(boot.nodes >= 1, 'path did not render');
    check(boot.submit.bottom < boot.submit.h - 20, `submit too low: ${boot.submit.bottom} / ${boot.submit.h}`);
    check(boot.onboarding, 'onboarding should open for a fresh user');

    await page.tap('#onboarding-submit-btn');
    await delay(700);
    const after = await page.evaluate(() => ({
        onboarding: document.getElementById('onboarding-modal').classList.contains('active'),
        tutorial: document.getElementById('tutorial-overlay').classList.contains('hidden') === false
            && !document.getElementById('tutorial-overlay').classList.contains('hidden')
            ? document.getElementById('tutorial-overlay').className
            : document.getElementById('tutorial-overlay').className,
        tutorialHidden: document.getElementById('tutorial-overlay').classList.contains('hidden'),
        unlocked: document.querySelectorAll('.node-wrapper:not(.level-locked)').length
    }));
    check(!after.onboarding, 'onboarding stayed open after Empezar');
    check(after.tutorialHidden, `tutorial blocked UI: ${after.tutorial}`);
    check(after.unlocked >= 1, 'no unlocked lesson');

    await page.tap('.node-wrapper:not(.level-locked)');
    await delay(500);
    const lesson = await page.evaluate(() => ({
        active: document.getElementById('lesson-view').classList.contains('active'),
        intro: document.getElementById('lesson-intro').classList.contains('show')
    }));
    check(lesson.active && lesson.intro, 'lesson did not open');

    await page.tap('#intro-start-btn');
    await delay(500);
    const quiz = await page.evaluate(() => ({
        options: document.querySelectorAll('.image-option, .emoji-option, .listen-option, .choice-card, .clap-opt').length,
        prompt: document.getElementById('prompt-title') && document.getElementById('prompt-title').textContent
    }));
    check(quiz.options >= 2, `no answer options (${quiz.options}) prompt=${quiz.prompt}`);

    const opt = await page.$('.image-option, .emoji-option, .listen-option, .choice-card, .clap-opt');
    if (opt) {
        await opt.tap();
        await delay(200);
        await page.tap('#check-btn');
        await delay(400);
    }
    const fb = await page.evaluate(() => document.getElementById('feedback-sheet').classList.contains('show'));
    check(fb, 'feedback sheet did not appear');

    await browser.close();
    if (logs.length) console.log('page errors:', logs);
    if (fails.length) {
        console.error('FAIL\n' + fails.map((f) => ' - ' + f).join('\n'));
        process.exit(1);
    }
    console.log('PASS interaction @', url);
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
