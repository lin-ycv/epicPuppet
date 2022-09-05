const fs = require('fs/promises')
const fso = require('fs');
const pup = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
pup.use(StealthPlugin());
pup.use(
    AdblockerPlugin({
        interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY
    })
)

if(process.argv[2] && process.argv[3])
start(process.argv[2], process.argv[3]);
else
start();

async function start(email= null, pass= null) {
    const browser = await pup.launch(/*{headless:false}*/);
    const page = await browser.newPage();
    if (fso.existsSync('cookies.json'))
        try {
            loadCookie(page);
        } catch (e) { console.log(e) }
    else if(email != null && pass != null) {
        console.log("NO COOKIES - login")
        try {
            await page.goto("https://www.epicgames.com/id/login/epic?redirect_uri=https%3A%2F%2Fwww.epicgames.com%2Faccount%2Fpersonal", { waitUntil: 'networkidle2' });
            await page.type('#email', email);
            await page.type('#password', pass);
            await page.waitForSelector('button#sign-in:not([disabled])')
            await Promise.all([
                page.click('#sign-in'),
                page.waitForNavigation({
                    waitUntil: 'networkidle0',
                }),
            ]);
        } catch (error) {
            if (error.name === "TimeoutError") {
                console.log(error.name+": CAPTCHA? email+password only works locally, check error.png")
                await page.screenshot({ path: "error.png", fullPage: true })
            } else {
                console.log(error)
                await page.screenshot({ path: "error.png", fullPage: true })
            }
            await browser.close();
        }
    }
    else{
        console.log("no cookies and no credential, can't do anything");
        await browser.close();
        return;
    }


    await page.goto("https://store.epicgames.com");
    const games = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[aria-label*="Free Now"]')).map(x => x.href)
    });
    console.log(games.join("\r\n"));
    for (let game of games) {
        await page.goto(game);
        const getB = await (await page.$('[data-testid="purchase-cta-button"]'));
        if (await page.$('[data-testid="purchase-cta-button"]:not([disabled]') != null) {
            getB.click({ clickCount: 1 });
            const getPB = await (await page.$('.payment-btn'));
            getPB.click();
        }
        else
            console.log("in Library");
    }
    saveCookie(page);
    await browser.close();
}

//save cookie function
const saveCookie = async (page) => {
    console.log("Saving cookies");
    const cookies = await page.cookies();
    const cookieJson = JSON.stringify(cookies, null, 2);
    await fs.writeFile('cookies.json', cookieJson);
    console.log("Cookies saved");
}

//load cookie function
const loadCookie = async (page) => {
    const cookieJson = await fs.readFile('cookies.json');
    const cookies = JSON.parse(cookieJson);
    await page.setCookie(...cookies);
    console.log("Cookies loaded");
}
