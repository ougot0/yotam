/* =========================================================
   Ougot — Rendu des produits depuis content.json
   (piloté par Simple Commerce)
   ---------------------------------------------------------
   Le contenu éditable vit dans content.json. Ce script lit
   ce fichier et construit les cartes produits + les tarifs
   plateaux, puis active les interactions (script.js).
   ========================================================= */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function cakeCard(p) {
    var tailles = p.tailles || [];
    var first = tailles[0] || {};
    var kinds = p.cacherout && p.cacherout.length ? p.cacherout : ["Parvé", "Halavi"];
    var html = '<article class="cake reveal is-visible" data-sc-id="' + esc(p.id) + '">';
    html += '<div class="cake-media"><img src="' + esc(p.image) + '" alt="' + esc(p.nom) + '" loading="lazy" /></div>';
    html += '<div class="cake-body">';
    html += '<div class="cake-head"><h3>' + esc(p.nom) + '</h3><span class="price">' + esc(first.prix) + '&nbsp;€</span></div>';
    html += '<p class="cake-desc">' + esc(p.description) + '</p>';
    html += '<div class="cake-options">';
    html += '<div class="opt-group opt-size" role="group" aria-label="Nombre de personnes">';
    tailles.forEach(function (t, i) {
      html += '<button type="button" class="opt' + (i === 0 ? " is-active" : "") + '"' +
        ' data-price="' + esc(t.prix) + '" data-serves="' + esc(t.serves) + '"' +
        (t.pay ? ' data-pay="' + esc(t.pay) + '"' : "") + '>' +
        esc(t.serves) + ' · ' + esc(t.prix) + ' €</button>';
    });
    html += '</div>';
    html += '<div class="opt-group opt-kind" role="group" aria-label="Parvé ou halavi">';
    kinds.forEach(function (k, i) {
      html += '<button type="button" class="opt' + (i === 0 ? " is-active" : "") + '" data-kind="' + esc(k) + '">' + esc(k) + '</button>';
    });
    html += '</div></div>';
    html += '<div class="cake-actions"><button type="button" class="btn btn-dark btn-block cake-order">Commander</button></div>';
    html += '</div></article>';
    return html;
  }

  function cookieCard(c) {
    var formats = c.formats || [];
    var first = formats[0] || {};
    var gouts = c.gouts || [];
    var html = '<article class="cake reveal is-visible cookie-card" data-sc-id="' + esc(c.id) + '">';
    html += '<div class="cake-media"><img src="' + esc(c.image) + '" alt="' + esc(c.nom) + '" loading="lazy" /></div>';
    html += '<div class="cake-body">';
    html += '<div class="cake-head"><h3>' + esc(c.nom) + '</h3><span class="price">' + esc(first.prix) + '&nbsp;€</span></div>';
    html += '<p class="cake-desc">' + esc(c.description) + '</p>';
    html += '<div class="cake-options">';
    html += '<div class="opt-group opt-size" role="group" aria-label="Format">';
    formats.forEach(function (f, i) {
      html += '<button type="button" class="opt' + (i === 0 ? " is-active" : "") + '"' +
        ' data-price="' + esc(f.prix) + '" data-serves="' + esc(f.label) + '">' +
        esc(f.label) + ' · ' + esc(f.prix) + ' €</button>';
    });
    html += '</div>';
    html += '<div class="opt-group opt-flavor" role="group" aria-label="Goût">';
    gouts.forEach(function (g, i) {
      var kosher = (g.cacherout && g.cacherout.length ? g.cacherout : ["Parvé", "Halavi"]).join(",");
      html += '<button type="button" class="opt' + (i === 0 ? " is-active" : "") + '"' +
        ' data-flavor="' + esc(g.nom) + '" data-kosher="' + esc(kosher) + '">' + esc(g.nom) + '</button>';
    });
    html += '</div>';
    html += '<div class="opt-group opt-kind" role="group" aria-label="Parvé ou halavi">';
    html += '<button type="button" class="opt is-active" data-kind="Parvé">Parvé</button>';
    html += '<button type="button" class="opt" data-kind="Halavi">Halavi</button>';
    html += '</div></div>';
    html += '<p class="cookie-kosher-note" hidden style="font-size:.82rem;color:#3b473e;margin:.5rem 0 0;">🧀 Le goût « 3 chocolats » est disponible <strong>uniquement en halavi</strong>.</p>';
    html += '<div class="cake-actions"><button type="button" class="btn btn-dark btn-block cake-order">Commander</button></div>';
    html += '</div></article>';
    return html;
  }

  function render(data) {
    if (!data) return;

    // --- Gâteaux + Cookies ---
    var grid = document.getElementById("sc-gateaux");
    if (grid) {
      var out = "";
      (data.gateaux || []).forEach(function (p) {
        if (!p || p.masque) return;
        out += cakeCard(p);
      });
      if (data.cookies && !data.cookies.masque) out += cookieCard(data.cookies);
      grid.innerHTML = out;
    }

    // --- Plateaux ---
    if (data.plateaux) {
      var pl = data.plateaux;
      var showcase = document.getElementById("sc-plateau-img");
      if (showcase && pl.image) showcase.src = pl.image;
      var intro = document.getElementById("sc-plateau-intro");
      if (intro && pl.intro) intro.textContent = pl.intro;
      var card = document.getElementById("sc-plateau-tarifs");
      if (card) {
        card.innerHTML = (pl.tarifs || []).map(function (t) {
          return '<div class="pricing-row"><span>' + esc(t.personnes) +
            '<em>' + esc(t.pieces) + '</em></span><strong>' + esc(t.prix) + '&nbsp;€</strong></div>';
        }).join("");
      }
    }

    // --- Active les interactions (définies dans script.js) ---
    if (typeof window.SC_initProducts === "function") window.SC_initProducts();
    if (typeof window.SC_initCookies === "function") window.SC_initCookies();

    // --- Si le site est fermé, désactive les boutons nouvellement créés ---
    if (window.SC_CLOSED && typeof window.SC_disableOrderControls === "function") {
      window.SC_disableOrderControls(document);
    }
  }

  function boot() {
    if (window.SC_CONTENT) { render(window.SC_CONTENT); return; }
    if (window.fetch) {
      fetch("content.json", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(render)
        .catch(function () { /* en cas d'échec, les conteneurs restent vides */ });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
