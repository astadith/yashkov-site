/* Александр Яшков — интерактив сайта */
(function () {
  'use strict';

  /* ---- Шапка: фон и меню на мобильных ---- */
  var header = document.getElementById('header');
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');

  var sunRays = document.getElementById('sunRays');

  function onScroll() {
    var scrollY = window.scrollY || window.pageYOffset;
    if (scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
    if (scrollY > 600) document.body.classList.add('scrolled-deep');
    else document.body.classList.remove('scrolled-deep');

    // Плавная динамика солнечных лучей по всему сайту по мере пролистывания
    if (sunRays) {
      var maxScroll = (document.documentElement.scrollHeight - window.innerHeight) || 1;
      var progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      // Лучи мягко поворачиваются на 35 градусов и меняют масштаб от утреннего до закатного света
      var rotate = (progress * 35 - 3).toFixed(2);
      var scale = (1 + progress * 0.12).toFixed(3);
      var opacity = (0.75 + Math.sin(progress * Math.PI) * 0.25).toFixed(2);
      sunRays.style.transform = 'rotate(' + rotate + 'deg) scale(' + scale + ')';
      sunRays.style.opacity = opacity;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    nav.classList.toggle('open');
    navToggle.classList.toggle('active');
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('open');
      navToggle.classList.remove('active');
    });
  });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !navToggle.contains(e.target)) {
      nav.classList.remove('open');
      navToggle.classList.remove('active');
    }
  });

  /* ---- Появление блоков при скролле ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---- Анимация счётчиков фактов (30+, 50+, 30+) ---- */
  var factsAnimated = false;
  var factsEl = document.querySelector('.facts');
  function checkFacts() {
    if (factsAnimated || !factsEl) return;
    var rect = factsEl.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.90) {
      factsAnimated = true;
      document.querySelectorAll('.fact .num').forEach(function (el) {
        var t = el.textContent.trim();
        var target = parseInt(t, 10);
        if (isNaN(target)) return;
        var suffix = t.replace(/^[0-9]+/, '') || '+';
        var duration = 1600;
        var startTime = performance.now();
        function frame(now) {
          var progress = Math.min((now - startTime) / duration, 1);
          var ease = (progress === 1) ? 1 : 1 - Math.pow(2, -10 * progress);
          el.textContent = Math.floor(ease * target) + suffix;
          if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    }
  }
  window.addEventListener('scroll', checkFacts, { passive: true });
  checkFacts();

  /* ---- Hero-слайдер (Ken Burns / смена фона) ---- */
  var slides = document.querySelectorAll('#heroBg .slide');
  var heroIdx = 0;
  if (slides.length > 1) {
    setInterval(function () {
      slides[heroIdx].classList.remove('active');
      heroIdx = (heroIdx + 1) % slides.length;
      slides[heroIdx].classList.add('active');
    }, 5200);
  }

  /* ---- Галерея: данные + фильтры + lightbox ---- */
  // Portfolio deleted per user request
  var GALLERY = [
  {
    "src": "assets/img/works/_thumbs/zhivopis_457307082.webp",
    "full": "assets/img/works/zhivopis/zhivopis_457307082.webp",
    "cap": "«ПОЛЁТ. ДЫХАНИЕ АРКТИКИ» · Холст, масло, 200х123,5, 2021 г.",
    "cat": "zhivopis",
    "pid": 457307082
  },
  {
    "src": "assets/img/works/_thumbs/zhivopis_457300732.webp",
    "full": "assets/img/works/zhivopis/zhivopis_457300732.webp",
    "cap": "«РИТМЫ ПРОИЗВОДСТВА» · ОСП, масло, 49Х125, 2025 г.",
    "cat": "zhivopis",
    "pid": 457300732
  },
  {
    "src": "assets/img/works/_thumbs/zhivopis_457300733.webp",
    "full": "assets/img/works/zhivopis/zhivopis_457300733.webp",
    "cap": "«РИТМЫ ПРОИЗВОДСТВА» · ОСП, масло, 39Х68, 2025 г.",
    "cat": "zhivopis",
    "pid": 457300733
  },
  {
    "src": "assets/img/works/_thumbs/zhivopis_457288582.webp",
    "full": "assets/img/works/zhivopis/zhivopis_457288582.webp",
    "cap": "«ПРИЛЕТЕЛИ» · Холст, масло, 200х123,5, 2024 г.",
    "cat": "zhivopis",
    "pid": 457288582
  },
  {
    "src": "assets/img/works/_thumbs/zhivopis_457279551.webp",
    "full": "assets/img/works/zhivopis/zhivopis_457279551.webp",
    "cap": "«Дорога в Волково» · Холст, масло, 60х80, 2022 г.",
    "cat": "zhivopis",
    "pid": 457279551
  },
  {
    "src": "assets/img/works/_thumbs/zhivopis_457271017.webp",
    "full": "assets/img/works/zhivopis/zhivopis_457271017.webp",
    "cap": "«ДУХИ ПРЕДКОВ» · Холст, масло, 100х80, 2021 г.",
    "cat": "zhivopis",
    "pid": 457271017
  },
  {
    "src": "assets/img/works/_thumbs/zhivopis_457261290.webp",
    "full": "assets/img/works/zhivopis/zhivopis_457261290.webp",
    "cap": "«Восход над разливами. Май.» · Холст, масло, 60х50, 2020 г.",
    "cat": "zhivopis",
    "pid": 457261290
  },
  {
    "src": "assets/img/works/_thumbs/zhivopis_457258124.webp",
    "full": "assets/img/works/zhivopis/zhivopis_457258124.webp",
    "cap": "«Проясняется» · Холст, масло, 70х50, 2020 г.",
    "cat": "zhivopis",
    "pid": 457258124
  },
  {
    "src": "assets/img/works/_thumbs/zhivopis_457255542.webp",
    "full": "assets/img/works/zhivopis/zhivopis_457255542.webp",
    "cap": "«ОТТЕПЕЛЬ» · Холст, масло, 60Х80, 2019 г.",
    "cat": "zhivopis",
    "pid": 457255542
  },
  {
    "src": "assets/img/works/_thumbs/zhivopis_457255254.webp",
    "full": "assets/img/works/zhivopis/zhivopis_457255254.webp",
    "cap": "«Холодное солнце» · Холст, масло, 90х60, 2019 г.",
    "cat": "zhivopis",
    "pid": 457255254
  },
  {
    "src": "assets/img/works/_thumbs/zhivopis_457256865.webp",
    "full": "assets/img/works/zhivopis/zhivopis_457256865.webp",
    "cap": "«Тройная гора» · Холст, масло, 60х40, 2020 г.",
    "cat": "zhivopis",
    "pid": 457256865
  },
  {
    "src": "assets/img/works/_thumbs/zhivopis_457269686.webp",
    "full": "assets/img/works/zhivopis/zhivopis_457269686.webp",
    "cap": "«ДЕД» · Холст, масло, 90х63, 2018 г.",
    "cat": "zhivopis",
    "pid": 457269686
  },
  {
    "src": "assets/img/works/_thumbs/zhivopis_457254704.webp",
    "full": "assets/img/works/zhivopis/zhivopis_457254704.webp",
    "cap": "«ЖЕНСКИЙ ПОРТРЕТ» · Холст, масло, 50х40, 2019 г.",
    "cat": "zhivopis",
    "pid": 457254704
  },
  {
    "src": "assets/img/works/_thumbs/zhivopis_456248137.webp",
    "full": "assets/img/works/zhivopis/zhivopis_456248137.webp",
    "cap": "«Ночные купола» · Холст, масло, 2018 г.",
    "cat": "zhivopis",
    "pid": 456248137
  },
  {
    "src": "assets/img/works/_thumbs/zhivopis_456247395.webp",
    "full": "assets/img/works/zhivopis/zhivopis_456247395.webp",
    "cap": "«ПОРТРЕТ ДЕВУШКИ С ОЖЕРЕЛЬЕМ» · Холст, масло, 40х30, 2018 г.",
    "cat": "zhivopis",
    "pid": 456247395
  },
  {
    "src": "assets/img/works/_thumbs/zhivopis_457269589.webp",
    "full": "assets/img/works/zhivopis/zhivopis_457269589.webp",
    "cap": "«Окно из детства» · Масло, 45х32, 2004 г.",
    "cat": "zhivopis",
    "pid": 457269589
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457306582.webp",
    "full": "assets/img/works/grafika/grafika_457306582.webp",
    "cap": "«ДОБРОВОЛЕЦ» · Картон, соус, 61Х81, 2026 г.",
    "cat": "grafika",
    "pid": 457306582
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457298521.webp",
    "full": "assets/img/works/grafika/grafika_457298521.webp",
    "cap": "«ЕГОР ДА АГНИЯ, ПОСЛЕДНЯЯ КАРТОЧКА» · Картон, соус, 61Х81, 2025 г.",
    "cat": "grafika",
    "pid": 457298521
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457301315.webp",
    "full": "assets/img/works/grafika/grafika_457301315.webp",
    "cap": "«В ПОРТУ КРАСНОЙ КУЗНИЦЫ» · Картон, соус, 62х86, 2025 г.",
    "cat": "grafika",
    "pid": 457301315
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457297101.webp",
    "full": "assets/img/works/grafika/grafika_457297101.webp",
    "cap": "«СОЛОВКИ - ПОСЛЕДНИЙ ПРИЧАЛ» · Тушь, 55х63, 2025 г.",
    "cat": "grafika",
    "pid": 457297101
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457297099.webp",
    "full": "assets/img/works/grafika/grafika_457297099.webp",
    "cap": "«СОЛОВКИ - ПОСЛЕДНИЙ ПРИЧАЛ» · Тушь, 61х71, 2025 г.",
    "cat": "grafika",
    "pid": 457297099
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457297100.webp",
    "full": "assets/img/works/grafika/grafika_457297100.webp",
    "cap": "«СОЛОВКИ - ПОСЛЕДНИЙ ПРИЧАЛ» · Тушь, 55х66, 2025 г.",
    "cat": "grafika",
    "pid": 457297100
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457295942.webp",
    "full": "assets/img/works/grafika/grafika_457295942.webp",
    "cap": "«НЕ ВЕРНУЛСЯ» · Картон, соус, 2024 г.",
    "cat": "grafika",
    "pid": 457295942
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457295675.webp",
    "full": "assets/img/works/grafika/grafika_457295675.webp",
    "cap": "«ГОЛОСА» · Картон, соус, 70х100, 2024 г.",
    "cat": "grafika",
    "pid": 457295675
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457287166.webp",
    "full": "assets/img/works/grafika/grafika_457287166.webp",
    "cap": "«ЧЕРНИЧНЫЕ СКАЗКИ.» · 58х50, 2023 г.",
    "cat": "grafika",
    "pid": 457287166
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457286986.webp",
    "full": "assets/img/works/grafika/grafika_457286986.webp",
    "cap": "«КАРСТОВАЯ ПЕЩЕРА. ЗВОЗ.» · Картон, соус, 81х61, 2023 г.",
    "cat": "grafika",
    "pid": 457286986
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457286677.webp",
    "full": "assets/img/works/grafika/grafika_457286677.webp",
    "cap": "«ПРОШЛО ЛЕТО...» · Сепия, уголь, 84х61, 2023 г.",
    "cat": "grafika",
    "pid": 457286677
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457286438.webp",
    "full": "assets/img/works/grafika/grafika_457286438.webp",
    "cap": "«ЖИЛИ, БЫЛИ...» · Сепия, 86х62, 2023 г.",
    "cat": "grafika",
    "pid": 457286438
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457280654.webp",
    "full": "assets/img/works/grafika/grafika_457280654.webp",
    "cap": "«НОЯБРЬ, СОЛОМБАЛА.» · Тушь, 100х70, 2023 г.",
    "cat": "grafika",
    "pid": 457280654
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457278807.webp",
    "full": "assets/img/works/grafika/grafika_457278807.webp",
    "cap": "«РЕКА БОЛЬШАЯ ЮРА, МАЙСКИЙ СНЕГ.» · Тушь, 100х70, 2022 г.",
    "cat": "grafika",
    "pid": 457278807
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457295954.webp",
    "full": "assets/img/works/grafika/grafika_457295954.webp",
    "cap": "«КИМЖА» · Тушь, 71х81, 2024 г.",
    "cat": "grafika",
    "pid": 457295954
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457273460.webp",
    "full": "assets/img/works/grafika/grafika_457273460.webp",
    "cap": "«СВЕТЛОЕ И ТЁМНОЕ» · Пастель, 2022 г.",
    "cat": "grafika",
    "pid": 457273460
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457273032.webp",
    "full": "assets/img/works/grafika/grafika_457273032.webp",
    "cap": "«ВАВИЛОНЫ. МЕЖДУ ЗЕМНЫМ И НЕБЕСНЫМ» · Сепия, уголь, 2022 г.",
    "cat": "grafika",
    "pid": 457273032
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457271394.webp",
    "full": "assets/img/works/grafika/grafika_457271394.webp",
    "cap": "«ВЕТРА ВЕКОВ. ХИЖГОРА» · Сепия, уголь, 85х60, 2021 г.",
    "cat": "grafika",
    "pid": 457271394
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457262980.webp",
    "full": "assets/img/works/grafika/grafika_457262980.webp",
    "cap": "«ВОРОТА» · Акварель, 80х58, 2020 г.",
    "cat": "grafika",
    "pid": 457262980
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457258035.webp",
    "full": "assets/img/works/grafika/grafika_457258035.webp",
    "cap": "«СТАРИНА. НА ПИНЕГЕ РЕКЕ» · Тушь, 80х58, 2020 г.",
    "cat": "grafika",
    "pid": 457258035
  },
  {
    "src": "assets/img/works/_thumbs/grafika_456249835.webp",
    "full": "assets/img/works/grafika/grafika_456249835.webp",
    "cap": "«ХОЗЯЙСКАЯ МОГИЛА» · 2019 г.",
    "cat": "grafika",
    "pid": 456249835
  },
  {
    "src": "assets/img/works/_thumbs/grafika_456251016.webp",
    "full": "assets/img/works/grafika/grafika_456251016.webp",
    "cap": "«В мутной воде» · Уголь, 60 х 50 см, 2019 г.",
    "cat": "grafika",
    "pid": 456251016
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457262945.webp",
    "full": "assets/img/works/grafika/grafika_457262945.webp",
    "cap": "«ОКНО» · Тушь, 80х58, 2020 г.",
    "cat": "grafika",
    "pid": 457262945
  },
  {
    "src": "assets/img/works/_thumbs/grafika_457295424.webp",
    "full": "assets/img/works/grafika/grafika_457295424.webp",
    "cap": "«ПОРТРЕТ МОЛОДОГО МУЖЧИНЫ» · 50х40, 2016 г.",
    "cat": "grafika",
    "pid": 457295424
  },
  {
    "src": "assets/img/works/_thumbs/grafika_456247240.webp",
    "full": "assets/img/works/grafika/grafika_456247240.webp",
    "cap": "«ХИЖГОРА» · Соус, сепия, 50х60, 2018 г.",
    "cat": "grafika",
    "pid": 456247240
  },
  {
    "src": "assets/img/works/_thumbs/plener_456245404.webp",
    "full": "assets/img/works/plener/plener_456245404.webp",
    "cap": "«Остров Ягры на Беломорье. Картон, масло. 2018» · Картон, масло, 2018 г.",
    "cat": "plener",
    "pid": 456245404
  },
  {
    "src": "assets/img/works/_thumbs/plener_456246666.webp",
    "full": "assets/img/works/plener/plener_456246666.webp",
    "cap": "«Африка. Пляжи Хаммамета» · Картон, пастель, 30Х40, 2018 г.",
    "cat": "plener",
    "pid": 456246666
  },
  {
    "src": "assets/img/works/_thumbs/plener_456246663.webp",
    "full": "assets/img/works/plener/plener_456246663.webp",
    "cap": "«Африка. На берегу Средиземного моря» · Картон, масло, 21Х30, 2018 г.",
    "cat": "plener",
    "pid": 456246663
  },
  {
    "src": "assets/img/works/_thumbs/plener_456246662.webp",
    "full": "assets/img/works/plener/plener_456246662.webp",
    "cap": "«Африка. Хаммамет с вершины горы» · Картон, масло, 21Х30, 2018 г.",
    "cat": "plener",
    "pid": 456246662
  },
  {
    "src": "assets/img/works/_thumbs/plener_456246658.webp",
    "full": "assets/img/works/plener/plener_456246658.webp",
    "cap": "«Африка. Берег Хаммамета» · Картон, масло, 30Х40, 2018 г.",
    "cat": "plener",
    "pid": 456246658
  },
  {
    "src": "assets/img/works/_thumbs/plener_456246661.webp",
    "full": "assets/img/works/plener/plener_456246661.webp",
    "cap": "«Африка. Разбитая рыбацкая лодка» · Картон, масло, 30Х40, 2018 г.",
    "cat": "plener",
    "pid": 456246661
  },
  {
    "src": "assets/img/works/_thumbs/plener_456252768.webp",
    "full": "assets/img/works/plener/plener_456252768.webp",
    "cap": "«Вид на Исаакиевский собор» · Уголь",
    "cat": "plener",
    "pid": 456252768
  },
  {
    "src": "assets/img/works/_thumbs/plener_456252767.webp",
    "full": "assets/img/works/plener/plener_456252767.webp",
    "cap": "«Сфинкс» · Сепия",
    "cat": "plener",
    "pid": 456252767
  },
  {
    "src": "assets/img/works/_thumbs/plener_457260382.webp",
    "full": "assets/img/works/plener/plener_457260382.webp",
    "cap": "«Дорога в Масельге» · Масло, 40х30, 2020 г.",
    "cat": "plener",
    "pid": 457260382
  },
  {
    "src": "assets/img/works/_thumbs/plener_457260383.webp",
    "full": "assets/img/works/plener/plener_457260383.webp",
    "cap": "«Вид на озеро Масельгское» · Масло, 40х30, 2020 г.",
    "cat": "plener",
    "pid": 457260383
  },
  {
    "src": "assets/img/works/_thumbs/plener_457262036.webp",
    "full": "assets/img/works/plener/plener_457262036.webp",
    "cap": "«Предгорье Тарки-тау. Картон, масло, 2020 г» · Картон, масло, 2020 г.",
    "cat": "plener",
    "pid": 457262036
  },
  {
    "src": "assets/img/works/_thumbs/plener_457262037.webp",
    "full": "assets/img/works/plener/plener_457262037.webp",
    "cap": "«Берег Каспийского моря. Картон, масло, 2020 г» · Картон, масло, 2020 г.",
    "cat": "plener",
    "pid": 457262037
  },
  {
    "src": "assets/img/works/_thumbs/plener_457269102.webp",
    "full": "assets/img/works/plener/plener_457269102.webp",
    "cap": "«КРЫМСКИЙ БЕРЕГ. СКАЛЫ ТУЗЛУХ.» · Бумага, пастель, 30х40, 2021 г.",
    "cat": "plener",
    "pid": 457269102
  },
  {
    "src": "assets/img/works/_thumbs/plener_457269101.webp",
    "full": "assets/img/works/plener/plener_457269101.webp",
    "cap": "«КРЫМ. ВИД НА ХРАМ-МАЯК.» · Масло, 30х40, 2021 г.",
    "cat": "plener",
    "pid": 457269101
  },
  {
    "src": "assets/img/works/_thumbs/plener_457276381.webp",
    "full": "assets/img/works/plener/plener_457276381.webp",
    "cap": "«Сараи у кремля» · Масло, 30х40, 2022 г.",
    "cat": "plener",
    "pid": 457276381
  },
  {
    "src": "assets/img/works/_thumbs/plener_457276384.webp",
    "full": "assets/img/works/plener/plener_457276384.webp",
    "cap": "«У стен монастыря» · Масло, 30х40, 2022 г.",
    "cat": "plener",
    "pid": 457276384
  },
  {
    "src": "assets/img/works/_thumbs/plener_457276401.webp",
    "full": "assets/img/works/plener/plener_457276401.webp",
    "cap": "«Северная стена» · Масло, 30х40, 2022 г.",
    "cat": "plener",
    "pid": 457276401
  },
  {
    "src": "assets/img/works/_thumbs/plener_457276464.webp",
    "full": "assets/img/works/plener/plener_457276464.webp",
    "cap": "«Белая башня» · Бумага, пастель, 30х40, 2022 г.",
    "cat": "plener",
    "pid": 457276464
  },
  {
    "src": "assets/img/works/_thumbs/plener_457276923.webp",
    "full": "assets/img/works/plener/plener_457276923.webp",
    "cap": "«На высоком берегу» · Бумага, пастель, 30х42, 2022 г.",
    "cat": "plener",
    "pid": 457276923
  },
  {
    "src": "assets/img/works/_thumbs/plener_457276924.webp",
    "full": "assets/img/works/plener/plener_457276924.webp",
    "cap": "«Глубокий ручей. Дом Борисовых» · Масло, 30х40, 2022 г.",
    "cat": "plener",
    "pid": 457276924
  },
  {
    "src": "assets/img/works/_thumbs/plener_457276929.webp",
    "full": "assets/img/works/plener/plener_457276929.webp",
    "cap": "«В тени от дома» · Бумага, пастель, 30х42, 2022 г.",
    "cat": "plener",
    "pid": 457276929
  },
  {
    "src": "assets/img/works/_thumbs/plener_457276926.webp",
    "full": "assets/img/works/plener/plener_457276926.webp",
    "cap": "«Черевково. Дом Гусева» · Бумага, пастель, 30х42, 2022 г.",
    "cat": "plener",
    "pid": 457276926
  },
  {
    "src": "assets/img/works/_thumbs/plener_457278119.webp",
    "full": "assets/img/works/plener/plener_457278119.webp",
    "cap": "«Октябрь. Дорога в лес» · Масло, 40х30, 2022 г.",
    "cat": "plener",
    "pid": 457278119
  },
  {
    "src": "assets/img/works/_thumbs/plener_457278603.webp",
    "full": "assets/img/works/plener/plener_457278603.webp",
    "cap": "«Ноябрь. Заброшенный хлев» · Масло, 40х30, 2022 г.",
    "cat": "plener",
    "pid": 457278603
  },
  {
    "src": "assets/img/works/_thumbs/plener_457279035.webp",
    "full": "assets/img/works/plener/plener_457279035.webp",
    "cap": "«Низкое солнце ноября» · Холст, масло, 30х25, 2022 г.",
    "cat": "plener",
    "pid": 457279035
  },
  {
    "src": "assets/img/works/_thumbs/plener_457278632.webp",
    "full": "assets/img/works/plener/plener_457278632.webp",
    "cap": "«Ноябрь. Тёмный лес» · Масло, 40х30, 2022 г.",
    "cat": "plener",
    "pid": 457278632
  },
  {
    "src": "assets/img/works/_thumbs/plener_457278349.webp",
    "full": "assets/img/works/plener/plener_457278349.webp",
    "cap": "«Начало октября» · Масло, 40х30, 2022 г.",
    "cat": "plener",
    "pid": 457278349
  },
  {
    "src": "assets/img/works/_thumbs/plener_457279907.webp",
    "full": "assets/img/works/plener/plener_457279907.webp",
    "cap": "«Начало января» · Масло, 40х30, 2022 г.",
    "cat": "plener",
    "pid": 457279907
  },
  {
    "src": "assets/img/works/_thumbs/plener_457281671.webp",
    "full": "assets/img/works/plener/plener_457281671.webp",
    "cap": "«Коренья под снегом» · Холст, масло, 50х40, 2023 г.",
    "cat": "plener",
    "pid": 457281671
  },
  {
    "src": "assets/img/works/_thumbs/plener_457281657.webp",
    "full": "assets/img/works/plener/plener_457281657.webp",
    "cap": "«Болото на закате» · Масло, 40х30, 2023 г.",
    "cat": "plener",
    "pid": 457281657
  },
  {
    "src": "assets/img/works/_thumbs/plener_457281624.webp",
    "full": "assets/img/works/plener/plener_457281624.webp",
    "cap": "«Зимник, март» · Масло, 60х50, 2023 г.",
    "cat": "plener",
    "pid": 457281624
  },
  {
    "src": "assets/img/works/_thumbs/plener_457282073.webp",
    "full": "assets/img/works/plener/plener_457282073.webp",
    "cap": "«Апрельская ночь» · Масло, 40х30, 2023 г.",
    "cat": "plener",
    "pid": 457282073
  },
  {
    "src": "assets/img/works/_thumbs/plener_457282846.webp",
    "full": "assets/img/works/plener/plener_457282846.webp",
    "cap": "«Молодые сосны. Апрель» · Холст, масло, 80х60, 2023 г.",
    "cat": "plener",
    "pid": 457282846
  },
  {
    "src": "assets/img/works/_thumbs/plener_457282843.webp",
    "full": "assets/img/works/plener/plener_457282843.webp",
    "cap": "«Последний день апреля, Тройная гора» · Масло, 40х30, 2023 г.",
    "cat": "plener",
    "pid": 457282843
  },
  {
    "src": "assets/img/works/_thumbs/plener_457283669.webp",
    "full": "assets/img/works/plener/plener_457283669.webp",
    "cap": "«Май. Большая вода» · Холст, масло, 30х40, 2023 г.",
    "cat": "plener",
    "pid": 457283669
  },
  {
    "src": "assets/img/works/_thumbs/plener_457284065.webp",
    "full": "assets/img/works/plener/plener_457284065.webp",
    "cap": "«У пруда» · Масло, 30х40, 2023 г.",
    "cat": "plener",
    "pid": 457284065
  },
  {
    "src": "assets/img/works/_thumbs/plener_457283984.webp",
    "full": "assets/img/works/plener/plener_457283984.webp",
    "cap": "«Палозеро» · Холст, масло, 65х60, 2023 г.",
    "cat": "plener",
    "pid": 457283984
  },
  {
    "src": "assets/img/works/_thumbs/plener_457284247.webp",
    "full": "assets/img/works/plener/plener_457284247.webp",
    "cap": "«У Северной Двины» · Масло, 30х40, 2023 г.",
    "cat": "plener",
    "pid": 457284247
  },
  {
    "src": "assets/img/works/_thumbs/plener_457284356.webp",
    "full": "assets/img/works/plener/plener_457284356.webp",
    "cap": "«Туннель в Гаграх» · Масло, 40х30, 2023 г.",
    "cat": "plener",
    "pid": 457284356
  },
  {
    "src": "assets/img/works/_thumbs/plener_457284327.webp",
    "full": "assets/img/works/plener/plener_457284327.webp",
    "cap": "«Гагра» · Масло, 30х40, 2023 г.",
    "cat": "plener",
    "pid": 457284327
  },
  {
    "src": "assets/img/works/_thumbs/plener_457284384.webp",
    "full": "assets/img/works/plener/plener_457284384.webp",
    "cap": "«Дом в горах.» · Бумага, пастель, 30х40, 2022 г.",
    "cat": "plener",
    "pid": 457284384
  },
  {
    "src": "assets/img/works/_thumbs/plener_457284449.webp",
    "full": "assets/img/works/plener/plener_457284449.webp",
    "cap": "«Каменистый берег на закате» · Масло, 30х40, 2023 г.",
    "cat": "plener",
    "pid": 457284449
  },
  {
    "src": "assets/img/works/_thumbs/plener_457284509.webp",
    "full": "assets/img/works/plener/plener_457284509.webp",
    "cap": "«Гагринский берег.» · Бумага, пастель, 30х40, 2022 г.",
    "cat": "plener",
    "pid": 457284509
  },
  {
    "src": "assets/img/works/_thumbs/plener_457284508.webp",
    "full": "assets/img/works/plener/plener_457284508.webp",
    "cap": "«Пирсы в Гаграх» · Бумага, пастель, 30х40, 2022 г.",
    "cat": "plener",
    "pid": 457284508
  },
  {
    "src": "assets/img/works/_thumbs/plener_457284523.webp",
    "full": "assets/img/works/plener/plener_457284523.webp",
    "cap": "«Храм Святого Ипатия в Гаграх» · Масло, 30х40, 2023 г.",
    "cat": "plener",
    "pid": 457284523
  },
  {
    "src": "assets/img/works/_thumbs/plener_457284554.webp",
    "full": "assets/img/works/plener/plener_457284554.webp",
    "cap": "«Руины вокзала в старых Гаграх» · Масло, 30х40, 2023 г.",
    "cat": "plener",
    "pid": 457284554
  },
  {
    "src": "assets/img/works/_thumbs/plener_457284585.webp",
    "full": "assets/img/works/plener/plener_457284585.webp",
    "cap": "«Берег Чёрного моря» · Масло, 30х40, 2023 г.",
    "cat": "plener",
    "pid": 457284585
  },
  {
    "src": "assets/img/works/_thumbs/plener_457284685.webp",
    "full": "assets/img/works/plener/plener_457284685.webp",
    "cap": "«Конец августа» · Масло, 32х32,5, 2023 г.",
    "cat": "plener",
    "pid": 457284685
  },
  {
    "src": "assets/img/works/_thumbs/plener_457285231.webp",
    "full": "assets/img/works/plener/plener_457285231.webp",
    "cap": "«На повети» · Масло, 40х30, 2023 г.",
    "cat": "plener",
    "pid": 457285231
  },
  {
    "src": "assets/img/works/_thumbs/plener_457285207.webp",
    "full": "assets/img/works/plener/plener_457285207.webp",
    "cap": "«Дом в д. Ивлево» · Масло, 40х30, 2023 г.",
    "cat": "plener",
    "pid": 457285207
  },
  {
    "src": "assets/img/works/_thumbs/plener_457290109.webp",
    "full": "assets/img/works/plener/plener_457290109.webp",
    "cap": "«Валежник» · Холст, масло, 40х30, 2024 г.",
    "cat": "plener",
    "pid": 457290109
  },
  {
    "src": "assets/img/works/_thumbs/plener_457290180.webp",
    "full": "assets/img/works/plener/plener_457290180.webp",
    "cap": "«Лесная избушка» · Холст, масло, 26х24, 2024 г.",
    "cat": "plener",
    "pid": 457290180
  },
  {
    "src": "assets/img/works/_thumbs/plener_457289818.webp",
    "full": "assets/img/works/plener/plener_457289818.webp",
    "cap": "«Деревня Тройная гора. Март» · Холст, масло, 40х30, 2024 г.",
    "cat": "plener",
    "pid": 457289818
  },
  {
    "src": "assets/img/works/_thumbs/plener_457290373.webp",
    "full": "assets/img/works/plener/plener_457290373.webp",
    "cap": "«Апрельские тени» · Масло, 33х32,5, 2024 г.",
    "cat": "plener",
    "pid": 457290373
  },
  {
    "src": "assets/img/works/_thumbs/plener_457278205.webp",
    "full": "assets/img/works/plener/plener_457278205.webp",
    "cap": "«Октябрь. Лесное озеро» · Масло, 40х30, 2022 г.",
    "cat": "plener",
    "pid": 457278205
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292276.webp",
    "full": "assets/img/works/plener/plener_457292276.webp",
    "cap": "«Дом в деревне Волково.» · Масло, 40х30, 2024 г.",
    "cat": "plener",
    "pid": 457292276
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292269.webp",
    "full": "assets/img/works/plener/plener_457292269.webp",
    "cap": "«Май. У реки Корелки.» · Картон, масло, 40х30, 2024 г.",
    "cat": "plener",
    "pid": 457292269
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292268.webp",
    "full": "assets/img/works/plener/plener_457292268.webp",
    "cap": "«Двина вскрылась! Тройная гора» · Масло, 30х40, 2024 г.",
    "cat": "plener",
    "pid": 457292268
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292309.webp",
    "full": "assets/img/works/plener/plener_457292309.webp",
    "cap": "«ПИНЕГА. ОСОБНЯК М.И. ВОЛОДИНА.» · Холст, масло, 30х40, 2024 г.",
    "cat": "plener",
    "pid": 457292309
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292511.webp",
    "full": "assets/img/works/plener/plener_457292511.webp",
    "cap": "«Кимжа. Амбар у дороги.» · Масло, 30х40, 2024 г.",
    "cat": "plener",
    "pid": 457292511
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292316.webp",
    "full": "assets/img/works/plener/plener_457292316.webp",
    "cap": "«Река Кимжа. Закат.» · Масло, 30х40, 2024 г.",
    "cat": "plener",
    "pid": 457292316
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292315.webp",
    "full": "assets/img/works/plener/plener_457292315.webp",
    "cap": "«Кимжа. Травы.» · Масло, 30х40, 2024 г.",
    "cat": "plener",
    "pid": 457292315
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292527.webp",
    "full": "assets/img/works/plener/plener_457292527.webp",
    "cap": "«Кимжа.» · Масло, 30х40, 2024 г.",
    "cat": "plener",
    "pid": 457292527
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292529.webp",
    "full": "assets/img/works/plener/plener_457292529.webp",
    "cap": "\"Вид на Морской Никольский собор · Масло, 30х40, 2024 г.",
    "cat": "plener",
    "pid": 457292529
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292530.webp",
    "full": "assets/img/works/plener/plener_457292530.webp",
    "cap": "\"Форт у Кронштадта · Масло, 30х40, 2024 г.",
    "cat": "plener",
    "pid": 457292530
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292549.webp",
    "full": "assets/img/works/plener/plener_457292549.webp",
    "cap": "«Финский залив. Вид на форт Чумной.» · Масло, 30х40, 2024 г.",
    "cat": "plener",
    "pid": 457292549
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292551.webp",
    "full": "assets/img/works/plener/plener_457292551.webp",
    "cap": "«Ораниенбаум. В парке Дворца Меньшикова.» · Масло, 30х40, 2024 г.",
    "cat": "plener",
    "pid": 457292551
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292550.webp",
    "full": "assets/img/works/plener/plener_457292550.webp",
    "cap": "«Берег Петергофа.» · Масло, 30х40, 2024 г.",
    "cat": "plener",
    "pid": 457292550
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292598.webp",
    "full": "assets/img/works/plener/plener_457292598.webp",
    "cap": "«Дом в Тройной горе.» · Масло, 40х30, 2024 г.",
    "cat": "plener",
    "pid": 457292598
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292589.webp",
    "full": "assets/img/works/plener/plener_457292589.webp",
    "cap": "«Санкт-Петербург. Колодец.» · Масло, 40х30, 2024 г.",
    "cat": "plener",
    "pid": 457292589
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292746.webp",
    "full": "assets/img/works/plener/plener_457292746.webp",
    "cap": "«Озеро на болоте.» · Картон, масло, 40х30, 2024 г.",
    "cat": "plener",
    "pid": 457292746
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292740.webp",
    "full": "assets/img/works/plener/plener_457292740.webp",
    "cap": "«УХТОСТРОВ. БОГОЯВЛЕНСКИЙ ПОГОСТ» · Картон, масло, 50х40, 2024 г.",
    "cat": "plener",
    "pid": 457292740
  },
  {
    "src": "assets/img/works/_thumbs/plener_457292951.webp",
    "full": "assets/img/works/plener/plener_457292951.webp",
    "cap": "«Избушка в лесу.» · Картон, масло, 40х30, 2024 г.",
    "cat": "plener",
    "pid": 457292951
  },
  {
    "src": "assets/img/works/_thumbs/plener_456240497.webp",
    "full": "assets/img/works/plener/plener_456240497.webp",
    "cap": "«КАРГОПОЛЬ. Река ОНЕГА.(Этюд) Картон, масло, 21Х30, 2017г. ма» · Картон, масло, 21Х30",
    "cat": "plener",
    "pid": 456240497
  },
  {
    "src": "assets/img/works/_thumbs/plener_456246168.webp",
    "full": "assets/img/works/plener/plener_456246168.webp",
    "cap": "«Карстовые берега Северной Двины» · Холст, масло, 41Х32, 2018 г.",
    "cat": "plener",
    "pid": 456246168
  },
  {
    "src": "assets/img/works/_thumbs/plener_457295144.webp",
    "full": "assets/img/works/plener/plener_457295144.webp",
    "cap": "«Кострома. Дорога к реке» · Масло, 30х40, 2024 г.",
    "cat": "plener",
    "pid": 457295144
  },
  {
    "src": "assets/img/works/_thumbs/plener_457295158.webp",
    "full": "assets/img/works/plener/plener_457295158.webp",
    "cap": "«Чёрное озеро. Конец октября» · Масло, 30х40, 2022 г.",
    "cat": "plener",
    "pid": 457295158
  },
  {
    "src": "assets/img/works/_thumbs/plener_457295131.webp",
    "full": "assets/img/works/plener/plener_457295131.webp",
    "cap": "«Болото в октябре» · Масло, 40х30, 2022 г.",
    "cat": "plener",
    "pid": 457295131
  },
  {
    "src": "assets/img/works/_thumbs/plener_457296890.webp",
    "full": "assets/img/works/plener/plener_457296890.webp",
    "cap": "«Мостик через Волковлянку» · Холст, масло, 38х50, 2025 г.",
    "cat": "plener",
    "pid": 457296890
  },
  {
    "src": "assets/img/works/_thumbs/plener_457300450.webp",
    "full": "assets/img/works/plener/plener_457300450.webp",
    "cap": "«ЧУМ В ЛЕСУ» · Холст, масло, 40Х50, 2025 г.",
    "cat": "plener",
    "pid": 457300450
  },
  {
    "src": "assets/img/works/_thumbs/plener_457301488.webp",
    "full": "assets/img/works/plener/plener_457301488.webp",
    "cap": "«СТАРЫЙ ДВОРИК В ЯРОСЛАВЛЕ» · Холст, масло, 50Х60, 2025 г.",
    "cat": "plener",
    "pid": 457301488
  },
  {
    "src": "assets/img/works/_thumbs/plener_457301460.webp",
    "full": "assets/img/works/plener/plener_457301460.webp",
    "cap": "«ДЕРЕВНЯ ПЕТУХОВО» · Холст, масло, 40Х50, 2025 г.",
    "cat": "plener",
    "pid": 457301460
  },
  {
    "src": "assets/img/works/_thumbs/plener_457301528.webp",
    "full": "assets/img/works/plener/plener_457301528.webp",
    "cap": "«УЛОЧКА В КОЗЬМОДЕМЬЯНСКЕ» · Холст, масло, 40Х60, 2025 г.",
    "cat": "plener",
    "pid": 457301528
  },
  {
    "src": "assets/img/works/_thumbs/plener_457301517.webp",
    "full": "assets/img/works/plener/plener_457301517.webp",
    "cap": "«ЦЕРКОВЬ В0СКРЕСЕНЬЯ ХРИСТОВА (1758 г.) В ЧЕБОКСАРАХ» · Холст, масло, 50Х60, 2025 г.",
    "cat": "plener",
    "pid": 457301517
  },
  {
    "src": "assets/img/works/_thumbs/plener_457301596.webp",
    "full": "assets/img/works/plener/plener_457301596.webp",
    "cap": "«БЕЛОЕ МОРЕ. КАМЕННЫЙ ОСТРОВ» · Холст, масло, 40Х60, 2025 г.",
    "cat": "plener",
    "pid": 457301596
  },
  {
    "src": "assets/img/works/_thumbs/plener_457301529.webp",
    "full": "assets/img/works/plener/plener_457301529.webp",
    "cap": "«КИЙСКИЙ СЕВЕРНЫЙ ПЛЯЖ» · Бумага, пастель, 30Х40, 2025 г.",
    "cat": "plener",
    "pid": 457301529
  },
  {
    "src": "assets/img/works/_thumbs/plener_457301625.webp",
    "full": "assets/img/works/plener/plener_457301625.webp",
    "cap": "«У КРЕСТОВОЗДВИЖЕНСКОГО СОБОРА» · Холст, масло, 40Х60, 2025 г.",
    "cat": "plener",
    "pid": 457301625
  },
  {
    "src": "assets/img/works/_thumbs/plener_457301621.webp",
    "full": "assets/img/works/plener/plener_457301621.webp",
    "cap": "«ОСТРОВ КИЙ. МЫС РОГ» · Холст, масло, 60Х40, 2025 г.",
    "cat": "plener",
    "pid": 457301621
  },
  {
    "src": "assets/img/works/_thumbs/plener_457301647.webp",
    "full": "assets/img/works/plener/plener_457301647.webp",
    "cap": "«СЕВЕРНАЯ ЧАСТЬ ОСТРОВА КИЙ» · Холст, масло, 40Х60, 2025 г.",
    "cat": "plener",
    "pid": 457301647
  },
  {
    "src": "assets/img/works/_thumbs/plener_457301635.webp",
    "full": "assets/img/works/plener/plener_457301635.webp",
    "cap": "«БЕЛОМОРСКИЙ ЗАКАТ» · Холст, масло, 50Х60, 2025 г.",
    "cat": "plener",
    "pid": 457301635
  },
  {
    "src": "assets/img/works/_thumbs/plener_457301794.webp",
    "full": "assets/img/works/plener/plener_457301794.webp",
    "cap": "«ПЕРЕЙМА НА ОТЛИВЕ» · Холст, масло, 50Х60, 2025 г.",
    "cat": "plener",
    "pid": 457301794
  },
  {
    "src": "assets/img/works/_thumbs/plener_457301879.webp",
    "full": "assets/img/works/plener/plener_457301879.webp",
    "cap": "«В ПОРТУ КАЗАНИ» · Холст, масло, 50Х60, 2025 г.",
    "cat": "plener",
    "pid": 457301879
  },
  {
    "src": "assets/img/works/_thumbs/plener_457303426.webp",
    "full": "assets/img/works/plener/plener_457303426.webp",
    "cap": "«МОНАСТЫРЬ НА КИЙ ОСТРОВЕ» · Холст, масло, 65 Х100, 2025 г.",
    "cat": "plener",
    "pid": 457303426
  },
  {
    "src": "assets/img/works/_thumbs/plener_457304124.webp",
    "full": "assets/img/works/plener/plener_457304124.webp",
    "cap": "«КИЙСКИЙ КРЕСТНЫЙ МОНАСТЫРЬ» · Холст, масло, 65 Х100, 2025 г.",
    "cat": "plener",
    "pid": 457304124
  },
  {
    "src": "assets/img/works/_thumbs/plener_457304136.webp",
    "full": "assets/img/works/plener/plener_457304136.webp",
    "cap": "«ТАВРСКИЕ ГОРЫ. АНТАЛИЯ» · Пастель, 30Х40, 2026 г.",
    "cat": "plener",
    "pid": 457304136
  },
  {
    "src": "assets/img/works/_thumbs/plener_457304132.webp",
    "full": "assets/img/works/plener/plener_457304132.webp",
    "cap": "«МЕЧЕТЬ В КАЛЕИЧИ» · Масло, 30Х40, 2026 г.",
    "cat": "plener",
    "pid": 457304132
  },
  {
    "src": "assets/img/works/_thumbs/plener_457304131.webp",
    "full": "assets/img/works/plener/plener_457304131.webp",
    "cap": "«ТУРЕЦКИЙ БЕРЕГ» · Масло, 40Х30, 2026 г.",
    "cat": "plener",
    "pid": 457304131
  },
  {
    "src": "assets/img/works/_thumbs/plener_457306521.webp",
    "full": "assets/img/works/plener/plener_457306521.webp",
    "cap": "«ЛЕДОХОД НА СЕВЕРНОЙ ДВИНЕ» · Картон, масло, 30Х40, 2026 г.",
    "cat": "plener",
    "pid": 457306521
  },
  {
    "src": "assets/img/works/_thumbs/plener_457306517.webp",
    "full": "assets/img/works/plener/plener_457306517.webp",
    "cap": "«Двина ещё стоит. Апрель» · Холст, масло, 40Х50, 2026 г.",
    "cat": "plener",
    "pid": 457306517
  },
  {
    "src": "assets/img/works/_thumbs/plener_457306551.webp",
    "full": "assets/img/works/plener/plener_457306551.webp",
    "cap": "«АПРЕЛЬ. СНЕГ ТАЕТ.» · Масло, 30Х40, 2026 г.",
    "cat": "plener",
    "pid": 457306551
  },
  {
    "src": "assets/img/works/_thumbs/plener_457306647.webp",
    "full": "assets/img/works/plener/plener_457306647.webp",
    "cap": "«АПРЕЛЬ. СНЕГ СТАЯЛ» · Картон, масло, 30Х40, 2026 г.",
    "cat": "plener",
    "pid": 457306647
  },
  {
    "src": "assets/img/works/_thumbs/plener_457308656.webp",
    "full": "assets/img/works/plener/plener_457308656.webp",
    "cap": "«ПЕСКИ ОСТРОВА ВЕРХНЕЕ ЛОВЦЕВО.» · Масло, 35Х45, 2026 г.",
    "cat": "plener",
    "pid": 457308656
  },
  {
    "src": "assets/img/works/_thumbs/plener_457308653.webp",
    "full": "assets/img/works/plener/plener_457308653.webp",
    "cap": "«УХТОСТРОВ. ДОРОГА К ХРАМУ.» · Картон, масло, 50Х40, 2026 г.",
    "cat": "plener",
    "pid": 457308653
  },
  {
    "src": "assets/img/works/_thumbs/plener_457308626.webp",
    "full": "assets/img/works/plener/plener_457308626.webp",
    "cap": "«НА ДВИНСКОМ БЕРЕГУ, ЧУХЧЕРЕМА.» · Картон, масло, 40Х50, 2026 г.",
    "cat": "plener",
    "pid": 457308626
  },
  {
    "src": "assets/img/works/_thumbs/plener_457308619.webp",
    "full": "assets/img/works/plener/plener_457308619.webp",
    "cap": "«ЖАРКИЙ ДЕНЬ.» · Картон, масло, 40Х50, 2026 г.",
    "cat": "plener",
    "pid": 457308619
  },
  {
    "src": "assets/img/works/_thumbs/plener_457308659.webp",
    "full": "assets/img/works/plener/plener_457308659.webp",
    "cap": "«ПИНЕГА. ЗАДВОРКИ ВОЛОДИНСКОГО КВАРТАЛА.» · Масло, 40Х30, 2026 г.",
    "cat": "plener",
    "pid": 457308659
  },
  {
    "src": "assets/img/works/_thumbs/plener_457308673.webp",
    "full": "assets/img/works/plener/plener_457308673.webp",
    "cap": "«КУЛОГОРЫ. ВЕТРЕННО» · Холст, масло, 50Х60, 2026 г.",
    "cat": "plener",
    "pid": 457308673
  },
  {
    "src": "assets/img/works/_thumbs/plener_457308670.webp",
    "full": "assets/img/works/plener/plener_457308670.webp",
    "cap": "«КУЛОГОРЫ.» · Масло, 30Х40, 2026 г.",
    "cat": "plener",
    "pid": 457308670
  },
  {
    "src": "assets/img/works/_thumbs/plener_457309212.webp",
    "full": "assets/img/works/plener/plener_457309212.webp",
    "cap": "«КИЖИ» · Пастель, 30Х40, 2026 г.",
    "cat": "plener",
    "pid": 457309212
  },
  {
    "src": "assets/img/works/_thumbs/plener_457309210.webp",
    "full": "assets/img/works/plener/plener_457309210.webp",
    "cap": "«ДВОРЫ МАНДРОГИ» · Пастель, 30Х40, 2026 г.",
    "cat": "plener",
    "pid": 457309210
  },
  {
    "src": "assets/img/works/_thumbs/plener_457309208.webp",
    "full": "assets/img/works/plener/plener_457309208.webp",
    "cap": "«МАНДРОГИ» · Пастель, 30Х40, 2026 г.",
    "cat": "plener",
    "pid": 457309208
  },
  {
    "src": "assets/img/works/_thumbs/plener_457309224.webp",
    "full": "assets/img/works/plener/plener_457309224.webp",
    "cap": "«ВАЛААМ. ВИД НА ВОСКРЕСЕНСКИЙ СКИТ» · Пастель, 30Х40, 2026 г.",
    "cat": "plener",
    "pid": 457309224
  },
  {
    "src": "assets/img/works/_thumbs/plener_457309234.webp",
    "full": "assets/img/works/plener/plener_457309234.webp",
    "cap": "«НИКОЛАЕВСКАЯ ЦЕРКОВЬ В КРОНШТАДТЕ.» · Пастель, 30Х40, 2026 г.",
    "cat": "plener",
    "pid": 457309234
  },
  {
    "src": "assets/img/works/_thumbs/plener_457309214.webp",
    "full": "assets/img/works/plener/plener_457309214.webp",
    "cap": "«ПОЮЩИЙ ФОНТАН В КРОНШТАДТЕ» · Пастель, 30Х40, 2026 г.",
    "cat": "plener",
    "pid": 457309214
  },
  {
    "src": "assets/img/works/_thumbs/plener_457309235.webp",
    "full": "assets/img/works/plener/plener_457309235.webp",
    "cap": "«МОРСКОЙ СОБОР В КРОНШТАДТЕ» · Пастель, 30Х40, 2026 г.",
    "cat": "plener",
    "pid": 457309235
  },
  {
    "src": "assets/img/works/_thumbs/plener_457309239.webp",
    "full": "assets/img/works/plener/plener_457309239.webp",
    "cap": "«АРКА КРОНШТАДСКОЙ ПОДВОРОТНИ» · Пастель, 30Х40, 2026 г.",
    "cat": "plener",
    "pid": 457309239
  },
  {
    "src": "assets/img/works/_thumbs/plener_457305969.webp",
    "full": "assets/img/works/plener/plener_457305969.webp",
    "cap": "«ЯНВАРСКИЙ ДЕНЁК» · Холст, масло, 51Х69, 2026 г.",
    "cat": "plener",
    "pid": 457305969
  },
  {
    "src": "assets/img/works/_thumbs/plener_457310303.webp",
    "full": "assets/img/works/plener/plener_457310303.webp",
    "cap": "«КРАСКИ ОСЕНИ.» · Масло, 20Х30, 2026 г.",
    "cat": "plener",
    "pid": 457310303
  },
  {
    "src": "assets/img/works/_thumbs/sculpture_396767001.webp",
    "full": "assets/img/works/sculpture/sculpture_396767001.webp",
    "cap": "«Рыбак» · Глина",
    "cat": "sculpture",
    "pid": 396767001
  },
  {
    "src": "assets/img/works/_thumbs/sculpture_396766997.webp",
    "full": "assets/img/works/sculpture/sculpture_396766997.webp",
    "cap": "«Человек и собака» · Пластилин",
    "cat": "sculpture",
    "pid": 396766997
  },
  {
    "src": "assets/img/works/_thumbs/sculpture_457279936.webp",
    "full": "assets/img/works/sculpture/sculpture_457279936.webp",
    "cap": "«ПОРТРЕТ ЖЕНЫ» · Гипс, 37х 13 х 29, 2020 г.",
    "cat": "sculpture",
    "pid": 457279936
  },
  {
    "src": "assets/img/works/_thumbs/sculpture_457274674.webp",
    "full": "assets/img/works/sculpture/sculpture_457274674.webp",
    "cap": "«ВЕРСИЯ 3803» · 2022 г.",
    "cat": "sculpture",
    "pid": 457274674
  },
  {
    "src": "assets/img/works/_thumbs/sculpture_457273809.webp",
    "full": "assets/img/works/sculpture/sculpture_457273809.webp",
    "cap": "«МОЙ СЕВЕР» · 2022 г.",
    "cat": "sculpture",
    "pid": 457273809
  },
  {
    "src": "assets/img/works/_thumbs/sculpture_457291465.webp",
    "full": "assets/img/works/sculpture/sculpture_457291465.webp",
    "cap": "«ТРОЙНЯ ГОРА. Холмогорский район» · 2024 г.",
    "cat": "sculpture",
    "pid": 457291465
  },
  {
    "src": "assets/img/works/_thumbs/sculpture_457291473.webp",
    "full": "assets/img/works/sculpture/sculpture_457291473.webp",
    "cap": "«Абстракция» · 209 Х 58 см, 2024 г.",
    "cat": "sculpture",
    "pid": 457291473
  },
  {
    "src": "assets/img/works/_thumbs/sculpture_457295557.webp",
    "full": "assets/img/works/sculpture/sculpture_457295557.webp",
    "cap": "«Абстракция» · 209 Х 58 см, 2024 г.",
    "cat": "sculpture",
    "pid": 457295557
  },
  {
    "src": "assets/img/works/_thumbs/sculpture_457295559.webp",
    "full": "assets/img/works/sculpture/sculpture_457295559.webp",
    "cap": "«ВЕРСИЯ 3803» · Гипс, 37х 13 х 29, 2022 г.",
    "cat": "sculpture",
    "pid": 457295559
  },
  {
    "src": "assets/img/works/_thumbs/sculpture_457295555.webp",
    "full": "assets/img/works/sculpture/sculpture_457295555.webp",
    "cap": "«Портрет художника Вячеслава Ларионова.» · Гипс, 25х28х41, 2021 г.",
    "cat": "sculpture",
    "pid": 457295555
  },
  {
    "src": "assets/img/works/_thumbs/sculpture_457295556.webp",
    "full": "assets/img/works/sculpture/sculpture_457295556.webp",
    "cap": "«ПРИХОЖАНКА» · Гипс, 39х27х33, 2020 г.",
    "cat": "sculpture",
    "pid": 457295556
  },
  {
    "src": "assets/img/works/_thumbs/sculpture_457295554.webp",
    "full": "assets/img/works/sculpture/sculpture_457295554.webp",
    "cap": "«МОЙ СЕВЕР» · Гипс, 39х27х33, 2022 г.",
    "cat": "sculpture",
    "pid": 457295554
  },
  {
    "src": "assets/img/works/_thumbs/sculpture_457295561.webp",
    "full": "assets/img/works/sculpture/sculpture_457295561.webp",
    "cap": "«РАБОЧИЕ МОМЕНТЫ»",
    "cat": "sculpture",
    "pid": 457295561
  },
  {
    "src": "assets/img/works/_thumbs/sculpture_457295558.webp",
    "full": "assets/img/works/sculpture/sculpture_457295558.webp",
    "cap": "«РАБОЧИЕ МОМЕНТЫ»",
    "cat": "sculpture",
    "pid": 457295558
  },
  {
    "src": "assets/img/works/_thumbs/sculpture_457295560.webp",
    "full": "assets/img/works/sculpture/sculpture_457295560.webp",
    "cap": "«СТОЛБ ЭМОЦИЙ» · 2012 Х 54 см, 2012 г.",
    "cat": "sculpture",
    "pid": 457295560
  }
];

  var galleryEl = document.getElementById('gallery');
  var filterEl = document.getElementById('galleryFilter');
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var current = 0;
  var filtered = [];

  function renderGallery() {
    if (!GALLERY.length) return;
    galleryEl.innerHTML = '';
    GALLERY.forEach(function (item, i) {
      var div = document.createElement('div');
      div.className = 'g-item';
      div.dataset.idx = i;
      div.dataset.cat = item.cat;
      var lazy = i >= 8 ? ' loading="lazy" decoding="async"' : ' decoding="async"';
      div.innerHTML = '<img src="' + item.src + '" alt="' + item.cap + '"' + lazy + '>' +
        '<div class="cap">' + item.cap + '</div>';
      div.addEventListener('click', function () { openLb(i); });
      galleryEl.appendChild(div);
    });
    applyFilter(filterEl.querySelector('.active').dataset.filter);
  }

  function applyFilter(cat) {
    Array.prototype.forEach.call(galleryEl.children, function (el) {
      var show = (cat === 'all') || (el.dataset.cat === cat);
      if (show) {
        el.style.display = '';
        el.style.opacity = '0';
        el.style.transform = 'scale(0.96)';
        requestAnimationFrame(function () {
          el.style.transition = 'opacity .35s ease, transform .35s ease';
          el.style.opacity = '1';
          el.style.transform = 'scale(1)';
        });
      } else {
        el.style.display = 'none';
      }
    });
    filtered = GALLERY.map(function (g, i) { return i; }).filter(function (i) {
      return (cat === 'all') || (GALLERY[i].cat === cat);
    });
  }

  filterEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterEl.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });

  function openLb(i) {
    current = i;
    lbImg.src = GALLERY[i].full || GALLERY[i].src;
    lbCap.textContent = GALLERY[i].cap;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  function navLb(dir) {
    if (!filtered.length) return;
    var pos = filtered.indexOf(current);
    pos = (pos + dir + filtered.length) % filtered.length;
    openLb(filtered[pos]);
  }

  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbPrev').addEventListener('click', function () { navLb(-1); });
  document.getElementById('lbNext').addEventListener('click', function () { navLb(1); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLb();
  });
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') navLb(-1);
    if (e.key === 'ArrowRight') navLb(1);
  });

  renderGallery();

  // Автоматическая подгрузка свежих картин из панели управления
  if (window.fetch) {
    fetch('gallery-data.json?v=' + Date.now())
      .then(function (res) {
        if (!res.ok) throw new Error('status ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (Array.isArray(data) && data.length) {
          GALLERY = data;
          renderGallery();
        }
      })
      .catch(function () {});
  }

    /* ---- Улучшенный просмотр портретов в лайтбоксе (высокое разрешение) ---- */
  function openCustomLb(src, cap) {
    lbImg.src = src;
    lbCap.textContent = cap;
    var prevBtn = document.getElementById('lbPrev');
    var nextBtn = document.getElementById('lbNext');
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // Восстанавливаем кнопки переключения для галереи
  var origOpenLb = openLb;
  openLb = function(i) {
    var prevBtn = document.getElementById('lbPrev');
    var nextBtn = document.getElementById('lbNext');
    if (prevBtn) prevBtn.style.display = '';
    if (nextBtn) nextBtn.style.display = '';
    origOpenLb(i);
  };

  var heroLink = document.getElementById('heroPortraitLink');
  if (heroLink) {
    heroLink.addEventListener('click', function (e) {
      e.preventDefault();
      var fullSrc = heroLink.getAttribute('href') || 'assets/img/portrait-full.webp';
      var cap = heroLink.getAttribute('data-cap') || 'Александр Николаевич Яшков — художник русского Севера';
      openCustomLb(fullSrc, cap);
    });
  }

  var aboutPhoto = document.querySelector('.about-photo img');
  if (aboutPhoto) {
    aboutPhoto.style.cursor = 'zoom-in';
    aboutPhoto.addEventListener('click', function () {
      openCustomLb(aboutPhoto.src, 'Александр Николаевич Яшков — художник-живописец, график, педагог');
    });
  }

  var diplomaLink = document.getElementById('diplomaLink');
  if (diplomaLink) {
    diplomaLink.addEventListener('click', function (e) {
      e.preventDefault();
      openCustomLb(diplomaLink.getAttribute('href'), diplomaLink.getAttribute('data-cap'));
    });
  }

  var studioSeal = document.querySelector('.studio-seal-pic');
  if (studioSeal) {
    studioSeal.addEventListener('click', function () {
      openCustomLb(studioSeal.src, 'Творческая мастерская Александра Яшкова — официальный логотип');
    });
  }

  var studioPhoto = document.querySelector('.studio-intro-photo img');
  if (studioPhoto) {
    studioPhoto.style.cursor = 'zoom-in';
    studioPhoto.addEventListener('click', function () {
      openCustomLb(studioPhoto.src, 'Александр Яшков в мастерской');
    });
  }

  
  /* ---- Клик по гербам и знакам для открытия в лайтбоксе ---- */
  ['studioPortraitLink', 'studioSealLink', 'ccSealLink', 'footerSealLink'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openCustomLb(el.getAttribute('href'), el.getAttribute('data-cap'));
      });
    }
  });

  /* ---- Пасхалка: Поморская птица счастья внизу сайта ---- */
  (function initEasterEgg() {
    var egg = document.getElementById('skyEasterEgg');
    var toast = document.getElementById('easterToast');
    var toastTimer = null;
    var isAnimating = false;

    function showToast(text) {
      if (!toast) return;
      if (text) {
        var tEl = toast.querySelector('.easter-toast-text');
        if (tEl) tEl.textContent = text;
      }
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toast.classList.remove('show');
      }, 5500);
    }

    if (egg) {
      egg.addEventListener('click', function (e) {
        e.stopPropagation();
        if (isAnimating) return;
        isAnimating = true;

        // Взлёт, вращение и сияние птицы счастья
        egg.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.8s';
        egg.style.transform = 'translateY(-26px) scale(1.35) rotate(720deg)';
        egg.style.filter = 'drop-shadow(0 0 25px rgba(255, 215, 0, 1))';

        showToast('«Птица счастья поморов: тепло северного дома, мир и вдохновение для вас!» — Александр Яшков ✨');

        setTimeout(function () {
          // Мягкое возвращение на место
          egg.style.transition = 'transform 0.9s ease-out, filter 0.9s';
          egg.style.transform = 'translateY(0) scale(1) rotate(0deg)';
          egg.style.filter = '';
          setTimeout(function () {
            isAnimating = false;
            egg.style.transition = '';
            egg.style.transform = '';
          }, 950);
        }, 1200);
      });
    }
  })();

  

    // Слайдер фото студии в разделе мастерской (автосмена по умолчанию)
  (function initStudioSlides() {
    var slides = document.querySelectorAll('#studioSlides .slide-img');
    var parentLink = document.getElementById('studioPortraitLink');
    if (!slides.length) return;
    var cur = 0;
    setInterval(function() {
      slides[cur].classList.remove('active');
      cur = (cur + 1) % slides.length;
      slides[cur].classList.add('active');
      if (parentLink) {
        parentLink.setAttribute('href', slides[cur].src);
        parentLink.setAttribute('data-cap', slides[cur].dataset.cap || slides[cur].alt);
      }
    }, 3800);
  })();

    // Слайдер выставок и пленэров (автосмена по умолчанию, пауза при наведении, стрелки)
  (function initEventsSlides() {
    var showcase = document.getElementById('eventsShowcase');
    var slides = document.querySelectorAll('#eventsSlides .event-slide');
    var dots = document.querySelectorAll('#eventsDots .edot');
    var prevBtn = document.getElementById('esPrev');
    var nextBtn = document.getElementById('esNext');
    if (!slides.length) return;
    
    var cur = 0;
    var timer = null;
    var isHovered = false;

    function show(idx) {
      slides[cur].classList.remove('active');
      if (dots[cur]) dots[cur].classList.remove('active');
      cur = (idx + slides.length) % slides.length;
      slides[cur].classList.add('active');
      if (dots[cur]) dots[cur].classList.add('active');
    }

    function next() {
      if (!isHovered) {
        show(cur + 1);
      }
    }

    function startTimer() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, 4000);
    }

    startTimer();

    if (showcase) {
      showcase.addEventListener('mouseenter', function() { isHovered = true; });
      showcase.addEventListener('mouseleave', function() { isHovered = false; });
      // Click on slide opens lightbox
      showcase.addEventListener('click', function(e) {
        if (e.target.closest('.es-nav-btn') || e.target.closest('.edot')) return;
        var act = slides[cur];
        var bg = act.style.backgroundImage.slice(4, -1).replace(/["']/g, "");
        var cap = act.dataset.cap || "Выставки и пленэры Александра Яшкова";
        var lb = document.getElementById('lightbox');
        var lbImg = document.getElementById('lbImg');
        var lbCap = document.getElementById('lbCap');
        if (lb && lbImg) {
          lbImg.src = bg;
          if (lbCap) lbCap.textContent = cap;
          lb.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        show(cur - 1);
        startTimer();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        show(cur + 1);
        startTimer();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function(e) {
        e.stopPropagation();
        show(parseInt(dot.dataset.idx, 10));
        startTimer();
      });
    });
  })();

  /* ---- Cookie Banner & Политика конфиденциальности (152-ФЗ) ---- */
  (function initPrivacy() {
    var banner = document.getElementById('cookieBanner');
    var acceptBtn = document.getElementById('cookieAcceptBtn');
    var modal = document.getElementById('privacyModal');
    var closeBtn = document.getElementById('privacyClose');
    var okBtn = document.getElementById('privacyOkBtn');
    var backdrop = document.getElementById('privacyBackdrop');
    var privacyLinks = document.querySelectorAll('a[href="#privacy"]');

    try {
      if (banner && !localStorage.getItem('yashkov_cookie_accepted')) {
        setTimeout(function () {
          banner.classList.add('show');
        }, 1200);
      }
    } catch (e) {}

    if (acceptBtn && banner) {
      acceptBtn.addEventListener('click', function () {
        banner.classList.remove('show');
        try {
          localStorage.setItem('yashkov_cookie_accepted', '1');
        } catch (e) {}
      });
    }

    function openModal(e) {
      if (e) e.preventDefault();
      if (modal) modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      if (modal) modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    privacyLinks.forEach(function (l) {
      l.addEventListener('click', openModal);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (okBtn) okBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
        closeModal();
      }
    });
  })();


})();
