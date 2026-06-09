/* board.jsx — Tableau de rétro : header, colonnes, contrôles animateur */

/* ---------------- Minuteur ---------------- */
function TimerPill({ timer, isAdmin, actions }) {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    if (!timer.running) return;
    const i = setInterval(() => force(x => x + 1), 500);
    return () => clearInterval(i);
  }, [timer.running]);

  let remaining = timer.running && timer.endsAt ? Math.max(0, timer.endsAt - Date.now()) : timer.durationMin * 60000;
  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);
  const expired = timer.running && remaining <= 0;
  const urgent = timer.running && remaining > 0 && remaining < 30000;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      background: expired ? "color-mix(in oklab, var(--brand) 18%, var(--surface))" : "var(--surface)",
      borderRadius: 999, padding: "5px 6px 5px 12px",
      boxShadow: "0 0 0 1px var(--line) inset",
      color: urgent || expired ? "var(--brand)" : "var(--ink)",
    }}>
      <Icon name="timer" size={17} />
      <span style={{ fontFamily: '"Bricolage Grotesque",sans-serif', fontWeight: 700, fontVariantNumeric: "tabular-nums", fontSize: "1rem", minWidth: 46 }}>
        {expired ? "Temps !" : `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`}
      </span>
      {isAdmin && (
        <div style={{ display: "flex", gap: 2 }}>
          {!timer.running ? (
            <button className="icon-btn" style={{ width: 28, height: 28 }} title="Démarrer" onClick={() => actions.startTimer()}>
              <Icon name="play" size={15} />
            </button>
          ) : (
            <button className="icon-btn" style={{ width: 28, height: 28 }} title="Pause" onClick={() => actions.pauseTimer()}>
              <Icon name="pause" size={15} />
            </button>
          )}
          <Dropdown align="right" width={180} trigger={
            <button className="icon-btn" style={{ width: 28, height: 28 }} title="Durée"><Icon name="chevron" size={15} /></button>
          }>
            {[3, 5, 7, 10, 15].map(m => (
              <MenuItem key={m} label={`${m} minutes`} active={timer.durationMin === m} onClick={() => actions.setTimerDuration(m)} />
            ))}
          </Dropdown>
        </div>
      )}
    </div>
  );
}

/* ---------------- Header ---------------- */
function BoardHeader({ session, isAdmin, currentUser, colorsById, actions, hiddenCount, freshIds }) {
  const phaseLabel = session.phase === "collecte" ? "Collecte en cours"
    : session.phase === "clos" ? "Session terminée"
    : "Révélation & discussion";
  const phaseColor = session.phase === "collecte" ? "#E8A317" : session.phase === "clos" ? "#4A9E5C" : "#2E8B8B";
  return (
    <header style={{
      display: "flex", alignItems: "center", gap: 14, padding: "12px 20px",
      background: "var(--header-bg)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      borderBottom: "1px solid var(--line)", position: "relative", zIndex: 30, flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
        <Brandmark size={34} />
        <div style={{ minWidth: 0 }}>
          <EditableTitle value={session.title} isAdmin={isAdmin} onChange={actions.renameSession} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 1 }}>
            <span style={{ fontSize: ".76rem", color: "var(--muted)", fontWeight: 600 }}>Code</span>
            <button className="chip" title="Copier le code" onClick={() => actions.copyCode()}
              style={{ fontFamily: '"Bricolage Grotesque",sans-serif', letterSpacing: ".08em", cursor: "pointer" }}>
              {session.code} <Icon name="copy" size={12} />
            </button>
          </div>
        </div>
      </div>

      <span style={{ flex: 1 }} />

      {/* Phase */}
      <div className="chip" style={{
        background: "color-mix(in oklab, " + phaseColor + " 22%, transparent)",
        color: "var(--ink)", padding: ".42em .8em",
      }}>
        <span className="dot" style={{ background: phaseColor }} />
        {phaseLabel}
        {session.phase === "collecte" && hiddenCount > 0 && (
          <span style={{ fontWeight: 700 }}>· {hiddenCount} masqué{hiddenCount > 1 ? "s" : ""}</span>
        )}
      </div>

      <TimerPill timer={session.timer} isAdmin={isAdmin} actions={actions} />

      {/* Participants */}
      <AvatarStack users={session.participants} size={32} freshIds={freshIds} />

      {/* Bascule de rôle */}
      <Dropdown align="right" width={250} trigger={
        <button className="btn btn--sm" title="Changer de point de vue">
          <Avatar user={currentUser} size={22} showStar={false} />
          <span style={{ maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser.name}</span>
          <Icon name="chevron" size={14} />
        </button>
      }>
        <div style={{ padding: "6px 11px 4px", fontSize: ".72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>
          Vous regardez en tant que
        </div>
        {session.participants.map(u => (
          <MenuItem key={u.id} active={u.id === currentUser.id} onClick={() => actions.switchUser(u.id)}
            icon={<Avatar user={u} size={22} showStar={false} />}
            label={<span>{u.name}{u.isAdmin ? " · animateur" : ""}</span>} />
        ))}
        <div style={{ borderTop: "1px solid var(--line)", margin: "5px 0" }} />
        <MenuItem icon={<Icon name="users" size={16} />} label="Ajouter des coéquipiers (démo)" onClick={() => actions.addDemoTeam()} />
      </Dropdown>

      {/* Menu animateur */}
      {isAdmin && (
        <Dropdown align="right" width={230} trigger={
          <button className="btn btn--sm btn--primary"><Icon name="sparkle" size={15} /> Animateur</button>
        }>
          <div style={{ padding: "6px 11px 4px", fontSize: ".72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>
            Révélation
          </div>
          <MenuItem icon={<Icon name="eye" size={16} />} label="Tout révéler" onClick={() => actions.revealAll()} />
          <MenuItem icon={<Icon name="eyeOff" size={16} />} label="Tout masquer" onClick={() => actions.hideAll()} />
          <div style={{ borderTop: "1px solid var(--line)", margin: "5px 0" }} />
          <div style={{ padding: "6px 11px 4px", fontSize: ".72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>
            Phase
          </div>
          <MenuItem icon={<Icon name="edit" size={16} />} label="Collecte" active={session.phase === "collecte"} onClick={() => actions.setPhase("collecte")} />
          <MenuItem icon={<Icon name="users" size={16} />} label="Discussion" active={session.phase === "revue"} onClick={() => actions.setPhase("revue")} />
          <div style={{ borderTop: "1px solid var(--line)", margin: "5px 0" }} />
          <MenuItem icon={<Icon name="sparkle" size={16} />} label={session.simulate ? "Stopper la simulation" : "Simuler l'équipe qui écrit"} active={session.simulate} onClick={() => actions.toggleSimulate()} />
          <MenuItem icon={<Icon name="trash" size={16} />} label="Réinitialiser la session" danger onClick={() => actions.resetSession()} />
        </Dropdown>
      )}

      <button className="btn btn--sm" onClick={actions.openReport}>
        <Icon name="download" size={16} /> Export
      </button>

      {isAdmin && session.phase !== "clos" && (
        <button className="btn btn--sm" onClick={actions.endSession}
          style={{ color: "var(--brand)", boxShadow: "0 0 0 1.5px color-mix(in oklab, var(--brand) 45%, transparent) inset" }}>
          <Icon name="flag" size={15} /> Terminer
        </button>
      )}
      {isAdmin && session.phase === "clos" && (
        <button className="btn btn--sm btn--primary" onClick={actions.newSession}>
          <Icon name="plus" size={15} /> Nouvelle session
        </button>
      )}
    </header>
  );
}

/* Titre éditable */
function EditableTitle({ value, isAdmin, onChange }) {
  const [editing, setEditing] = React.useState(false);
  const [v, setV] = React.useState(value);
  React.useEffect(() => setV(value), [value]);
  if (editing && isAdmin) {
    return (
      <input autoFocus value={v} onChange={e => setV(e.target.value)}
        onBlur={() => { setEditing(false); onChange(v.trim() || value); }}
        onKeyDown={e => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") { setV(value); setEditing(false); } }}
        style={{ font: 'inherit', fontFamily: '"Bricolage Grotesque",sans-serif', fontWeight: 700, fontSize: "1.18rem",
          border: "none", borderBottom: "2px solid var(--brand)", background: "transparent", color: "var(--ink)", outline: "none", width: 240 }} />
    );
  }
  return (
    <h1 onClick={() => isAdmin && setEditing(true)} title={isAdmin ? "Cliquer pour renommer" : ""}
      style={{ fontSize: "1.18rem", cursor: isAdmin ? "text" : "default", lineHeight: 1.1,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "min(40vw, 360px)" }}>
      {value}
    </h1>
  );
}

/* ---------------- Colonne ---------------- */
function Column({ col, notes, session, isAdmin, currentUser, colorsById, actions,
                  draggingId, setDraggingId, dragOverCol, setDragOverCol }) {
  const [adding, setAdding] = React.useState(false);
  const canAdd = session.phase === "collecte" || (isAdmin && session.phase === "revue");

  const hiddenN = notes.filter(n => !(n.revealed || n.authorId === currentUser.id)).length;

  // notes regroupées : on affiche un cluster pour chaque groupId, sinon la note seule
  const rendered = [];
  const seenGroups = new Set();
  notes.forEach(n => {
    if (n.groupId) {
      if (seenGroups.has(n.groupId)) return;
      seenGroups.add(n.groupId);
      rendered.push({ type: "group", groupId: n.groupId, notes: notes.filter(x => x.groupId === n.groupId) });
    } else {
      rendered.push({ type: "single", note: n });
    }
  });

  const onColDrop = (e) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData("text/plain");
    if (id) actions.moveNote(id, col.id);
    setDraggingId(null);
  };

  return (
    <div
      onDragOver={(e) => { if (isAdmin) { e.preventDefault(); setDragOverCol(col.id); } }}
      onDragLeave={() => setDragOverCol(c => c === col.id ? null : c)}
      onDrop={onColDrop}
      style={{
        flex: "1 1 0", minWidth: 300, display: "flex", flexDirection: "column",
        background: dragOverCol === col.id ? "color-mix(in oklab, " + col.accent + " 10%, var(--board))" : "var(--board)",
        borderRadius: 22, padding: 14,
        boxShadow: "inset 0 0 0 1px var(--line)" + (dragOverCol === col.id ? ", 0 0 0 2px " + col.accent : ""),
        transition: "background .15s, box-shadow .15s", minHeight: 0,
      }}>
      {/* En-tête de colonne */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "2px 6px 12px" }}>
        <span style={{ fontSize: "1.3rem" }}>{col.emoji}</span>
        <ColTitle col={col} isAdmin={isAdmin} onChange={(name) => actions.renameColumn(col.id, name)} />
        <span className="chip" style={{ background: "color-mix(in oklab," + col.accent + " 16%, transparent)", color: "var(--ink-2)" }}>
          {notes.length}
        </span>
        {session.phase === "collecte" && hiddenN > 0 && (
          <span className="chip" title="Notes masquées"><Icon name="eyeOff" size={12} /> {hiddenN}</span>
        )}
        <span style={{ flex: 1 }} />
        {isAdmin && session.columns.length > 1 && (
          <button className="icon-btn" style={{ width: 28, height: 28, color: "var(--muted)" }} title="Supprimer la colonne"
            onClick={() => actions.deleteColumn(col.id)}><Icon name="trash" size={15} /></button>
        )}
      </div>

      {/* Liste */}
      <div className="scroll" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", gap: 18, padding: "6px 6px 10px" }}>
        {canAdd && (
          adding ? (
            <Composer colors={POSTIT_COLORS} defaultColorId={notes.length % 2 ? "sky" : "butter"}
              onAdd={(text, colorId, anon) => { actions.addNote(col.id, text, colorId, anon); }}
              onCancel={() => setAdding(false)} />
          ) : (
            <button onClick={() => setAdding(true)} style={{
              border: "2px dashed var(--line-strong)", background: "transparent", color: "var(--ink-2)",
              borderRadius: 12, padding: "13px", cursor: "pointer", fontFamily: '"Bricolage Grotesque",sans-serif',
              fontWeight: 600, fontSize: ".95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            }}>
              <Icon name="plus" size={18} /> Ajouter une note
            </button>
          )
        )}

        {rendered.map(item => {
          if (item.type === "single") {
            const n = item.note;
            const author = session.participants.find(u => u.id === n.authorId);
            const canSee = n.revealed || n.authorId === currentUser.id;
            return (
              <PostIt key={n.id} note={n} color={colorsById[n.colorId] || POSTIT_COLORS[0]}
                author={canSee ? author : null}
                canSee={canSee} isMine={n.authorId === currentUser.id} currentUser={currentUser} isAdmin={isAdmin}
                onVote={actions.vote} onReveal={actions.revealOne} onDelete={actions.deleteNote} onEdit={actions.editNote}
                onDragStart={(e, note) => { e.dataTransfer.setData("text/plain", note.id); setDraggingId(note.id); }}
                dragging={draggingId === n.id}
                onDropOnto={(target) => { if (draggingId && draggingId !== target.id) actions.groupNotes(draggingId, target.id); setDraggingId(null); }} />
            );
          }
          // groupe
          return (
            <GroupCluster key={item.groupId} groupId={item.groupId} notes={item.notes} col={col}
              session={session} isAdmin={isAdmin} currentUser={currentUser} colorsById={colorsById} actions={actions}
              draggingId={draggingId} setDraggingId={setDraggingId} />
          );
        })}
      </div>
    </div>
  );
}

function ColTitle({ col, isAdmin, onChange }) {
  const [editing, setEditing] = React.useState(false);
  const [v, setV] = React.useState(col.name);
  React.useEffect(() => setV(col.name), [col.name]);
  if (editing && isAdmin) {
    return <input autoFocus value={v} onChange={e => setV(e.target.value)}
      onBlur={() => { setEditing(false); onChange(v.trim() || col.name); }}
      onKeyDown={e => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") { setV(col.name); setEditing(false); } }}
      style={{ font: "inherit", fontFamily: '"Bricolage Grotesque",sans-serif', fontWeight: 700, fontSize: "1.1rem",
        border: "none", borderBottom: "2px solid " + col.accent, background: "transparent", color: "var(--ink)", outline: "none", width: 140 }} />;
  }
  return <h2 onClick={() => isAdmin && setEditing(true)} title={isAdmin ? "Cliquer pour renommer" : ""}
    style={{ fontSize: "1.1rem", cursor: isAdmin ? "text" : "default" }}>{col.name}</h2>;
}

/* ---------------- Groupe (cluster) ---------------- */
function GroupCluster({ groupId, notes, col, session, isAdmin, currentUser, colorsById, actions, draggingId, setDraggingId }) {
  const totalVotes = notes.reduce((s, n) => s + n.votes.length, 0);
  const [open, setOpen] = React.useState(true);
  return (
    <div
      onDragOver={(e) => { if (isAdmin) e.preventDefault(); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (draggingId) { actions.addToGroup(draggingId, groupId); setDraggingId(null); } }}
      style={{ borderRadius: 16, padding: 10, background: "color-mix(in oklab," + col.accent + " 9%, transparent)",
        boxShadow: "inset 0 0 0 1.5px color-mix(in oklab," + col.accent + " 35%, transparent)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 4px 8px" }}>
        <Icon name="layers" size={15} />
        <span style={{ fontFamily: '"Bricolage Grotesque",sans-serif', fontWeight: 700, fontSize: ".88rem" }}>
          Groupe · {notes.length} notes
        </span>
        <span className="vote" data-voted="0" style={{ pointerEvents: "none" }}>
          <Icon name="check" size={12} stroke={3} /> {totalVotes}
        </span>
        <span style={{ flex: 1 }} />
        {isAdmin && (
          <button className="icon-btn" style={{ width: 26, height: 26, color: "var(--muted)" }} title="Dégrouper"
            onClick={() => actions.ungroup(groupId)}><Icon name="ungroup" size={14} /></button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {notes.map(n => {
          const author = session.participants.find(u => u.id === n.authorId);
          const canSee = n.revealed || n.authorId === currentUser.id;
          return (
            <PostIt key={n.id} note={n} color={colorsById[n.colorId] || POSTIT_COLORS[0]}
              author={canSee ? author : null}
              canSee={canSee} isMine={n.authorId === currentUser.id} currentUser={currentUser} isAdmin={isAdmin}
              onVote={actions.vote} onReveal={actions.revealOne} onDelete={actions.deleteNote}
              onDragStart={(e, note) => { e.dataTransfer.setData("text/plain", note.id); setDraggingId(note.id); }}
              dragging={draggingId === n.id}
              onDropOnto={(target) => { if (draggingId && draggingId !== target.id) actions.groupNotes(draggingId, target.id); setDraggingId(null); }} />
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Board ---------------- */
function Board({ session, isAdmin, currentUser, colorsById, actions, freshIds }) {
  const [draggingId, setDraggingId] = React.useState(null);
  const [dragOverCol, setDragOverCol] = React.useState(null);

  const hiddenCount = session.postits.filter(n => !(n.revealed || n.authorId === currentUser.id)).length;

  return (
    <div className="app">
      <BoardHeader session={session} isAdmin={isAdmin} currentUser={currentUser}
        colorsById={colorsById} actions={actions} hiddenCount={hiddenCount} freshIds={freshIds} />

      {/* hint reveal */}
      {isAdmin && session.phase === "collecte" && hiddenCount > 0 && (
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 16px 0" }}>
          <div className="chip" style={{ background: "var(--surface)", boxShadow: "0 0 0 1px var(--line) inset", padding: ".5em 1em" }}>
            <Icon name="eye" size={15} /> Cliquez sur une note masquée pour la révéler une par une, ou « Tout révéler » dans le menu Animateur.
          </div>
        </div>
      )}

      {/* bandeau de clôture */}
      {session.phase === "clos" && (
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--surface)",
            boxShadow: "0 0 0 1px var(--line) inset", borderRadius: 999, padding: "8px 8px 8px 18px" }}>
            <span style={{ display: "inline-flex", color: "#4A9E5C" }}><Icon name="flag" size={17} /></span>
            <span style={{ fontWeight: 600, fontFamily: '"Bricolage Grotesque",sans-serif' }}>
              Session terminée — exportez le compte-rendu pour le tracer par mail.
            </span>
            <button className="btn btn--sm btn--primary" onClick={actions.openReport}>
              <Icon name="download" size={15} /> Exporter
            </button>
          </div>
        </div>
      )}

      <div className="scroll" style={{ flex: 1, overflow: "auto", padding: 18, minHeight: 0 }}>
        <div style={{ display: "flex", gap: 18, height: "100%", alignItems: "stretch", minWidth: "min-content" }}>
          {session.columns.map(col => (
            <Column key={col.id} col={col}
              notes={session.postits.filter(n => n.columnId === col.id)}
              session={session} isAdmin={isAdmin} currentUser={currentUser} colorsById={colorsById}
              actions={actions} draggingId={draggingId} setDraggingId={setDraggingId}
              dragOverCol={dragOverCol} setDragOverCol={setDragOverCol} />
          ))}
          {isAdmin && (
            <button onClick={actions.addColumn} style={{
              flex: "0 0 auto", width: 70, alignSelf: "stretch", border: "2px dashed var(--line-strong)",
              background: "transparent", borderRadius: 22, cursor: "pointer", color: "var(--muted)",
              display: "grid", placeItems: "center",
            }} title="Ajouter une colonne"><Icon name="plus" size={26} /></button>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Board, BoardHeader, Column, GroupCluster, TimerPill, EditableTitle, ColTitle });
