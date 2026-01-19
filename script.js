const $ = (id) => document.getElementById(id);

const els = {
  account: $("account"),
  riskPct: $("riskPct"),
  entryPrice: $("entryPrice"),
  stopPrice: $("stopPrice"),
  mode: $("mode"),
  stopDist: $("stopDist"),
  stopHint: $("stopHint"),
  atrWrap: $("atrWrap"),
  atrMultWrap: $("atrMultWrap"),
  atr: $("atr"),
  atrMult: $("atrMult"),
  riskAmt: $("riskAmt"),
  posSize: $("posSize"),
  warn: $("warn"),
  copy: $("copy"),
};

function fmtMoney(x) {
  if (!isFinite(x)) return "$—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(x);
}

function num(v) {
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

function computeStopDistanceFromPrices() {
  return Math.abs(num(els.entryPrice.value) - num(els.stopPrice.value));
}

function computeStopDistance() {
  if (els.mode.value === "atr") {
    return num(els.atr.value) * num(els.atrMult.value);
  }
  return computeStopDistanceFromPrices();
}

function syncModeUI() {
  const atrOn = els.mode.value === "atr";
  els.atrWrap.style.display = atrOn ? "block" : "none";
  els.atrMultWrap.style.display = atrOn ? "block" : "none";
  els.entryPrice.disabled = atrOn;
  els.stopPrice.disabled = atrOn;
}

function update() {
  syncModeUI();

  const account = num(els.account.value);
  const riskPct = num(els.riskPct.value);
  const stopDist = computeStopDistance();

  els.stopDist.value = stopDist > 0 ? stopDist.toFixed(4) : "";
  els.stopHint.textContent = stopDist > 0 ? `${stopDist.toFixed(4)} units` : "—";

  const riskAmount = account * (riskPct / 100);
  const posSize = stopDist > 0 ? (riskAmount / stopDist) : 0;

  els.riskAmt.textContent = fmtMoney(riskAmount);
  els.posSize.textContent = `${posSize.toFixed(2)} units`;

  let w = "";
  if (account <= 0) w = "Account size must be > 0.";
  else if (riskPct <= 0) w = "Risk % must be > 0.";
  else if (stopDist <= 0) w = "Stop distance must be > 0.";

  els.warn.innerHTML = w ? `<span class="danger">⚠ ${w}</span>` : "";
}

function copyShareText() {
  const account = num(els.account.value);
  const riskPct = num(els.riskPct.value);
  const stopDist = computeStopDistance();
  const riskAmount = account * (riskPct / 100);
  const posSize = stopDist > 0 ? (riskAmount / stopDist) : 0;

  const text =
`Trade Size Calculator result:
- Account: ${account}
- Risk: ${riskPct}%
- Entry: ${num(els.entryPrice.value)}
- Stop: ${num(els.stopPrice.value)}
- Stop distance: ${stopDist}
=> Risk amount / loss at stop*: ${riskAmount.toFixed(2)}
=> Position size: ${posSize.toFixed(2)} units
* plus slippage`;

  navigator.clipboard?.writeText(text).then(() => {
    els.copy.textContent = "Copied ✅";
    setTimeout(() => (els.copy.textContent = "Copy share text"), 1200);
  }).catch(() => alert(text));
}

["input", "change"].forEach(evt => {
  document.addEventListener(evt, (e) => {
    if (!e.target) return;
    const ids = ["account","riskPct","entryPrice","stopPrice","mode","atr","atrMult"];
    if (ids.includes(e.target.id)) update();
  });
});

els.copy.addEventListener("click", copyShareText);

update();
