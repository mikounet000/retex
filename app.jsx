/* app.jsx — racine : état, persistence, actions, tweaks, export */

const LS_KEY = "retex_session_v1";

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "brand": "#F0563B",
  "postitFont": "hand",
  "density": "confort"
}/*EDITMODE-END*/;

const FONTS = {
  hand: '"Caveat", "Bricolage Grotesque", cursive',
  net: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
};
const SIZES = { compact: "1.05rem", confort: "1.32rem" };
const WEIGHTS = { hand: 600, net: 600 };

function loadSession() {
  try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function persist(s) {
  try { if (s) localStorage.setItem(LS_KEY, JSON.stringify(s)); else localStorage.removeItem(LS_KEY); } catch {}
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [session, setSession] = React.useState(() => loadSession());
  const [reportOpen, setReportOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const colorsById = React.useMemo(() => Object.fromEntries(POSTIT_COLORS.map(c => [c.id, c])), []);

  // ---- application des tweaks ----
  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", t.theme === "dark" ? "dark" : "light");
    root.style.setProperty("--brand", t.brand);
    root.style.setProperty("--postit-font", FONTS[t.postitFont] || FONTS.hand);
    root.style.setProperty("--postit-size", SIZES[t.density] || SIZES.confort);
    root.style.setProperty("--postit-weight", WEIGHTS[t.postitFont] || 600);
  }, [t]);

  const update = React.useCallback((fn) => {
    setSession(prev => { if (!prev) return prev; const next = fn(structuredClone(prev)); persist(next); return next; });
  }, []);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  // ---- simulation : coéquipiers qui écrivent ----
  React.useEffect(() => {
    if (!session || !session.simulate) return;
    const i = setInterval(() => {
      update(s => {
        if (!s.simulate) return s;
        const others = s.participants.filter(u => !u.isAdmin);
        if (!others.length) return s;
        const col = s.columns[Math.floor(Math.random() * s.columns.length)];
        const pool = SIM_NOTES[col.name] || SIM_NOTES.Mood;
        const text = pool[Math.floor(Math.random() * pool.length)];
        const author = others[Math.floor(Math.random() * others.length)];
        const id = uid("p");
        s.postits.push({
          id, columnId: col.id, authorId: author.id, text,
          colorId: POSTIT_COLORS[Math.floor(Math.random() * POSTIT_COLORS.length)].id,
          votes: [], revealed: s.phase === "revue", groupId: null, tilt: tiltFor(id),
        });
        if (s.postits.filter(p => !p.revealed).length > 14) s.simulate = false; // borne
        return s;
      });
    }, 3200);
    return () => clearInterval(i);
  }, [session && session.simulate, update]);

  if (!session) {
    return (
      <>
        <HomeScreen
          onCreate={(name, title) => { const s = makeFreshSession(name); s.title = (title && title.trim()) || "Rétro — Sprint 24"; persist(s); setSession(s); }}
          onJoinDemo={(name) => {
            const s = makeDemoSession();
            if (name && name.trim()) {
              const u = makeParticipant(name.trim(), false, s.participants.length);
              s.participants.push(u);
              s.currentUserId = u.id;
            }
            persist(s); setSession(s);
          }} />
        <TweaksUI t={t} setTweak={setTweak} />
      </>
    );
  }

  const currentUser = session.participants.find(u => u.id === session.currentUserId) || session.participants[0];
  const isAdmin = currentUser.id === session.adminId;

  // ---- actions ----
  const actions = {
    addNote: (columnId, text, colorId, anon) => update(s => {
      const id = uid("p");
      s.postits.push({ id, columnId, authorId: currentUser.id, text, colorId, anon: !!anon,
        votes: [], revealed: s.phase === "revue", groupId: null, tilt: tiltFor(id) });
      return s;
    }),
    vote: (noteId) => update(s => {
      const n = s.postits.find(p => p.id === noteId); if (!n) return s;
      const i = n.votes.indexOf(currentUser.id);
      if (i >= 0) n.votes.splice(i, 1); else n.votes.push(currentUser.id);
      return s;
    }),
    revealOne: (noteId) => update(s => { const n = s.postits.find(p => p.id === noteId); if (n) n.revealed = true; return s; }),
    revealAll: () => { update(s => { s.postits.forEach(p => p.revealed = true); s.phase = "revue"; return s; }); flash("Toutes les notes sont révélées ✨"); },
    hideAll: () => { update(s => { s.postits.forEach(p => p.revealed = false); s.phase = "collecte"; return s; }); flash("Notes masquées — phase de collecte"); },
    setPhase: (phase) => update(s => { s.phase = phase; if (phase === "revue") s.postits.forEach(p => p.revealed = true); return s; }),
    deleteNote: (noteId) => update(s => { s.postits = s.postits.filter(p => p.id !== noteId); return s; }),
    moveNote: (id, colId) => update(s => { const n = s.postits.find(p => p.id === id); if (n) { n.columnId = colId; n.groupId = null; } return s; }),
    groupNotes: (sourceId, targetId) => update(s => {
      const src = s.postits.find(p => p.id === sourceId), tgt = s.postits.find(p => p.id === targetId);
      if (!src || !tgt) return s;
      src.columnId = tgt.columnId;
      if (tgt.groupId) src.groupId = tgt.groupId;
      else { const g = uid("g"); tgt.groupId = g; src.groupId = g; }
      return s;
    }),
    addToGroup: (sourceId, groupId) => update(s => {
      const src = s.postits.find(p => p.id === sourceId);
      const any = s.postits.find(p => p.groupId === groupId);
      if (src && any) { src.groupId = groupId; src.columnId = any.columnId; }
      return s;
    }),
    ungroup: (groupId) => update(s => { s.postits.forEach(p => { if (p.groupId === groupId) p.groupId = null; }); return s; }),
    renameColumn: (colId, name) => update(s => { const c = s.columns.find(x => x.id === colId); if (c) c.name = name; return s; }),
    renameSession: (title) => update(s => { s.title = title; return s; }),
    addColumn: () => update(s => {
      const accents = ["#7A5AE0", "#E8A317", "#C0457A", "#3A7BD5", "#4A9E5C"];
      const emojis = ["💡", "🚀", "⚠️", "🎯", "🤝"];
      const k = s.columns.length;
      s.columns.push({ id: uid("col"), name: "Nouveau thème", emoji: emojis[k % emojis.length], accent: accents[k % accents.length] });
      return s;
    }),
    deleteColumn: (colId) => update(s => {
      s.columns = s.columns.filter(c => c.id !== colId);
      s.postits = s.postits.filter(p => p.columnId !== colId);
      return s;
    }),
    switchUser: (userId) => update(s => { s.currentUserId = userId; return s; }),
    addDemoTeam: () => { update(s => {
      const names = ["Yanis", "Léa", "Maxime", "Sofia", "Théo"];
      names.forEach((nm, i) => { if (!s.participants.some(u => u.name === nm)) s.participants.push(makeParticipant(nm, false, i + 1)); });
      return s;
    }); flash("Coéquipiers de démo ajoutés"); },
    copyCode: () => { try { navigator.clipboard.writeText(session.code); flash("Code copié : " + session.code); } catch { flash("Code : " + session.code); } },
    resetSession: () => { if (confirm("Réinitialiser et revenir à l'accueil ?")) { persist(null); setSession(null); } },
    endSession: () => { if (confirm("Terminer la session ? Les notes seront toutes révélées et figées.")) { update(s => { s.postits.forEach(p => p.revealed = true); s.phase = "clos"; s.timer.running = false; return s; }); flash("Session terminée — pensez à exporter ✦"); } },
    newSession: () => { persist(null); setSession(null); },
    openReport: () => setReportOpen(true),
    toggleSimulate: () => update(s => { s.simulate = !s.simulate; return s; }),
    startTimer: () => update(s => { const rem = s.timer._remainMs != null ? s.timer._remainMs : s.timer.durationMin * 60000; s.timer.endsAt = Date.now() + rem; s.timer.running = true; s.timer._remainMs = null; return s; }),
    pauseTimer: () => update(s => { s.timer._remainMs = Math.max(0, (s.timer.endsAt || Date.now()) - Date.now()); s.timer.running = false; return s; }),
    setTimerDuration: (m) => update(s => { s.timer.durationMin = m; s.timer.running = false; s.timer.endsAt = null; s.timer._remainMs = m * 60000; return s; }),
  };

  const downloadPDF = () => {
    document.body.classList.add("printing");
    setTimeout(() => { window.print(); setTimeout(() => document.body.classList.remove("printing"), 400); }, 60);
  };

  return (
    <>
      <Board session={session} isAdmin={isAdmin} currentUser={currentUser} colorsById={colorsById} actions={actions} />

      {reportOpen && (
        <ReportPreview session={session} colorsById={colorsById}
          onClose={() => setReportOpen(false)} onDownload={downloadPDF} />
      )}

      {/* zone imprimable (cachée hors impression) */}
      <div id="print-root">
        <ReportDoc session={session} colorsById={colorsById}
          usersById={Object.fromEntries(session.participants.map(u => [u.id, u]))}
          fmtDate={new Date(session.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          totalVotes={session.postits.reduce((a, p) => a + p.votes.length, 0)}
          groupsFor={(colId) => {
            const notes = session.postits.filter(p => p.columnId === colId);
            const map = new Map(); const singles = [];
            notes.forEach(n => { if (n.groupId) { if (!map.has(n.groupId)) map.set(n.groupId, []); map.get(n.groupId).push(n); } else singles.push(n); });
            const clusters = [...map.values()].map(arr => ({ notes: arr, votes: arr.reduce((x, y) => x + y.votes.length, 0) }));
            const solo = singles.map(n => ({ notes: [n], votes: n.votes.length }));
            return [...clusters, ...solo].sort((a, b) => b.votes - a.votes);
          }} />
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", zIndex: 500,
          background: "var(--ink)", color: "var(--bg)", padding: "11px 18px", borderRadius: 999,
          fontFamily: '"Bricolage Grotesque",sans-serif', fontWeight: 600, fontSize: ".9rem",
          boxShadow: "0 14px 40px -10px rgba(0,0,0,.5)", animation: "pop .25s var(--ease)" }}>
          {toast}
        </div>
      )}

      <TweaksUI t={t} setTweak={setTweak} />
    </>
  );
}

/* ---- Panneau de réglages ---- */
function TweaksUI({ t, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Thème" />
      <TweakRadio label="Apparence" value={t.theme} options={[{ value: "light", label: "Clair" }, { value: "dark", label: "Sombre" }]}
        onChange={v => setTweak("theme", v)} />
      <TweakColor label="Couleur d'accent" value={t.brand}
        options={["#F0563B", "#2E8B8B", "#7A5AE0", "#E8A317", "#C0457A"]}
        onChange={v => setTweak("brand", v)} />
      <TweakSection label="Post-its" />
      <TweakRadio label="Écriture" value={t.postitFont} options={[{ value: "hand", label: "Manuscrit" }, { value: "net", label: "Net" }]}
        onChange={v => setTweak("postitFont", v)} />
      <TweakRadio label="Densité" value={t.density} options={[{ value: "compact", label: "Compact" }, { value: "confort", label: "Confort" }]}
        onChange={v => setTweak("density", v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
