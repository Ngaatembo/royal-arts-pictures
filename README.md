# Royal Arts Pictures website

Static website concept for Royal Arts Pictures (Muspearz Investments (Pvt) Ltd), a photography and videography studio in Marondera, Zimbabwe. Built by WebAura Solutions.

## What is on the site
- Services, the four Marooro packages with US dollar prices, a filterable gallery, reference letters and company credentials
- Order form: pick a package, set hours or days, see a live total, then send the prepared order to the studio on WhatsApp

## Files
- `index.html` page markup
- `styles.css` all styling (colour and font tokens are at the top, in `:root`)
- `app.js` packages data, order form, total, WhatsApp message, gallery filter
- `assets/logo.png` logo cut from the company profile PDF (transparent, for dark backgrounds)
- `assets/photos/` portfolio photos cropped from the company profile PDF

## Run locally
Open `index.html` in a browser, or run `python3 -m http.server 8000` and visit http://localhost:8000.

## Edit prices and WhatsApp number
Open `app.js`. The `PACKAGES` list holds the packages and prices. `BOOKING_WHATSAPP` holds the WhatsApp number in international format without the plus sign.

## Deploy
Any static host works. For Cloudflare Pages: connect this repo, leave the build command empty and set the output directory to `/`.

## To do before launch
- Replace the cropped photos and logo with the original files from the client
- Confirm prices, working hours and travel charges with the client
- Decide where orders should be stored if WhatsApp alone is not enough
