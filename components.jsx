/* components.jsx — primitives UI partagées (exportées sur window) */

/* ---------------- Icônes (SVG inline) ---------------- */
function Icon({ name, size = 20, stroke = 2, ...rest }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round",
    strokeLinejoin: "round", ...rest,
  };
  const P = {
    plus: <path d="M12 5v14M5 12h14" />,
    check: <path d="M20 6L9 17l-5-5" />,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="M3 3l18 18" /><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.3 4.1M6.6 6.6A17.6 17.6 0 0 0 2 12s3.5 7 10 7a10.7 10.7 0 0 0 4.2-.8" /><path d="M9.5 9.6a3 3 0 0 0 4.2 4.3" /></>,
    timer: <><circle cx="12" cy="13" r="8" /><path d="M12 13V9M9 2h6M5.2 6.2 3.5 4.5" /></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M5 21h14" /></>,
    users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.2a3.2 3.2 0 0 1 0 6M21 20a6 6 0 0 0-5-5.9" /></>,
    chevron: <path d="M6 9l6 6 6-6" />,
    chevronUp: <path d="M6 15l6-6 6 6" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
    layers: <><path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="m3 13 9 5 9-5M3 18l9 5 9-5" /></>,
    sparkle: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4" />,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></>,
    play: <path d="M7 5l12 7-12 7V5Z" />,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    flag: <><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></>,
    ungroup: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></>,
    arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  };
  return <svg {...common} aria-hidden="true">{P[name] || null}</svg>;
}

/* ---------------- Avatar ---------------- */
function Avatar({ user, size = 34, showStar = true, fresh = false }) {
  const initials = user.name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className={"avatar" + (fresh ? " avatar--fresh" : "")}
         title={user.name + (user.isAdmin ? " · animateur" : "")}
         style={{ "--sz": size + "px", background: user.color, position: "relative" }}>
      {initials}
      {showStar && user.isAdmin && (
        <span style={{
          position: "absolute", top: -3, right: -3, width: size * .5, height: size * .5,
          background: "#fff", borderRadius: "50%", display: "grid", placeItems: "center",
          fontSize: size * .3, boxShadow: "0 1px 3px rgba(0,0,0,.3)",
        }}>👑</span>
      )}
    </div>
  );
}

function AvatarStack({ users, size = 32, max = 6, freshIds }) {
  // Les arrivants récents passent en tête de pile pour rester visibles
  const ordered = freshIds && freshIds.size > 0
    ? [...users].sort((a, b) => (freshIds.has(b.id) ? 1 : 0) - (freshIds.has(a.id) ? 1 : 0))
    : users;
  const shown = ordered.slice(0, max);
  const extra = ordered.length - shown.length;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {shown.map((u, i) => (
        <div key={u.id} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: shown.length - i }}>
          <Avatar user={u} size={size} fresh={freshIds && freshIds.has(u.id)} />
        </div>
      ))}
      {extra > 0 && (
        <div className="avatar" style={{
          "--sz": size + "px", marginLeft: -10, background: "var(--surface-2)",
          color: "var(--ink-2)", fontSize: size * .34,
        }}>+{extra}</div>
      )}
    </div>
  );
}

/* ---------------- Post-it ---------------- */
function PostIt({ note, color, author, canSee, isMine, currentUser, isAdmin,
                  onVote, onReveal, onEdit, onDelete, onDragStart, dragging,
                  onDropOnto, groupCount }) {
  const [revealing, setRevealing] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(note.text);
  const taRef = React.useRef(null);
  const hidden = !canSee;
  const voted = note.votes.includes(currentUser.id);
  const tilt = note.tilt || 0;
  const canEdit = isMine && !hidden && onEdit;

  React.useEffect(() => { if (!editing) setDraft(note.text); }, [note.text, editing]);
  React.useEffect(() => {
    if (editing && taRef.current) {
      taRef.current.focus();
      taRef.current.setSelectionRange(taRef.current.value.length, taRef.current.value.length);
    }
  }, [editing]);

  const startEdit = (e) => {
    if (!canEdit) return;
    e && e.stopPropagation();
    setDraft(note.text);
    setEditing(true);
  };
  const commitEdit = () => {
    const v = draft.trim();
    if (v && v !== note.text) onEdit(note.id, v);
    setEditing(false);
  };
  const cancelEdit = () => { setDraft(note.text); setEditing(false); };

  const handleClick = () => {
    if (editing) return;
    if (hidden && isAdmin && onReveal) {
      setRevealing(true);
      onReveal(note.id);
      setTimeout(() => setRevealing(false), 460);
    }
  };

  return (
    <div
      className={
        "postit" +
        (hidden ? " postit--hidden" : "") +
        (hidden && isAdmin ? " postit--clickable" : "") +
        (revealing ? " postit--revealing" : "")
      }
      style={{
        "--pi": color.hex,
        transform: editing ? "rotate(0deg)" : `rotate(${tilt}deg)`,
        opacity: dragging ? .4 : 1,
        cursor: editing ? "text" : undefined,
        zIndex: editing ? 10 : undefined,
      }}
      onClick={handleClick}
      onDoubleClick={canEdit && !editing ? startEdit : undefined}
      draggable={isAdmin && !hidden && !editing}
      onDragStart={(e) => onDragStart && onDragStart(e, note)}
      onDragOver={(e) => { if (isAdmin && !hidden) e.preventDefault(); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDropOnto && onDropOnto(note); }}
      title={hidden && isAdmin ? "Cliquez pour révéler" : (canEdit ? "Double-cliquez pour modifier" : "")}
    >
      {groupCount > 1 && (
        <div style={{
          position: "absolute", top: -10, right: -8, background: "#3a3220", color: "#fff",
          fontFamily: '"Plus Jakarta Sans",sans-serif', fontWeight: 700, fontSize: ".72rem",
          padding: "2px 8px", borderRadius: 999, boxShadow: "0 2px 6px rgba(0,0,0,.3)",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <span style={{ display: "inline-flex" }}><Icon name="layers" size={12} /></span>{groupCount}
        </div>
      )}

      {hidden ? (
        <div style={{ minHeight: 64, display: "grid", placeItems: "center" }}>
          <div style={{
            fontFamily: '"Plus Jakarta Sans",sans-serif', fontWeight: 700, fontSize: ".74rem",
            color: "rgba(40,34,18,.5)", letterSpacing: ".04em", textAlign: "center",
            visibility: "visible",
          }}>
            {isAdmin ? "À RÉVÉLER" : (isMine ? "VOTRE NOTE" : "EN ATTENTE")}
          </div>
        </div>
      ) : editing ? (
        <>
          <textarea
            ref={taRef}
            value={draft}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commitEdit(); }
              if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
            }}
            rows={Math.max(3, Math.min(8, draft.split("\n").length + 1))}
            style={{
              width: "100%", border: "none", outline: "none", resize: "none",
              background: "transparent", color: "#3a3220",
              fontFamily: "var(--postit-font)", fontSize: "var(--postit-size)",
              lineHeight: "var(--postit-line)", fontWeight: "var(--postit-weight)",
            }}
          />
          <div className="postit__foot">
            <span style={{ fontSize: ".72rem", color: "rgba(40,34,18,.55)", fontFamily: '"Plus Jakarta Sans",sans-serif', fontWeight: 600 }}>
              ⌘+↵ pour enregistrer · Échap pour annuler
            </span>
            <span className="postit__spacer" />
            <button className="btn btn--sm" onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
              style={{ background: "rgba(255,255,255,.6)" }}>Annuler</button>
            <button className="btn btn--sm btn--primary" onClick={(e) => { e.stopPropagation(); commitEdit(); }}>
              Enregistrer
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="postit__text">{note.text}</div>
          <div className="postit__foot">
            {note.anon ? (
              <span className="postit__author" style={{ fontStyle: "italic" }}>— Anonyme{isMine ? " (vous)" : ""}</span>
            ) : author ? (
              <span className="postit__author">— {author.name}{isMine ? " (vous)" : ""}</span>
            ) : null}
            <span className="postit__spacer" />
            <button className="vote" data-voted={voted ? "1" : "0"}
                    onClick={(e) => { e.stopPropagation(); onVote && onVote(note.id); }}
                    title="Voter">
              <span style={{ display: "inline-flex" }}><Icon name="check" size={13} stroke={3} /></span>
              {note.votes.length}
            </button>
            {canEdit && (
              <button className="icon-btn" style={{ width: 26, height: 26, color: "rgba(40,34,18,.55)" }}
                      onClick={startEdit}
                      title="Modifier ma note">
                <Icon name="edit" size={13} />
              </button>
            )}
            {isAdmin && (
              <button className="icon-btn" style={{ width: 26, height: 26, color: "rgba(40,34,18,.55)" }}
                      onClick={(e) => { e.stopPropagation(); onDelete && onDelete(note.id); }}
                      title="Supprimer">
                <Icon name="trash" size={14} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Composer (ajout de note) ---------------- */
function Composer({ colors, defaultColorId, onAdd, onCancel }) {
  const [text, setText] = React.useState("");
  const [colorId, setColorId] = React.useState(defaultColorId || colors[0].id);
  const [anon, setAnon] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => { ref.current && ref.current.focus(); }, []);

  const submit = () => {
    const t = text.trim();
    if (!t) { onCancel && onCancel(); return; }
    onAdd(t, colorId, anon);
    setText("");
  };
  const color = colors.find(c => c.id === colorId) || colors[0];

  return (
    <div className="postit" style={{ "--pi": color.hex, transform: "rotate(0deg)", cursor: "text" }}>
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); }
          if (e.key === "Escape") onCancel && onCancel();
        }}
        placeholder={anon ? "Votre note (anonyme)…" : "Votre note…"}
        rows={3}
        style={{
          width: "100%", border: "none", outline: "none", resize: "none",
          background: "transparent", color: "#3a3220",
          fontFamily: "var(--postit-font)", fontSize: "var(--postit-size)",
          lineHeight: "var(--postit-line)", fontWeight: "var(--postit-weight)",
        }}
      />
      <button onClick={() => setAnon(a => !a)} title="Publier sans afficher votre nom"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6,
          border: "none", cursor: "pointer", borderRadius: 999, padding: "4px 10px",
          fontFamily: '"Plus Jakarta Sans",sans-serif', fontWeight: 700, fontSize: ".74rem",
          background: anon ? "#3a3220" : "rgba(58,50,32,.10)",
          color: anon ? "#fff" : "rgba(40,34,18,.7)",
        }}>
        <Icon name={anon ? "eyeOff" : "eye"} size={13} />
        {anon ? "Anonyme" : "Signer de mon nom"}
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {colors.map(c => (
            <button key={c.id} onClick={() => setColorId(c.id)} title={c.name}
                    style={{
                      width: 19, height: 19, borderRadius: "50%", background: c.hex,
                      border: colorId === c.id ? "2.5px solid #3a3220" : "2px solid rgba(0,0,0,.12)",
                      cursor: "pointer", padding: 0,
                    }} />
          ))}
        </div>
        <span className="postit__spacer" />
        <button className="btn btn--sm" onClick={onCancel} style={{ background: "rgba(255,255,255,.6)" }}>Annuler</button>
        <button className="btn btn--sm btn--primary" onClick={submit}>Ajouter</button>
      </div>
    </div>
  );
}

/* ---------------- Modale ---------------- */
function Modal({ children, onClose, width }) {
  React.useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal scroll" style={width ? { width } : null} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ---------------- Menu déroulant simple ---------------- */
function Dropdown({ trigger, children, align = "left", width = 240 }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div className="card scroll" style={{
          position: "absolute", top: "calc(100% + 8px)", [align]: 0, width, zIndex: 100,
          padding: 6, borderRadius: 16, maxHeight: 360, overflow: "auto",
          boxShadow: "0 24px 60px -20px rgba(0,0,0,.5)",
        }}
        onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, active, danger }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
      border: "none", background: active ? "var(--brand-soft)" : "transparent",
      color: danger ? "#d33" : "var(--ink)", cursor: "pointer",
      padding: "9px 11px", borderRadius: 10, fontFamily: "inherit", fontSize: ".92rem", fontWeight: 500,
    }}
    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "color-mix(in oklab, var(--ink) 7%, transparent)"; }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
      {icon && <span style={{ display: "inline-flex", color: "var(--muted)" }}>{icon}</span>}
      <span style={{ flex: 1 }}>{label}</span>
      {active && <Icon name="check" size={16} />}
    </button>
  );
}

Object.assign(window, { Icon, Avatar, AvatarStack, PostIt, Composer, Modal, Dropdown, MenuItem });
