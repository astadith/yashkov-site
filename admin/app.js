// Admin app for yashkov-site
const SITE = "https://yashkov29.ru";
const GALLERY = SITE + "/gallery-data.json";
const CONTENT = SITE + "/content-data.json";

let gallery = [];
let content = {};
let files = {};     // path -> base64
let deletePaths = [];
let sessionPass = "";

const $ = id => document.getElementById(id);

function saveLocal() {
  localStorage.setItem("yashkov_worker", $("workerUrl").value);
}
function loadLocal() {
  $("workerUrl").value = localStorage.getItem("yashkov_worker") || "";
}

async function loadGallery() {
  try {
    const r = await fetch(GALLERY);
    if (r.ok) gallery = await r.json();
  } catch (e) { showErr("Не удалось загрузить gallery-data.json"); }
  renderGallery();
}

async function loadContent() {
  try {
    const r = await fetch(CONTENT);
    if (r.ok) content = await r.json();
  } catch (e) { content = {}; }
  if (!content || typeof content !== "object") content = {};
  renderTexts();
}

function showOk(m) { $("okMsg").textContent = m; $("okMsg").style.display = "block"; setTimeout(() => $("okMsg").style.display = "none", 4000); }
function showErr(m) { $("errMsg").textContent = m; $("errMsg").style.display = "block"; }

function renderGallery() {
  const wrap = $("galleryList");
  wrap.innerHTML = "";
  (gallery || []).forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "gallery-item";
    div.innerHTML = `
      <img src="${item.src || ''}" alt="">
      <div class="meta">
        <div class="row">
          <input type="text" data-idx="${i}" data-field="cap" value="${esc(item.cap || '')}" placeholder="Подпись" style="flex:3">
          <input type="text" data-idx="${i}" data-field="cat" value="${esc(item.cat || '')}" placeholder="Категория" style="flex:1">
          <input type="text" data-idx="${i}" data-field="pid" value="${esc(item.pid || '')}" placeholder="pid" style="flex:1">
        </div>
      </div>
      <button class="ghost" data-del="${i}">Удалить</button>`;
    wrap.appendChild(div);
  });
  wrap.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("change", () => {
      const i = +inp.dataset.idx, f = inp.dataset.field;
      gallery[i][f] = inp.value;
      files["gallery-data.json"] = b64(JSON.stringify(gallery, null, 2));
    });
  });
  wrap.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = +btn.dataset.del;
      const it = gallery[i];
      if (it && it.src) deletePaths.push(it.src);
      if (it && it.full) deletePaths.push(it.full);
      gallery.splice(i, 1);
      files["gallery-data.json"] = b64(JSON.stringify(gallery, null, 2));
      renderGallery();
    });
  });
}

function renderTexts() {
  const wrap = $("textsList");
  wrap.innerHTML = "";
  Object.entries(content).forEach(([k, v]) => {
    const div = document.createElement("div");
    div.innerHTML = `<div class="row">
        <input type="text" class="tkey" value="${esc(k)}" placeholder="ключ" style="flex:1">
        <input type="text" class="tval" value="${esc(v)}" placeholder="значение" style="flex:2">
        <button class="ghost" data-deltext="1">✕</button>
      </div>`;
    div.querySelector("[data-deltext]").addEventListener("click", () => div.remove());
    wrap.appendChild(div);
  });
}

function collectTexts() {
  const out = {};
  document.querySelectorAll("#textsList > div").forEach(div => {
    const k = div.querySelector(".tkey").value.trim();
    const v = div.querySelector(".tval").value;
    if (k) out[k] = v;
  });
  return out;
}

function b64(str) { return btoa(unescape(encodeURIComponent(str))); }
function esc(s) { return String(s).replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function readImage(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

function canvasToWebp(canvas) {
  return new Promise(resolve => canvas.toBlob(b => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result.split(",")[1]);
    fr.readAsDataURL(b);
  }, "image/webp", 0.82));
}

async function makeImages(file) {
  const img = new Image();
  img.src = await readImage(file);
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
  // full max 1920
  const full = document.createElement("canvas");
  const k = Math.min(1, 1920 / Math.max(img.width, img.height));
  full.width = Math.round(img.width * k); full.height = Math.round(img.height * k);
  full.getContext("2d").drawImage(img, 0, 0, full.width, full.height);
  // thumb max 320
  const thumb = document.createElement("canvas");
  const kt = Math.min(1, 320 / Math.max(img.width, img.height));
  thumb.width = Math.round(img.width * kt); thumb.height = Math.round(img.height * kt);
  thumb.getContext("2d").drawImage(img, 0, 0, thumb.width, thumb.height);
  return { full: await canvasToWebp(full), thumb: await canvasToWebp(thumb) };
}

async function addArtwork() {
  const file = $("newImg").files[0];
  if (!file) return showErr("Выберите изображение");
  const cat = $("newCat").value;
  const cap = $("newCap").value.trim();
  $("imgStatus").textContent = "Обработка изображения…";
  try {
    const { full, thumb } = await makeImages(file);
    const id = Date.now().toString(36);
    const fpath = `assets/img/works/${cat}/${id}.webp`;
    const tpath = `assets/img/works/_thumbs/${id}.webp`;
    files[fpath] = full;
    files[tpath] = thumb;
    gallery.push({ src: tpath, full: fpath, cap, cat, pid: id });
    files["gallery-data.json"] = b64(JSON.stringify(gallery, null, 2));
    $("imgStatus").textContent = "";
    renderGallery();
    showOk("Картина добавлена в список. Нажмите «Сохранить».");
  } catch (e) { showErr("Ошибка обработки изображения: " + e.message); }
}

async function saveAll() {
  const url = $("workerUrl").value.trim();
  if (!url) return showErr("Укажите URL Cloudflare Worker");
  const pass = $("pass").value || sessionPass;
  const body = { password: pass, message: "Update via admin", files, deletePaths: deletePaths.filter(p => p) };
  showOk("Отправка…");
  try {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) {
      showOk("Сохранено! Сайт обновится через ~1 минуту.");
      files = {}; deletePaths = [];
    } else {
      showErr("Ошибка " + r.status + ": " + JSON.stringify(j));
    }
  } catch (e) { showErr("Не удалось связаться с Worker: " + e.message); }
}

// --- events ---
document.addEventListener("DOMContentLoaded", () => {
  loadLocal();
  $("loginBtn").addEventListener("click", () => {
    const p = $("pass").value.trim();
    if (!p) return showErr("Введите пароль");
    sessionPass = p;
    $("loginCard").style.display = "none";
    $("app").style.display = "block";
    $("logout").style.display = "inline-block";
    loadGallery(); loadContent();
  });
  $("logout").addEventListener("click", () => { location.reload(); });

  $("tabGallery").addEventListener("click", () => {
    $("tabGallery").classList.add("active"); $("tabTexts").classList.remove("active");
    $("galleryTab").style.display = "block"; $("textsTab").style.display = "none";
  });
  $("tabTexts").addEventListener("click", () => {
    $("tabTexts").classList.add("active"); $("tabGallery").classList.remove("active");
    $("textsTab").style.display = "block"; $("galleryTab").style.display = "none";
  });

  $("addBtn").addEventListener("click", addArtwork);
  $("saveBtn").addEventListener("click", saveAll);
  $("addTextBtn").addEventListener("click", () => {
    const div = document.createElement("div");
    div.innerHTML = `<div class="row"><input type="text" class="tkey" placeholder="ключ" style="flex:1"><input type="text" class="tval" placeholder="значение" style="flex:2"><button class="ghost" data-deltext="1">✕</button></div>`;
    div.querySelector("[data-deltext]").addEventListener("click", () => div.remove());
    $("textsList").appendChild(div);
  });
  $("saveTextsBtn").addEventListener("click", () => {
    content = collectTexts();
    files["content-data.json"] = b64(JSON.stringify(content, null, 2));
    saveAll();
  });
  $("workerUrl").addEventListener("change", saveLocal);
});
