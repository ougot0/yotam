/* =========================================================
   Ougot — Ouvert / Fermé
   ---------------------------------------------------------
   Deux sources, dans l'ordre de priorité :
   1) simplecommerce-statut.json  (piloté par Simple Commerce)
   2) window.OUGOT_STATUS ci-dessous (secours / édition manuelle)
   ========================================================= */
window.OUGOT_STATUS = {
  open: true,
  reopenAt: "",
  message: "Nous sommes momentanément fermés. Les commandes rouvrent très vite — merci de votre patience !"
};

/* ---- Ne pas toucher en dessous ---- */
(function () {
  "use strict";

  function disableOrderControls(root) {
    var sel = ".cake-order, .cake-pay, a.btn-pay, #btn-online, #btn-onsite, .send," +
              " a[href^='devis.html'], a[href^='commande.html'], .add-to-cart";
    (root || document).querySelectorAll(sel).forEach(function (b) {
      b.style.pointerEvents = "none";
      b.style.opacity = ".45";
      b.setAttribute("aria-disabled", "true");
      if (b.tagName === "BUTTON") b.disabled = true;
      if (b.tagName === "A") b.removeAttribute("href");
    });
  }
  // Exposé pour pouvoir re-désactiver les produits rendus dynamiquement.
  window.SC_disableOrderControls = disableOrderControls;

  function showBanner(message) {
    if (!document.body || document.getElementById("ougot-closed-banner")) return;
    var el = document.createElement("div");
    el.id = "ougot-closed-banner";
    el.setAttribute("style",
      "position:sticky;top:0;left:0;right:0;z-index:99999;background:#8a3b2e;color:#fff;" +
      "text-align:center;padding:12px 18px;font-family:'Jost',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;" +
      "font-size:.95rem;line-height:1.45;box-shadow:0 2px 10px rgba(0,0,0,.15);");
    el.innerHTML = "🔴 <strong>Commandes temporairement fermées.</strong> " +
      (message ? "<span style='opacity:.9'>" + message + "</span>" : "");
    document.body.insertBefore(el, document.body.firstChild);
  }

  function apply(closed, message) {
    window.SC_CLOSED = closed;
    if (!closed) return;
    function run() { showBanner(message); disableOrderControls(document); }
    if (document.body) run();
    else document.addEventListener("DOMContentLoaded", run);
  }

  // Config locale de secours
  var st = window.OUGOT_STATUS || { open: true };
  var localClosed = st.open === false;
  if (localClosed && st.reopenAt) {
    var t = new Date(String(st.reopenAt).replace(" ", "T"));
    if (!isNaN(t.getTime()) && Date.now() >= t.getTime()) localClosed = false;
  }

  function fromSC(s) {
    var closed = !!s.ferme;
    var msg = s.message || st.message;
    if (closed && s.reouverture) {
      var t2 = new Date(String(s.reouverture).replace(" ", "T"));
      if (!isNaN(t2.getTime()) && Date.now() >= t2.getTime()) closed = false;
    }
    return { closed: closed, msg: msg };
  }

  // Si une version inlignée du statut est fournie (aperçu), on l'utilise.
  if (window.SC_STATUT && typeof window.SC_STATUT.ferme !== "undefined") {
    var ri = fromSC(window.SC_STATUT);
    apply(ri.closed, ri.msg);
    return;
  }

  if (window.fetch) {
    fetch("simplecommerce-statut.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (s) {
        if (s && typeof s.ferme !== "undefined") { var r = fromSC(s); apply(r.closed, r.msg); }
        else apply(localClosed, st.message);
      })
      .catch(function () { apply(localClosed, st.message); });
  } else {
    apply(localClosed, st.message);
  }
})();
