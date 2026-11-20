# Receipt Logger — iPhone web app

Scan a receipt, straighten and clean it up, read it with OCR, and keep a simple expense log.
It installs on your Home Screen, opens full-screen, and works offline.

## What's in this folder

| File | Purpose |
|---|---|
| `index.html` | The app itself. |
| `manifest.webmanifest` | App name, icons, full-screen display. |
| `sw.js` | Service worker. Caches the app and the OCR engine so it works offline. |
| `icon-180.png` | iPhone Home Screen icon. |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `favicon-32.png` | Icons for other devices and browsers. |
| `.github/workflows/deploy.yml` | Publishes the app to GitHub Pages and bundles the OCR engine for offline use. |

An iPhone will only install a web app from an **https://** address, so the folder has to be hosted somewhere. Pick one option below.

---

## Option A: GitHub Pages (recommended, free, OCR works fully offline)

**From a computer**
1. Create a new repository on github.com, for example `receipts`. It can be public or private; private needs a paid plan for Pages.
2. Upload everything in this folder, including the hidden `.github` folder, to the `main` branch.
   - In the terminal: `git init && git add . && git commit -m "Receipt Logger" && git branch -M main && git remote add origin https://github.com/YOU/receipts.git && git push -u origin main`
3. Go to the repo's **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
4. Open the **Actions** tab and wait for "Deploy to GitHub Pages" to turn green, about a minute. If it ran before you changed the setting in step 3, click **Run workflow**.
5. Your app is at `https://YOU.github.io/receipts/`.

**From the iPhone only**
1. In Safari, go to github.com. Create the repository and tick **Add a README**.
2. Choose **Add file → Upload files** and upload `index.html`, `manifest.webmanifest`, `sw.js` and all the `.png` files. Unzip this folder in the Files app first.
3. Choose **Add file → Create new file**. Type the name `.github/workflows/deploy.yml`, paste in the contents of that file, and commit.
4. Do steps 3–5 from the computer instructions above.

The deploy step downloads tesseract.js and its English language data into `vendor/`. After your first scan, OCR works with no connection at all.

## Option B: any other static https host

Netlify Drop (app.netlify.com/drop), Cloudflare Pages, or your own server all work. Upload the files as they are. On these hosts, OCR loads from the jsDelivr CDN, so the **first** scan needs internet. After that, the service worker keeps a cached copy. If you want guaranteed offline OCR there too, run the "Bundle OCR engine" commands from `deploy.yml` on your computer and upload the `vendor/` folder with the other files.

---

## Install on the iPhone

1. Open your app's https address in **Safari**.
2. Tap **Share**, then **Add to Home Screen**, then **Add**.
3. Open it from the Home Screen. It runs full-screen.
4. Scan one receipt while you're online. This downloads the OCR engine, roughly 5–15 MB. After that, airplane mode is fine.

## Good to know

- **Your data stays on the phone.** Receipts are saved in the app's own storage, which is separate from Safari's. If you used the plain HTML file before, back up from there and use **Log → Restore / import** in the installed app.
- **Back up now and then.** In **Log → Backup (JSON)**, the iOS share sheet opens so you can save the file to iCloud Drive or Files. Deleting the Home Screen app deletes its data.
- **Export.** **Export CSV** also uses the share sheet. You can also use **Copy CSV** and paste into Numbers, Excel or Google Sheets.
- **Updating.** Push or upload a new `index.html` and the app updates itself in the background. You'll see the change the next time you open it. GitHub Pages deploys also refresh the cache automatically. On other hosts, change the `VERSION` line at the top of `sw.js` to force a refresh.
- **Camera.** "Take photo" opens the camera directly, and "Choose image" opens your photo library. Lay the receipt on a darker surface for the best automatic edge detection.
