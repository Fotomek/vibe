/* VIBE Prototyp, keine echte KI, kein Backend */
(function () {
  const PEOPLE = [
    {
      id: "alex",
      name: "Alex",
      initials: "A",
      color: "#0a6f9a",
      space: "Deggendorf",
      sides: ["b2b", "mensch"],
      source: "kuratiert",
      b2b: "Handwerk · fertigt und repariert, sucht verlässliche Abnehmer",
      mensch: "Ruhige Gespräche, Werkstattbesuche, Kaffee",
      offer: "Fertigung und feine Reparatur",
      seek: "Verlässliche Partner für gemeinsame Projekte",
      meet: "Gern vor Ort, in Ruhe",
      values: [
        { title: "Verlässlichkeit", text: "Zusagen gelten. Termine und Absprachen werden gehalten." },
        { title: "Sorgfalt", text: "Die Arbeit soll stehen, auch wenn niemand zuschaut." },
        { title: "Direkte Worte", text: "Klar sagen, was geht und was nicht geht." }
      ],
      resonance: 86,
      reason: "Ihr sucht beide verlässliche Partner vor Ort und trefft euch gern persönlich."
    },
    {
      id: "mira",
      name: "Mira",
      initials: "M",
      color: "#1a4a60",
      space: "Deggendorf und darüber hinaus",
      sides: ["b2b"],
      source: "kuratiert",
      b2b: "Beratung · bringt Abläufe zusammen, sucht regionale Kooperation",
      mensch: "Klare Worte, offene Fragen",
      offer: "Struktur und Beratung für kleine Betriebe",
      seek: "Synergien in der Region, später auch international",
      meet: "Kurz und konkret, gern bei einem Spaziergang",
      values: [
        { title: "Klarheit", text: "Erst verstehen, dann vorschlagen." },
        { title: "Zusammenarbeit", text: "Gute Arbeit entsteht zu zweit, nicht übereinander hinweg." },
        { title: "Maßhalten", text: "Nur das anbieten, was wirklich hilft." }
      ],
      resonance: 74,
      reason: "Euer Angebot und eure Suche greifen ineinander: Struktur trifft auf lokale Wirtschaft."
    },
    {
      id: "sam",
      name: "Sam",
      initials: "S",
      color: "#15556e",
      space: "Deggendorf",
      sides: ["mensch"],
      source: "ki",
      b2b: "Kulturarbeit neben dem Tagesgeschäft",
      mensch: "Begegnung, Zuhören, gemeinsame Abende",
      offer: "Räume für Begegnung",
      seek: "Menschen, die ehrlich und unaufgeregt zusammenkommen",
      meet: "Abends, ohne Hektik",
      values: [
        { title: "Zuhören", text: "Erst den anderen ausreden lassen." },
        { title: "Nähe", text: "Begegnung braucht Zeit und einen ruhigen Ort." },
        { title: "Ruhe", text: "Kein Lärm, keine Pose." }
      ],
      resonance: 81,
      reason: "Auf der menschlichen Seite liegt eine hohe Nähe: beide suchen ehrliche, ruhige Begegnung."
    },
    {
      id: "kim",
      name: "Kim",
      initials: "K",
      color: "#0d3d52",
      space: "International, Start in Deggendorf",
      sides: ["b2b", "mensch"],
      source: "ki",
      b2b: "Produktion · sucht Austausch zu Qualität und Vertrieb",
      mensch: "Direkt, freundlich, neugierig",
      offer: "Kleine Serien mit hohem Anspruch",
      seek: "Partner für Sichtbarkeit und gemeinsame Wege",
      meet: "Vor Ort oder in einem klaren Gespräch",
      values: [
        { title: "Qualität", text: "Lieber weniger, dafür stimmig." },
        { title: "Neugier", text: "Offen bleiben für Wege, die noch nicht festliegen." },
        { title: "Offene Wege", text: "Lokal starten, den Blick trotzdem nach außen richten." }
      ],
      resonance: 69,
      reason: "Die Richtung stimmt, die Resonanz ist spürbar, aber noch nicht eng. Ein Gespräch kann das klären."
    }
  ];

  const TRUST_LABELS = {
    1: "Stufe 1 · Kennenlernen",
    2: "Stufe 2 · Nach dem Treffen",
    3: "Stufe 3 · Vertrauenskreis"
  };

  const state = {
    filter: "beide",
    accepted: [],
    declined: [],
    meetings: [],
    trust: {},
    feedback: {},
    directory: false,
    toastTimer: null,
    feedbackFocus: ""
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function parseHash() {
    const raw = (location.hash || "#/start").replace(/^#\/?/, "");
    const parts = raw.split("/").filter(Boolean);
    const screen = parts[0] || "start";
    const param = parts[1] || "";
    const extra = parts[2] || "";
    return { screen, param, extra };
  }

  function go(path) {
    const hash = path.startsWith("#") ? path : "#/" + path.replace(/^\//, "");
    if (location.hash === hash) {
      render();
    } else {
      location.hash = hash;
    }
  }

  function personById(id) {
    return PEOPLE.find((p) => p.id === id);
  }

  function trustOf(id) {
    return state.trust[id] || 1;
  }

  function sourceLabel(p) {
    return p.source === "kuratiert" ? "Kuratierter Vorschlag" : "KI-Vorschlag";
  }

  function sourceChip(p) {
    const cls = p.source === "kuratiert" ? "chip chip-ok" : "chip chip-blue";
    return `<span class="${cls}">${sourceLabel(p)}</span>`;
  }

  function visiblePeople() {
    return PEOPLE.filter((p) => {
      if (state.accepted.includes(p.id) || state.declined.includes(p.id)) return false;
      if (state.filter === "b2b") return p.sides.includes("b2b");
      if (state.filter === "mensch") return p.sides.includes("mensch");
      return true;
    });
  }

  function sideTags(p) {
    const tags = [];
    if (p.sides.includes("b2b")) tags.push("B2B");
    if (p.sides.includes("mensch")) tags.push("Mensch");
    return tags;
  }

  function avatarHtml(p, size) {
    const cls = size === "lg" ? "avatar lg" : size === "sm" ? "avatar sm" : "avatar";
    return `<div class="${cls}" style="background:${p.color}">${p.initials}</div>`;
  }

  function showToast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => el.classList.remove("is-on"), 2800);
  }

  function meetingFor(id) {
    return state.meetings.find((m) => m.with === id);
  }

  function ensureAccepted(id) {
    if (!state.accepted.includes(id)) state.accepted.push(id);
    state.declined = state.declined.filter((x) => x !== id);
  }

  function ensureMeeting(id, opts) {
    ensureAccepted(id);
    let m = meetingFor(id);
    if (!m) {
      m = {
        with: id,
        place: "Café am Fluss (Beispiel), Deggendorf",
        when: "Freitag, 10 Uhr",
        note: "Gern in Ruhe, ohne Druck.",
        confirmed: false
      };
      state.meetings.push(m);
    }
    if (opts && opts.confirmed) m.confirmed = true;
    return m;
  }

  function applyTrustDemo(id, extra) {
    if (!personById(id)) return;
    if (extra === "stufe1") {
      state.trust[id] = 1;
    } else if (extra === "stufe2") {
      ensureMeeting(id, { confirmed: true });
      state.trust[id] = 2;
    } else if (extra === "stufe3") {
      ensureMeeting(id, { confirmed: true });
      state.trust[id] = 3;
    } else if (!state.trust[id]) {
      state.trust[id] = 1;
    }
  }

  function render() {
    const { screen, param, extra } = parseHash();
    const known = ["start", "kreis", "profil", "finder", "treffen", "regeln", "person"];
    const name = known.includes(screen) ? screen : "start";

    $$(".screen").forEach((s) => s.classList.remove("is-active"));
    const section = $("#screen-" + name);
    if (section) section.classList.add("is-active");

    const nav = $("#nav");
    if (name === "start") nav.classList.remove("is-on");
    else nav.classList.add("is-on");

    const navName = name === "regeln" || name === "person" ? "" : name;
    $$(".nav-btn").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.nav === navName);
    });

    if (name === "kreis") renderKreis();
    if (name === "profil") renderProfil(param);
    if (name === "finder") renderFinder(param);
    if (name === "treffen") renderTreffen(param, extra);
    if (name === "person") renderPerson(param, extra);

  }

  function renderKreis() {
    const suggestions = visiblePeople().slice(0, 3);
    const box = $("#kreis-vorschlaege");
    if (!suggestions.length) {
      box.innerHTML = `<p class="empty">Gerade keine offenen Vorschläge. Im Finder siehst du den Stand.</p>`;
    } else {
      box.innerHTML = suggestions
        .map(
          (p) => `
        <button class="card card-btn" data-go="finder/${p.id}">
          <div class="row-person">
            ${avatarHtml(p, "sm")}
            <div class="person-meta">
              <div class="person-name">${p.name} <span class="chip">Beispiel</span></div>
              <div class="person-sub">${sideTags(p).join(" · ")} · ${p.space}</div>
              <div class="source-line">${sourceChip(p)}</div>
            </div>
            <div class="res-pill">${p.resonance}%</div>
          </div>
        </button>`
        )
        .join("");
    }

    const acc = state.accepted.map(personById).filter(Boolean);
    const accBox = $("#kreis-angenommen");
    if (!acc.length) {
      accBox.innerHTML = `<p class="empty">Noch niemand angenommen. Die Entscheidung liegt bei dir.</p>`;
    } else {
      accBox.innerHTML = acc
        .map((p) => {
          const level = trustOf(p.id);
          return `
        <button class="card card-btn" data-go="person/${p.id}">
          <div class="row-person">
            ${avatarHtml(p, "sm")}
            <div class="person-meta">
              <div class="person-name">${p.name} <span class="chip chip-ok">Angenommen</span></div>
              <div class="person-sub">${TRUST_LABELS[level]} · Profil ansehen</div>
            </div>
          </div>
        </button>`;
        })
        .join("");
    }

    const meetBox = $("#kreis-treffen");
    if (!state.meetings.length) {
      meetBox.innerHTML = `<p class="empty">Noch keine Anfrage. Ort und Zeit bestimmst du.</p>`;
    } else {
      meetBox.innerHTML = state.meetings
        .map((m) => {
          const p = personById(m.with);
          const status = m.confirmed
            ? (state.feedback[p.id] ? "Treffen bestätigt" : "Rückmeldung offen")
            : "Anfrage gelegt";
          const target = m.confirmed && !state.feedback[p.id] ? `treffen/feedback/${p.id}` : `person/${p.id}`;
          return `
          <button class="card card-btn" data-go="${target}">
            <div class="row-person">
              ${avatarHtml(p, "sm")}
              <div class="person-meta">
                <div class="person-name">${p.name} <span class="chip">Beispiel</span></div>
                <div class="person-sub">${m.place}<br>${m.when} · ${status}</div>
              </div>
            </div>
          </button>`;
        })
        .join("");
    }
  }

  function renderProfil(param) {
    const side = param === "mensch" ? "mensch" : param === "werte" ? "werte" : "b2b";
    $$("#screen-profil .tab").forEach((t) => {
      t.classList.toggle("is-on", t.dataset.side === side);
    });
    $("#profil-b2b").hidden = side !== "b2b";
    $("#profil-mensch").hidden = side !== "mensch";
    $("#profil-werte").hidden = side !== "werte";
    const sw = $("#dir-switch");
    if (sw) {
      sw.setAttribute("aria-checked", state.directory ? "true" : "false");
    }
    const consent = $("#dir-consent");
    if (consent) consent.classList.toggle("is-on", state.directory);
  }

  function renderFinder(param) {
    $$(".filter").forEach((f) => f.classList.toggle("is-on", f.dataset.filter === state.filter));
    const list = visiblePeople();
    const wrap = $("#finder-card");
    const empty = $("#finder-empty");

    if (!list.length) {
      wrap.hidden = true;
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    wrap.hidden = false;

    const focus = list.find((p) => p.id === param) || list[0];
    const reasonKind = focus.source === "kuratiert" ? "Begründung · kuratiert" : "KI-Begründung · simuliert";
    wrap.innerHTML = `
      <div class="match-card">
        <span class="chip">Beispielprofil</span>
        ${avatarHtml(focus, "lg")}
        <div class="person-name" style="font-size:22px">${focus.name}</div>
        <div class="person-sub">${focus.space}</div>
        <div class="match-tags">
          ${sideTags(focus).map((t) => `<span class="chip">${t}</span>`).join("")}
          ${sourceChip(focus)}
        </div>
        <div class="res-ring" style="--p:${focus.resonance}%">
          <div class="res-ring-inner">
            <b>${focus.resonance}%</b>
            <span>Resonanz</span>
          </div>
        </div>
        <p class="reason">
          <span class="reason-label"><span class="chip chip-blue">${reasonKind}</span></span>
          ${focus.reason}
        </p>
        <div class="actions">
          <button class="btn btn-ghost" data-act="decline" data-id="${focus.id}">Ablehnen</button>
          <button class="btn btn-primary" data-act="accept" data-id="${focus.id}">Annehmen</button>
        </div>
      </div>
    `;
  }

  function hideTreffenViews() {
    $("#treffen-form").hidden = true;
    $("#treffen-liste").hidden = true;
    $("#treffen-ok").hidden = true;
    $("#treffen-feedback").hidden = true;
  }

  function renderTreffen(param, extra) {
    hideTreffenViews();

    if (param === "ok") {
      $("#treffen-ok").hidden = false;
      const last = state.meetings[state.meetings.length - 1];
      const p = last ? personById(last.with) : null;
      $("#ok-text").innerHTML = p
        ? `Die Anfrage an ${p.name} ist formuliert.<br>Im Prototyp wird nichts versendet.`
        : `Die Anfrage ist formuliert.<br>Im Prototyp wird nichts versendet.`;
      return;
    }

    if (param === "feedback") {
      const id = extra;
      const p = personById(id);
      if (!p) {
        $("#treffen-liste").hidden = false;
        renderTreffenListe();
        return;
      }
      ensureMeeting(id, { confirmed: true });
      if (trustOf(id) < 2) state.trust[id] = 2;
      state.feedbackFocus = id;
      $("#treffen-feedback").hidden = false;
      $("#feedback-lead").textContent = `Zu deinem Treffen mit ${p.name} (Beispielprofil). Eine kurze Frage, keine Sterne und keine Bewertung der Person.`;
      $("#feedback-person").innerHTML = `
        ${avatarHtml(p, "sm")}
        <div class="person-meta">
          <div class="person-name">${p.name} <span class="chip">Beispiel</span></div>
          <div class="person-sub">${TRUST_LABELS[trustOf(id)]}</div>
        </div>`;
      $("#feedback-profile-link").setAttribute("data-go", "person/" + id);
      const answered = state.feedback[id];
      $("#feedback-choices").hidden = !!answered;
      $("#feedback-hint").hidden = !!answered;
      $("#feedback-done").hidden = !answered;
      if (answered) {
        const word = answered === "ja" ? "Ja" : answered === "teilweise" ? "Teilweise" : "Nein";
        $("#feedback-thanks").textContent = `Danke, du hast „${word}“ gewählt. Diese kurze Rückmeldung hilft, künftige Vorschläge zu verbessern.`;
      }
      return;
    }

    if (param && personById(param)) {
      const p = personById(param);
      $("#treffen-form").hidden = false;
      $("#treffen-titel").textContent = "Treffen vorschlagen";
      $("#treffen-lead").textContent = `An ${p.name} (Beispielprofil). Ort und Zeit bestimmst du.`;
      $("#f-with").value = p.id;
      $("#f-place").value = "Café am Fluss (Beispiel), Deggendorf";
      $("#f-when").value = "Freitag, 10 Uhr";
      $("#f-note").value = "Gern in Ruhe, ohne Druck.";
      return;
    }

    $("#treffen-liste").hidden = false;
    renderTreffenListe();
  }

  function renderTreffenListe() {
    const accepted = state.accepted.map(personById).filter(Boolean);
    const open = $("#treffen-offen");
    if (!accepted.length && !state.meetings.length) {
      open.innerHTML = `<p class="empty">Nimm zuerst jemanden im Finder an. Danach schlägst du selbst ein Treffen vor.</p>`;
      return;
    }
    const items = [];
    accepted.forEach((p) => {
      const has = meetingFor(p.id);
      if (!has) {
        items.push(`
            <button class="card card-btn" data-go="treffen/${p.id}">
              <div class="row-person">
                ${avatarHtml(p, "sm")}
                <div class="person-meta">
                  <div class="person-name">${p.name} <span class="chip">Beispiel</span></div>
                  <div class="person-sub">Noch kein Vorschlag · jetzt formulieren</div>
                </div>
              </div>
            </button>`);
      }
    });
    state.meetings.forEach((m) => {
      const p = personById(m.with);
      if (m.confirmed) {
        const fb = state.feedback[p.id];
        const sub = fb
          ? `Bestätigt · Rückmeldung: ${fb === "ja" ? "Ja" : fb === "teilweise" ? "Teilweise" : "Nein"}`
          : "Stattgefunden · Rückmeldung steht noch aus";
        const goTo = fb ? `person/${p.id}` : `treffen/feedback/${p.id}`;
        items.push(`
          <button class="card card-btn" data-go="${goTo}">
            <div class="row-person">
              ${avatarHtml(p, "sm")}
              <div class="person-meta">
                <div class="person-name">${p.name} <span class="chip chip-ok">${fb ? "Rückmeldung da" : "Treffen bestätigt"}</span></div>
                <div class="person-sub">${m.place} · ${m.when}<br>${sub}</div>
              </div>
            </div>
          </button>`);
      } else {
        items.push(`
          <div class="card">
            <div class="row-person">
              ${avatarHtml(p, "sm")}
              <div class="person-meta">
                <div class="person-name">${p.name} <span class="chip chip-ok">Anfrage gelegt</span></div>
                <div class="person-sub">${m.place} · ${m.when}</div>
              </div>
            </div>
            <button type="button" class="btn btn-primary btn-full" data-act="confirm-meet" data-id="${p.id}">Treffen hat stattgefunden</button>
            <p class="note">Nur zur Simulation im Prototyp. Danach wird die nächste Profilstufe sichtbar.</p>
          </div>`);
      }
    });
    open.innerHTML = items.join("") || `<p class="empty">Keine offenen Anfragen.</p>`;
  }

  function trustStepsHtml(level) {
    const items = [
      { n: 1, title: "Kennenlernen", text: "Basis, Name und Wirkungsraum" },
      { n: 2, title: "Nach dem Treffen", text: "Mehr zu Angebot, Suche und Begegnung" },
      { n: 3, title: "Vertrauenskreis", text: "Auch die Werte-Datei" }
    ];
    return `<div class="trust-steps" data-level="${level}">${items
      .map((it) => {
        const cls = it.n < level ? "trust-step is-done" : it.n === level ? "trust-step is-now" : "trust-step";
        return `<div class="${cls}"><span>${it.n}</span><strong>${it.title}</strong><em>${it.text}</em></div>`;
      })
      .join("")}</div>`;
  }

  function locked(text) {
    return `<div class="field is-locked"><div class="field-label">Noch nicht sichtbar</div><div class="lock-note">${text}</div></div>`;
  }

  function renderPerson(id, extra) {
    const p = personById(id);
    const page = $("#person-page");
    if (!p) {
      page.innerHTML = `<p class="empty">Dieses Beispielprofil gibt es nicht.</p>`;
      return;
    }
    applyTrustDemo(id, extra);
    const level = trustOf(id);
    const show2 = level >= 2;
    const show3 = level >= 3;

    const werteHtml = show3
      ? `<ul class="werte-list">${p.values
          .map((v) => `<li><strong>${v.title}</strong><span>${v.text}</span></li>`)
          .join("")}</ul>`
      : locked("Die Werte-Datei wird im Vertrauenskreis sichtbar. Vertrauen wächst Schritt für Schritt.");

    const detailsHtml = show2
      ? `
        <div class="field">
          <div class="field-label">Bietet</div>
          <div class="field-value">${p.offer}</div>
        </div>
        <div class="field">
          <div class="field-label">Sucht</div>
          <div class="field-value">${p.seek}</div>
        </div>
        <div class="field">
          <div class="field-label">Art der Begegnung</div>
          <div class="field-value">${p.mensch}</div>
        </div>
        <div class="field">
          <div class="field-label">Treffen</div>
          <div class="field-value">${p.meet}</div>
        </div>`
      : locked("Weitere Angaben zu Angebot, Suche und Begegnung werden nach einem bestätigten, echten Treffen sichtbar.");

    const demoBtns = [];
    if (level < 2) demoBtns.push(`<button type="button" class="btn btn-ghost btn-full" data-go="person/${p.id}/stufe2">Im Prototyp: Stufe 2 zeigen</button>`);
    if (level < 3) demoBtns.push(`<button type="button" class="btn btn-ghost btn-full" data-go="person/${p.id}/stufe3">Im Prototyp: Vertrauenskreis öffnen</button>`);

    page.innerHTML = `
      <p class="kicker">Profilansicht</p>
      <h1 class="page-title">${p.name}</h1>
      <p class="page-lead">Beispielprofil, keine echte Person. Sichtbare Teile hängen von der Vertrauensstufe ab.</p>

      <div class="card" style="margin-top:16px">
        <div class="profile-head">
          ${avatarHtml(p, "lg")}
          <div>
            <div class="person-name">${p.name} <span class="chip">Beispiel</span></div>
            <div class="person-sub">${p.space}</div>
            <div class="stage-badge"><span class="chip chip-blue">${TRUST_LABELS[level]}</span></div>
            <div class="source-line">${sourceChip(p)}</div>
          </div>
        </div>
      </div>

      <div class="card trust-card">
        <div class="field-label">Vertrauensstufe</div>
        ${trustStepsHtml(level)}
      </div>

      <div class="card">
        <div class="field">
          <div class="field-label">Wirkungsraum</div>
          <div class="field-value">${show2 ? p.b2b : p.space + ". Mehr folgt nach einem bestätigten Treffen."}</div>
        </div>
        <div class="field">
          <div class="field-label">Seiten</div>
          <div class="field-value">${sideTags(p).join(" und ")}</div>
        </div>
        ${detailsHtml}
      </div>

      <div class="card">
        <div class="field-label">Werte</div>
        ${werteHtml}
      </div>

      <div class="demo-actions">
        ${demoBtns.join("")}
        ${!meetingFor(p.id) ? `<button type="button" class="btn btn-primary btn-full" data-go="treffen/${p.id}">Treffen vorschlagen</button>` : ""}
        ${meetingFor(p.id) && !meetingFor(p.id).confirmed ? `<button type="button" class="btn btn-primary btn-full" data-act="confirm-meet" data-id="${p.id}">Treffen hat stattgefunden</button>` : ""}
        <button type="button" class="btn btn-ghost btn-full" data-go="kreis">Zurück zum Kreis</button>
      </div>
      <p class="byline page-byline">by T1T CORE</p>
    `;
  }

  function acceptPerson(id) {
    if (!state.accepted.includes(id)) state.accepted.push(id);
    state.declined = state.declined.filter((x) => x !== id);
    if (!state.trust[id]) state.trust[id] = 1;
    const p = personById(id);
    showToast(`${p.name} ist in deinem Kreis. Als Nächstes kannst du ein Treffen vorschlagen.`);
    go("treffen/" + id);
  }

  function declinePerson(id) {
    if (!state.declined.includes(id)) state.declined.push(id);
    showToast("Abgelehnt. Die nächste Karte wartet, wenn es eine gibt.");
    go("finder");
  }

  function confirmMeet(id) {
    const m = ensureMeeting(id, { confirmed: true });
    if (trustOf(id) < 2) state.trust[id] = 2;
    const p = personById(id);
    showToast(`Treffen mit ${p.name} ist bestätigt. ${m.place} bleibt nur ein Beispiel. Die nächste Profilstufe ist offen.`);
    go("treffen/feedback/" + id);
  }

  function saveFeedback(id, value) {
    state.feedback[id] = value;
    const word = value === "ja" ? "Ja" : value === "teilweise" ? "Teilweise" : "Nein";
    showToast(`Danke für „${word}“. Das verbessert später die Vorschläge.`);
    render();
  }

  function toggleDirectory() {
    state.directory = !state.directory;
    if (state.directory) {
      showToast("Zustimmung vermerkt. Im Prototyp wird nichts ins Verzeichnis übertragen.");
    } else {
      showToast("Dein B2B-Profil ist nicht für das Verzeichnis vorgesehen.");
    }
    render();
  }

  document.addEventListener("click", (e) => {
    const start = e.target.closest("#screen-start");
    if (start && $("#screen-start").classList.contains("is-active")) {
      go("kreis");
      return;
    }

    const nav = e.target.closest("[data-nav]");
    if (nav) {
      go(nav.dataset.nav);
      return;
    }

    const link = e.target.closest("[data-go]");
    if (link) {
      go(link.dataset.go);
      return;
    }

    const filter = e.target.closest("[data-filter]");
    if (filter) {
      state.filter = filter.dataset.filter;
      render();
      return;
    }

    const tab = e.target.closest("[data-side]");
    if (tab) {
      const side = tab.dataset.side;
      go(side === "mensch" ? "profil/mensch" : side === "werte" ? "profil/werte" : "profil");
      return;
    }

    const act = e.target.closest("[data-act]");
    if (act) {
      if (act.dataset.act === "accept") acceptPerson(act.dataset.id);
      if (act.dataset.act === "decline") declinePerson(act.dataset.id);
      if (act.dataset.act === "confirm-meet") confirmMeet(act.dataset.id);
      if (act.dataset.act === "feedback") saveFeedback(state.feedbackFocus || act.dataset.id, act.dataset.value);
      if (act.dataset.act === "directory") toggleDirectory();
    }
  });

  $("#treffen-form-el").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = $("#f-with").value;
    const existing = meetingFor(id);
    if (existing) {
      existing.place = $("#f-place").value.trim() || "Ort folgt";
      existing.when = $("#f-when").value.trim() || "Zeit folgt";
      existing.note = $("#f-note").value.trim();
    } else {
      state.meetings.push({
        with: id,
        place: $("#f-place").value.trim() || "Ort folgt",
        when: $("#f-when").value.trim() || "Zeit folgt",
        note: $("#f-note").value.trim(),
        confirmed: false
      });
    }
    go("treffen/ok");
  });

  window.addEventListener("hashchange", render);

  if (!location.hash) location.hash = "#/start";
  else render();

})();
