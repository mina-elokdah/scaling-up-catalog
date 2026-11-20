(() => {
  "use strict";

  const catalog = window.SCALING_UP_CATALOG;
  const results = document.querySelector("#results");
  const search = document.querySelector("#search");
  const count = document.querySelector("#result-count");
  const dialog = document.querySelector("#details");
  const content = document.querySelector("#dialog-content");
  const filters = [...document.querySelectorAll("[data-filter]")];
  const number = new Intl.NumberFormat("ar-EG");
  const labels = {
    career: "البحث عن عمل والاستعداد المهني",
    communication: "التواصل والتعامل مع الآخرين",
    leadership: "القيادة وإدارة الفرق والمشاريع",
    effectiveness: "الإنتاجية والتفكير وحل المشكلات",
    skills: "ورشة مهارات",
    ai: "ورشة ذكاء اصطناعي",
    course: "كورس مجمّع"
  };
  let activeFilter = "all";
  let detailTrigger;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  if (!catalog?.items?.length) {
    results.append(element("p", "empty", "تعذّر عرض الكتالوج. تواصل معنا للاستفسار عن التدريبات."));
    return;
  }

  function interestLink(item) {
    const message = "أهلاً Scaling Up، عندي اهتمام بتدريب «" + item.title + "». ممكن تبعتولي رابط التسجيل؟";
    return "https://wa.me/" + catalog.whatsapp + "?text=" + encodeURIComponent(message);
  }

  function interestButton(item) {
    const link = element("a", "button primary", "سجّل اهتمامك");
    link.href = interestLink(item);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "سجّل اهتمامك بتدريب " + item.title + " على واتساب");
    return link;
  }

  function duration(item) {
    const sessions = item.sessions === 1 ? "جلسة واحدة" : item.sessions === 2 ? "جلستان" :
      number.format(item.sessions) + (item.sessions <= 10 ? " جلسات" : " جلسة");
    return number.format(item.hours) + (item.hours <= 10 ? " ساعات" : " ساعة") + " · " + sessions;
  }

  function prices(item) {
    const list = element("dl", "prices");
    for (const [label, price] of [["أونلاين", item.online], ["حضوري", item.inPerson]]) {
      const part = element("div");
      part.append(element("dt", null, label + " · من"), element("dd", null, number.format(price) + " ج.م."));
      list.append(part);
    }
    return list;
  }

  function detailList(items) {
    const list = element("ul");
    for (const item of items) list.append(element("li", null, item));
    return list;
  }

  function showDetails(item, trigger) {
    detailTrigger = trigger;
    const body = element("div", "modal-body");
    const title = element("h2", null, item.title);
    title.id = "dialog-title";
    body.append(element("p", "eyebrow", labels[item.category || item.type]), title, element("p", null, item.summary), element("p", "result-count", duration(item)), prices(item));
    if (item.audience) body.append(element("h3", null, "التدريب مناسب لمين؟"), element("p", null, item.audience));
    if (item.objectives) body.append(element("h3", null, "هتتعلم إيه؟"), detailList(item.objectives));
    if (item.modules) body.append(element("h3", null, "الورش اللي بيشملها الكورس"), detailList(item.modules));
    const actions = element("div", "actions");
    actions.append(interestButton(item));
    body.append(actions);
    content.replaceChildren(body);
    dialog.showModal();
  }

  function makeCard(item) {
    const card = element("article", "card");
    const header = element("div", "card-top");
    const category = item.category || item.type;
    header.append(element("span", "tag " + category, labels[category]), element("span", null, duration(item)));
    const actions = element("div", "actions");
    const details = element("button", "button secondary", "التفاصيل");
    details.type = "button";
    details.setAttribute("aria-label", "تفاصيل " + item.title);
    details.addEventListener("click", () => showDetails(item, details));
    actions.append(details, interestButton(item));
    card.append(header, element("h3", null, item.title), element("p", null, item.summary), prices(item), actions);
    return card;
  }

  function normalize(value) {
    return value.toLowerCase().replace(/[\u0640\u064b-\u065f\u0670]/g, "")
      .replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").trim();
  }

  function render() {
    const terms = normalize(search.value).split(/\s+/).filter(Boolean);
    const matches = catalog.items.filter(item => {
      const category = item.category || item.type;
      if (activeFilter !== "all" && category !== activeFilter) return false;
      const haystack = normalize([item.title, item.summary, labels[category], ...(item.modules || [])].join(" "));
      return terms.every(term => haystack.includes(term));
    });
    count.textContent = "عدد التدريبات: " + number.format(matches.length);
    if (!matches.length) {
      results.replaceChildren(element("p", "empty", "مفيش تدريبات مطابقة. جرّب كلمة تانية أو غيّر التصفية."));
      return;
    }
    results.replaceChildren(...matches.map(makeCard));
  }

  for (const button of filters) {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      for (const filter of filters) filter.setAttribute("aria-pressed", String(button === filter));
      render();
    });
  }
  search.addEventListener("input", render);
  dialog.addEventListener("close", () => detailTrigger?.focus());
  render();
})();
