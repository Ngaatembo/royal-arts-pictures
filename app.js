/* Royal Arts Pictures: packages, order form, WhatsApp message, gallery, lightbox. */

/* 1. CONFIGURATION ------------------------------------------------------- */
// WhatsApp number that receives booking enquiries: international format, digits only.
// Set to Wagwiziey for the demo. Replace here if the client picks another number.
const BOOKING_WHATSAPP = "263771099158"; // Wagwiziey, 0771 099 158
const REF_PREFIX = "RAP";
const MAX_QTY = 12;

/* 2. PACKAGE DATA -------------------------------------------------------- */
// Single source of truth, taken from the Royal Arts company profile (Marooro Packages page).
// Change a price here and the cards, the form and the total all follow.
// billing: "hour" or "day". custom: true means quotation only.
const PACKAGES = [
  { id: "marooro-1", name: "Marooro Package 1", price: 60, billing: "hour", description: "1 hour photoshoot",
    included: ["70+ pictures"] },
  { id: "marooro-2", name: "Marooro Package 2", price: 70, billing: "hour", description: "1 hour photoshoot",
    included: ["80+ pictures", "TikTok reel compilation", "A4 portrait"] },
  { id: "marooro-3", name: "Marooro Package 3", price: 190, billing: "day", description: "Photos only",
    included: ["150+ pictures", "A4 portrait", "Coverage from 10:00am to 4:30pm"] },
  { id: "marooro-4", name: "Marooro Package 4", price: 250, billing: "day", description: "Photos + Video",
    included: ["190+ pictures", "5-minute highlight video", "A2 portrait", "Delivered on flash drive"] },
  { id: "custom", name: "Custom quote", price: null, billing: "hour", custom: true,
    description: "Coverage that does not fit a package, including wall portraits.", included: [] }
];

/* 3. DOM REFERENCES ------------------------------------------------------ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = {
  grid: $("#pkGrid"), opts: $("#pkOpts"), form: $("#orderForm"), minus: $("#minus"), plus: $("#plus"),
  qty: $("#qty"), hint: $("#qtyHint"), err: $("#err"), date: $("#date"), name: $("#name"), phone: $("#phone"),
  occasion: $("#occasion"), venue: $("#venue"), notes: $("#notes"),
  sPkg: $("#sPkg"), sQty: $("#sQty"), sRate: $("#sRate"), sTotal: $("#sTotal"),
  done: $("#done"), ref: $("#ref"), msg: $("#msg"), wa: $("#wa"), copy: $("#copy"), copied: $("#copied"),
  gal: $("#gal"), chips: $$(".chip")
};
let state = { pkg: PACKAGES[0].id, qty: 1, message: "" };

/* 4. PACKAGE RENDERING --------------------------------------------------- */
const unit = (p, n = 1) => (p.billing === "day" ? "day" : "hour") + (n === 1 ? "" : "s");
const money = n => "$" + n.toLocaleString("en-US");
const getPkg = id => PACKAGES.find(p => p.id === id);
const priceText = p => (p.custom || p.price == null ? "Price to confirm" : `${money(p.price)} per ${unit(p)}`);

function renderPackages() {
  el.grid.innerHTML = PACKAGES.filter(p => !p.custom).map(p => `
    <article class="card">
      <h3>${p.name}</h3>
      <div class="price">${p.price == null ? "<small>Price to confirm</small>" : `${money(p.price)} <small>per ${unit(p)}</small>`}</div>
      ${p.description ? `<p class="small">${p.description}</p>` : ""}
      ${p.included.length ? `<ul>${p.included.map(i => `<li>${i}</li>`).join("")}</ul>` : ""}
      <button class="btn" type="button" data-book="${p.id}">Book this package</button>
    </article>`).join("");
  el.opts.innerHTML = PACKAGES.map(p => `
    <div class="opt"><input type="radio" name="pkg" id="o-${p.id}" value="${p.id}">
      <label for="o-${p.id}"><b>${p.name}</b><span class="p">${p.custom ? "Quotation" : p.price == null ? "TBC" : money(p.price) + "/" + unit(p)}</span></label></div>`).join("");
}

/* 5. ORDER CALCULATIONS -------------------------------------------------- */
function calc() {
  const p = getPkg(state.pkg);
  const total = p.custom || p.price == null ? null : p.price * state.qty;
  return { p, total };
}

function updateSummary() {
  const { p, total } = calc();
  $$('input[name="pkg"]').forEach(r => (r.checked = r.value === state.pkg));
  el.qty.textContent = state.qty;
  el.minus.disabled = p.custom || state.qty <= 1;
  el.plus.disabled = p.custom || state.qty >= MAX_QTY;
  el.hint.textContent = p.custom ? "Coverage is agreed with the studio in the quotation." :
    `${p.billing === "day" ? "Charged per day" : "Charged per hour"}. Choose 1 to ${MAX_QTY} ${unit(p, 2)}.`;
  el.sPkg.textContent = p.name;
  el.sQty.textContent = p.custom ? "To be discussed" : `${state.qty} ${unit(p, state.qty)}`;
  el.sRate.textContent = priceText(p);
  el.sTotal.textContent = p.custom ? "Custom quotation" : total == null ? "To be confirmed" : money(total);
}

function setPackage(id, qty) {
  state.pkg = id;
  state.qty = qty || 1;
  updateSummary();
}

/* 6. FORM VALIDATION ----------------------------------------------------- */
const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };

function validate() {
  const checks = [
    [el.name, el.name.value.trim().length >= 2, "Enter your full name."],
    [el.phone, (el.phone.value.match(/\d/g) || []).length >= 9 && /^[+\d\s()-]+$/.test(el.phone.value.trim()), "Enter a WhatsApp number with at least 9 digits."],
    [el.date, !!el.date.value, "Choose the event date."],
    [el.date, !el.date.value || el.date.value >= todayISO(), "The event date cannot be in the past. Choose today or a later date."]
  ];
  [el.name, el.phone, el.date].forEach(f => f.removeAttribute("aria-invalid"));
  for (const [field, ok, text] of checks) {
    if (!ok) { field.setAttribute("aria-invalid", "true"); el.err.textContent = text; field.focus(); return false; }
  }
  el.err.textContent = "";
  return true;
}

/* 7. WHATSAPP GENERATION ------------------------------------------------- */
const fmtDate = iso => new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const makeRef = () => { const n = todayISO().replace(/-/g, ""); return `${REF_PREFIX}-${n}-${1000 + Math.floor(Math.random() * 9000)}`; };

function buildMessage() {
  const { p, total } = calc();
  const custom = p.custom;
  const lines = [
    "Hello Royal Arts Pictures,", "",
    custom ? "I would like to request a custom quotation." : "I would like to make a booking enquiry.", "",
    `Name: ${el.name.value.trim()}`, `WhatsApp: ${el.phone.value.trim()}`, "",
    `Occasion: ${el.occasion.value}`, `Date: ${fmtDate(el.date.value)}`, `Venue: ${el.venue.value.trim() || "Not yet decided"}`, "",
    `Package: ${p.name}`
  ];
  if (!custom) lines.push(`Coverage: ${state.qty} ${unit(p, state.qty)}`);
  lines.push(`Estimated total: ${custom ? "Custom quotation" : total == null ? "To be confirmed" : money(total)}`, "",
    "Additional details:", el.notes.value.trim() || "None", "",
    custom ? "Please send me a quotation." : "Please confirm availability and the final quotation.", "Thank you.");
  return lines.join("\n");
}

const waLink = text => `https://wa.me/${BOOKING_WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

function onSubmit(e) {
  e.preventDefault();
  if (!validate()) return;
  state.message = buildMessage();
  el.ref.textContent = "Enquiry reference: " + makeRef() + ". This is an enquiry only. The studio confirms the booking.";
  el.msg.textContent = state.message;
  el.wa.href = waLink(state.message);
  el.copied.textContent = "";
  el.done.hidden = false;
  el.done.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* 8. CLIPBOARD ----------------------------------------------------------- */
async function copyOrder() {
  try {
    await navigator.clipboard.writeText(state.message);
    el.copied.textContent = "Order copied.";
  } catch {
    const r = document.createRange(); r.selectNodeContents(el.msg);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    el.copied.textContent = "Copy is not available here. The message is selected, so press and hold to copy.";
  }
}

/* 9. GALLERY FILTERING --------------------------------------------------- */
function filterGallery(f) {
  el.chips.forEach(c => c.setAttribute("aria-pressed", String(c.dataset.f === f)));
  $$("figure", el.gal).forEach(fig => (fig.hidden = f !== "all" && fig.dataset.c !== f));
}

/* 10. LIGHTBOX ----------------------------------------------------------- */
const lb = document.createElement("div");
lb.className = "lb"; lb.hidden = true; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Photo viewer");
lb.innerHTML = '<button type="button" class="lb-x" aria-label="Close photo">&times;</button><figure><img alt=""><figcaption></figcaption></figure>';
document.body.appendChild(lb);
let lastFocus = null;

function openLightbox(fig) {
  const img = $("img", fig);
  lastFocus = fig;
  $("img", lb).src = img.currentSrc || img.src;
  $("img", lb).alt = img.alt;
  $("figcaption", lb).textContent = $("figcaption", fig).textContent;
  lb.hidden = false; document.body.style.overflow = "hidden";
  $(".lb-x", lb).focus();
}
function closeLightbox() {
  if (lb.hidden) return;
  lb.hidden = true; document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}

/* 11. UI HELPERS AND WIRING ---------------------------------------------- */
function addStickyCta() {
  const a = document.createElement("a");
  a.className = "sticky-wa"; a.target = "_blank"; a.rel = "noopener"; a.textContent = "WhatsApp Royal Arts";
  a.href = `https://wa.me/${BOOKING_WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent("Hello Royal Arts Pictures, I would like to ask about a booking.")}`;
  document.body.appendChild(a);
}

function init() {
  renderPackages();
  el.date.min = todayISO();
  setPackage(PACKAGES[0].id);

  el.grid.addEventListener("click", e => {
    const b = e.target.closest("[data-book]"); if (!b) return;
    setPackage(b.dataset.book);
    $("#order").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => $(`#o-${b.dataset.book}`).focus({ preventScroll: true }), 450);
  });
  el.opts.addEventListener("change", e => setPackage(e.target.value, 1));
  el.minus.addEventListener("click", () => { if (state.qty > 1) { state.qty--; updateSummary(); } });
  el.plus.addEventListener("click", () => { if (state.qty < MAX_QTY) { state.qty++; updateSummary(); } });
  el.form.addEventListener("submit", onSubmit);
  el.form.addEventListener("input", () => { el.err.textContent = ""; });
  el.copy.addEventListener("click", copyOrder);

  // Start another enquiry without reloading
  const again = document.createElement("button");
  again.type = "button"; again.className = "btn ghost"; again.textContent = "Start another enquiry";
  $(".acts", el.done).appendChild(again);
  again.addEventListener("click", () => {
    el.form.reset(); el.done.hidden = true; el.err.textContent = ""; state.message = "";
    setPackage(PACKAGES[0].id); $("#order").scrollIntoView({ behavior: "smooth" });
  });

  el.chips.forEach(c => c.addEventListener("click", () => filterGallery(c.dataset.f)));
  $$("figure", el.gal).forEach(fig => {
    fig.tabIndex = 0; fig.setAttribute("role", "button"); fig.setAttribute("aria-label", "View larger: " + $("figcaption", fig).textContent);
    fig.addEventListener("click", () => openLightbox(fig));
    fig.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(fig); } });
  });
  lb.addEventListener("click", e => { if (e.target === lb || e.target.closest(".lb-x")) closeLightbox(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });
  addStickyCta();
}
init();
