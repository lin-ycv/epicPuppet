# epicPuppet (NOT WORKING)

Puppeteer for epic.

> **DO NOT FORK THIS REPO AND USE ACTIONS DIRECTLY ON THE FORK<br>
> PRESS `Use this template` AND CREATE A NEW _PRIVATE_ REPO TO USE WITH ACTION**

## Requires
- NodeJS
  - puppeteer-extra
  - puppeteer-extra-plugin-stealth
- GPnuPG (to encrypt cookie file for online execution)

## Local execution
run `npm ci` at first run to download all the required modules (puppeteer and stealth plugin)

then, simply run (replace **EMAIL** and **PASSWORD** with your Epic account email and password)
```
npm run claim -- EMAIL PASSWORD
```
Cookie file is saved automatically after each run, so if `cookies.json` exists, email and password arguments can be omitted for future executions
```
npm run claim
```
you can still provide email and password with cookie file just in case the cookie has expired.

## Online execution
to execute online, email password option is unlikely to work, as most server IP's will be recognized as bot and require the completion of CAPTCHA, in this case use the cookie file to bypass login and CAPTCHA.

cookie files should not be uploaded online as is, please encrypt it with GnuPG
```
gpg --passphrase "PHRASE" --cipher-algo AES256 --batch --yes --symmetric cookies.json
```
replace **PHRASE** with the pass phrase you'd like to use to encrypt and decrypt with.
encrypted file has to be named `cookies.json.gpg`

For the encryption to be secure, **PHRASE** should follow all conventions for a strong password (symbols, numbers, upper and lower case ..etc)

EMAIL, PASSWORD, and PHRASE should not be hardcoded, use secrets instead, the names for secrets should be:

 Secret name | value 
---|---
 USER | EMAIL 
 PASS | PASSWORD 
 PHRASE | PHRASE 

 Included [workflow yml](.github/workflows/epic.yml) requires you to pass in all 3 secrets, even if you plan to use cookie file, it can modified as needed.

Decryption of cookie file is done in the workflow and not the script, if you create your own workflow file, please make sure to include a decryption step
```
gpg --decrypt --passphrase "PHRASE" --batch --yes --output cookies.json cookies.json.gpg
```

 ## Screenshot
 A screenshot, `error.png`, will be created if login fails.
