/* screens.jsx — Accueil (créer / rejoindre) + Aperçu du compte-rendu */

/* ============================================================
   ACCUEIL
   ============================================================ */
function HomeScreen({ onCreate, onJoinDemo }) {
  const [mode, setMode] = React.useState(null); // null | create | join
  const [name, setName] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [code, setCode] = React.useState("");

  // à l'arrivée sur « Rejoindre », on pré-remplit un pseudo rigolo
  React.useEffect(() => {
    if (mode === "join" && !name.trim()) setName(randomFunny());
  }, [mode]);

  // post-its décoratifs
  const deco = [
    { hex: "#ffe08a", t: "CI trop lente", rot: -7, top: "14%", left: "7%", s: 1 },
    { hex: "#ffb1a0", t: "Super démo 🎉", rot: 6, top: "60%", left: "11%", s: .92 },
    { hex: "#a9d6ff", t: "Pairing ?", rot: -4, top: "20%", right: "9%", s: .86 },
    { hex: "#b3ecc6", t: "Bonne ambiance 💪", rot: 8, top: "63%", right: "8%", s: 1 },
    { hex: "#d6c4ff", t: "Doc déploiement", rot: -10, top: "82%", left: "44%", s: .8 },
  ];

  return (
    <div className="app" style={{ overflow: "hidden", position: "relative" }}>
      {/* déco */}
      {deco.map((d, i) => (
        <div key={i} className="postit" style={{
          "--pi": d.hex, position: "absolute", top: d.top, left: d.left, right: d.right,
          transform: `rotate(${d.rot}deg) scale(${d.s})`, width: 150,
          fontSize: "1.15rem", pointerEvents: "none", opacity: .92,
          display: window.innerWidth < 980 ? "none" : "block",
        }}>{d.t}</div>
      ))}

      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 24, position: "relative", zIndex: 2 }}>
        <div style={{ width: "min(480px, 100%)", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 22,
          }}>
            <Brandmark size={46} />
            <span style={{ fontFamily: '"Bricolage Grotesque",sans-serif', fontWeight: 800, fontSize: "2rem", letterSpacing: "-.02em" }}>RETEX</span>
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.9rem)", lineHeight: 1.04, marginBottom: 14 }}>
            Vos rétrospectives,<br />en post-its partagés.
          </h1>
          <p style={{ color: "var(--ink-2)", fontSize: "1.08rem", lineHeight: 1.5, maxWidth: 380, margin: "0 auto 30px" }}>
            L'animateur ouvre une session, l'équipe dépose ses notes à l'abri des regards,
            puis on révèle tout ensemble. Et on trace la réunion par mail.
          </p>

          {mode === null && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 340, margin: "0 auto" }}>
              <button className="btn btn--primary btn--lg" onClick={() => setMode("create")}>
                <Icon name="plus" size={20} /> Ouvrir une session
              </button>
              <button className="btn btn--lg" onClick={() => setMode("join")}>
                <Icon name="users" size={20} /> Rejoindre avec un code
              </button>
              <button className="btn btn--ghost btn--sm" onClick={onJoinDemo} style={{ marginTop: 4 }}>
                <Icon name="sparkle" size={16} /> Voir une session de démonstration
              </button>
            </div>
          )}

          {mode === "create" && (
            <div className="card" style={{ padding: 24, textAlign: "left", maxWidth: 380, margin: "0 auto" }}>
              <FieldLabel>Titre de la rétro</FieldLabel>
              <input className="field" value={title} onChange={e => setTitle(e.target.value)}
                     placeholder="ex. Rétro — Sprint 24" />
              <div style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 6 }}>Nommez votre sprint ou itération — modifiable à tout moment.</div>
              <div style={{ height: 14 }} />
              <FieldLabel>Votre prénom (animateur)</FieldLabel>
              <input className="field" value={name} onChange={e => setName(e.target.value)}
                     placeholder="Camille" onKeyDown={e => e.key === "Enter" && name.trim() && onCreate(name, title)} />
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button className="btn btn--ghost" onClick={() => setMode(null)}>Retour</button>
                <span style={{ flex: 1 }} />
                <button className="btn btn--primary" disabled={!name.trim()} onClick={() => onCreate(name, title)}>
                  Créer la session <Icon name="arrowRight" size={18} />
                </button>
              </div>
            </div>
          )}

          {mode === "join" && (
            <div className="card" style={{ padding: 24, textAlign: "left", maxWidth: 380, margin: "0 auto" }}>
              <FieldLabel>Code de session</FieldLabel>
              <input className="field" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                     placeholder="ABC-123" style={{ fontFamily: '"Bricolage Grotesque",sans-serif', letterSpacing: ".1em", fontWeight: 700 }} />
              <div style={{ height: 14 }} />
              <FieldLabel>Votre pseudo</FieldLabel>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="field" value={name} onChange={e => setName(e.target.value)} placeholder="Licorne Agile" />
                <button className="btn" title="Autre pseudo" onClick={() => setName(randomFunny(name))}
                  style={{ flex: "0 0 auto", padding: "0 14px", fontSize: "1.2rem" }}>🎲</button>
              </div>
              <p style={{ fontSize: ".82rem", color: "var(--muted)", marginTop: 8, marginBottom: 0 }}>
                Un pseudo rigolo est déjà choisi pour vous — gardez l'anonymat ou mettez votre vrai prénom.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button className="btn btn--ghost" onClick={() => setMode(null)}>Retour</button>
                <span style={{ flex: 1 }} />
                <button className="btn btn--primary" onClick={() => onJoinDemo(name)}>
                  Rejoindre <Icon name="arrowRight" size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }) {
  return <label style={{ display: "block", fontSize: ".82rem", fontWeight: 700, color: "var(--ink-2)", marginBottom: 7, fontFamily: '"Bricolage Grotesque",sans-serif' }}>{children}</label>;
}

/* Logo : pile de post-its */
function Brandmark({ size = 40 }) {
  return (
    <span style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
      <span style={{ position: "absolute", inset: 0, background: "#ffd166", borderRadius: size * .18, transform: "rotate(-12deg)", boxShadow: "0 2px 6px rgba(0,0,0,.18)" }} />
      <span style={{ position: "absolute", inset: 0, background: "#06d6a0", borderRadius: size * .18, transform: "rotate(-2deg)", boxShadow: "0 2px 6px rgba(0,0,0,.18)" }} />
      <span style={{ position: "absolute", inset: 0, background: "var(--brand)", borderRadius: size * .18, transform: "rotate(8deg)", boxShadow: "0 3px 8px rgba(0,0,0,.22)", display: "grid", placeItems: "center" }}>
        <span style={{ color: "#fff", fontFamily: '"Bricolage Grotesque",sans-serif', fontWeight: 800, fontSize: size * .5 }}>R</span>
      </span>
    </span>
  );
}

/* ============================================================
   APERÇU DU COMPTE-RENDU (export)
   ============================================================ */
function ReportPreview({ session, colorsById, onClose, onDownload }) {
  const fmtDate = new Date(session.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const usersById = Object.fromEntries(session.participants.map(u => [u.id, u]));

  // groupes
  const groupsFor = (colId) => {
    const notes = session.postits.filter(p => p.columnId === colId);
    const map = new Map();
    const singles = [];
    notes.forEach(n => {
      if (n.groupId) {
        if (!map.has(n.groupId)) map.set(n.groupId, []);
        map.get(n.groupId).push(n);
      } else singles.push(n);
    });
    const clusters = [...map.values()].map(arr => ({ notes: arr, votes: arr.reduce((s, x) => s + x.votes.length, 0) }));
    const solo = singles.map(n => ({ notes: [n], votes: n.votes.length }));
    return [...clusters, ...solo].sort((a, b) => b.votes - a.votes);
  };

  const totalVotes = session.postits.reduce((s, p) => s + p.votes.length, 0);

  return (
    <Modal onClose={onClose} width="min(820px, 100%)">
      <div style={{ position: "sticky", top: 0, background: "var(--surface)", zIndex: 3,
        padding: "18px 26px", borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "center", gap: 12 }}>
        <Icon name="mail" size={22} />
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "1.15rem" }}>Compte-rendu de la rétro</h3>
          <div style={{ fontSize: ".82rem", color: "var(--muted)" }}>Aperçu avant export — prêt à tracer par mail</div>
        </div>
        <button className="btn btn--sm" onClick={onClose}>Fermer</button>
        <button className="btn btn--sm btn--primary" onClick={onDownload}>
          <Icon name="download" size={16} /> Télécharger le PDF
        </button>
      </div>

      {/* Le document imprimable */}
      <div id="retex-report" style={{ padding: "30px 34px 40px" }}>
        <ReportDoc session={session} colorsById={colorsById} usersById={usersById}
                   fmtDate={fmtDate} totalVotes={totalVotes} groupsFor={groupsFor} />
      </div>
    </Modal>
  );
}

/* Le document seul (réutilisé pour l'impression) */
function ReportDoc({ session, colorsById, usersById, fmtDate, totalVotes, groupsFor }) {
  return (
    <div className="report-doc" style={{ color: "var(--ink)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 6 }}>
        <Brandmark size={38} />
        <div>
          <h1 style={{ fontSize: "1.7rem", lineHeight: 1.1 }}>{session.title}</h1>
          <div style={{ color: "var(--muted)", fontSize: ".92rem", marginTop: 3 }}>
            Rétrospective · {fmtDate} · code {session.code}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", margin: "16px 0 8px",
        padding: "12px 16px", background: "var(--surface-2)", borderRadius: 14 }}>
        <Stat n={session.participants.length} label="participants" />
        <Stat n={session.postits.length} label="notes" />
        <Stat n={totalVotes} label="votes" />
        <Stat n={session.columns.length} label="thèmes" />
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {session.participants.map(u => <Avatar key={u.id} user={u} size={28} showStar={false} />)}
        </div>
      </div>

      {session.columns.map(col => {
        const clusters = groupsFor(col.id);
        if (!clusters.length) return null;
        return (
          <div key={col.id} style={{ marginTop: 26, breakInside: "avoid" }}>
            <h2 style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: 8,
              paddingBottom: 8, borderBottom: `2px solid ${col.accent}` }}>
              <span>{col.emoji}</span> {col.name}
              <span style={{ color: "var(--muted)", fontWeight: 500, fontSize: ".9rem" }}>· {clusters.reduce((s,c)=>s+c.notes.length,0)} notes</span>
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
              {clusters.map((cl, i) => (
                <li key={i} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--line)", breakInside: "avoid" }}>
                  <span style={{
                    flex: "0 0 auto", minWidth: 34, height: 26, padding: "0 9px", borderRadius: 999,
                    background: cl.votes > 0 ? col.accent : "var(--surface-2)",
                    color: cl.votes > 0 ? "#fff" : "var(--muted)",
                    fontFamily: '"Bricolage Grotesque",sans-serif', fontWeight: 700, fontSize: ".82rem",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 3,
                  }}>{cl.votes}♥</span>
                  <div style={{ flex: 1 }}>
                    {cl.notes.map((n, j) => (
                      <div key={n.id} style={{ marginBottom: j < cl.notes.length - 1 ? 5 : 0 }}>
                        <span style={{ fontSize: "1rem" }}>{n.text}</span>
                        <span style={{ color: "var(--muted)", fontSize: ".82rem", marginLeft: 7 }}>
                          — {n.anon ? "anonyme" : (usersById[n.authorId] ? usersById[n.authorId].name : "anonyme")}
                        </span>
                      </div>
                    ))}
                    {cl.notes.length > 1 && (
                      <div style={{ fontSize: ".74rem", color: "var(--muted)", marginTop: 3, fontWeight: 600 }}>
                        ◦ groupe de {cl.notes.length} notes
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid var(--line)", color: "var(--muted)", fontSize: ".8rem" }}>
        Généré avec RETEX · {new Date().toLocaleString("fr-FR")}
      </div>
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: '"Bricolage Grotesque",sans-serif', fontWeight: 800, fontSize: "1.5rem", lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: ".74rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", marginTop: 3 }}>{label}</div>
    </div>
  );
}

Object.assign(window, { HomeScreen, Brandmark, ReportPreview, ReportDoc, Stat });
