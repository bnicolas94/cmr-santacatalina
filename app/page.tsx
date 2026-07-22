"use client";

import { useMemo, useState } from "react";

type Conversation = {
  id: number;
  name: string;
  initials: string;
  preview: string;
  time: string;
  unread: number;
  status: "Nueva" | "En atencion" | "Esperando cliente" | "Reclamo";
  owner: string;
  tags: string[];
  branch: string;
  priority?: boolean;
  order?: string;
};

const conversations: Conversation[] = [
  {
    id: 1,
    name: "Luciana Peralta",
    initials: "LP",
    preview: "Perfecto, seria para manana...",
    time: "10:42",
    unread: 2,
    status: "En atencion",
    owner: "Vos",
    tags: ["Pedido"],
    branch: "Centro",
    order: "#SC-1048",
  },
  {
    id: 2,
    name: "Martin Acosta",
    initials: "MA",
    preview: "Hola, queria consultar precios",
    time: "10:38",
    unread: 1,
    status: "Nueva",
    owner: "Sin asignar",
    tags: ["Consulta"],
    branch: "Centro",
  },
  {
    id: 3,
    name: "Carolina Diaz",
    initials: "CD",
    preview: "No llego el pedido todavia",
    time: "10:24",
    unread: 3,
    status: "Reclamo",
    owner: "Sofia",
    tags: ["Reclamo"],
    branch: "Norte",
    priority: true,
    order: "#SC-1041",
  },
  {
    id: 4,
    name: "Diego Romero",
    initials: "DR",
    preview: "Gracias! Quedo atento",
    time: "09:57",
    unread: 0,
    status: "Esperando cliente",
    owner: "Vos",
    tags: ["Pedido"],
    branch: "Centro",
    order: "#SC-1039",
  },
  {
    id: 5,
    name: "Paula Benitez",
    initials: "PB",
    preview: "Puedo retirar por la tarde?",
    time: "09:31",
    unread: 0,
    status: "En atencion",
    owner: "Marcos",
    tags: ["Retira"],
    branch: "Sur",
  },
  {
    id: 6,
    name: "Nicolas Sosa",
    initials: "NS",
    preview: "Me pasas los sabores?",
    time: "Ayer",
    unread: 0,
    status: "Esperando cliente",
    owner: "Vos",
    tags: ["Consulta"],
    branch: "Centro",
  },
];

const filters = ["Todas", "Nuevas", "Sin asignar", "Mias", "Reclamos"];

export default function Home() {
  const [selected, setSelected] = useState(1);
  const [filter, setFilter] = useState("Todas");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const [orderOpen, setOrderOpen] = useState(false);
  const [mode, setMode] = useState<"ENVIO" | "RETIRA">("ENVIO");
  const [notice, setNotice] = useState("");

  const visible = useMemo(
    () =>
      conversations.filter((item) => {
        const matchesText = `${item.name} ${item.preview}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesFilter =
          filter === "Todas" ||
          (filter === "Nuevas" && item.status === "Nueva") ||
          (filter === "Sin asignar" && item.owner === "Sin asignar") ||
          (filter === "Mias" && item.owner === "Vos") ||
          (filter === "Reclamos" && item.status === "Reclamo");
        return matchesText && matchesFilter;
      }),
    [filter, query],
  );

  const current =
    conversations.find((item) => item.id === selected) ?? conversations[0];

  function sendMessage() {
    if (!message.trim()) return;
    setSent((items) => [...items, message.trim()]);
    setMessage("");
    setNotice("Mensaje agregado a la demo");
    window.setTimeout(() => setNotice(""), 2200);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">SC</div>
        <div className="brand-copy">
          <strong>Santa Catalina</strong>
          <span>Centro de atencion</span>
        </div>
        <nav aria-label="Secciones principales">
          <button className="nav-item active">
            <span aria-hidden>◫</span> Conversaciones
          </button>
          <button className="nav-item">
            <span aria-hidden>▣</span> Pedidos
          </button>
          <button className="nav-item">
            <span aria-hidden>♙</span> Clientes
          </button>
          <button className="nav-item">
            <span aria-hidden>▦</span> Catalogo
          </button>
        </nav>
        <div className="top-actions">
          <button className="icon-button" aria-label="Notificaciones">
            ♧<span className="notification-dot" />
          </button>
          <div className="user-avatar">AM</div>
          <div className="user-copy">
            <strong>Ana Martinez</strong>
            <span>Telefonista</span>
          </div>
          <button className="icon-button" aria-label="Menu de usuario">
            ⌄
          </button>
        </div>
      </header>

      <section className="workspace">
        <aside className="inbox-panel">
          <div className="inbox-heading">
            <div>
              <p className="eyebrow">Bandeja</p>
              <h1>Conversaciones</h1>
            </div>
            <span className="live-pill">
              <i /> En linea
            </span>
          </div>
          <label className="search-box">
            <span aria-hidden>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar cliente o mensaje"
              aria-label="Buscar conversaciones"
            />
            <kbd>⌘ K</kbd>
          </label>
          <div className="filter-row" aria-label="Filtros de conversacion">
            {filters.map((item) => (
              <button
                key={item}
                className={filter === item ? "filter active" : "filter"}
                onClick={() => setFilter(item)}
              >
                {item}
                {item === "Nuevas" && <b>1</b>}
              </button>
            ))}
          </div>
          <div className="queue-summary">
            <span>{visible.length} conversaciones</span>
            <button>Mas recientes⌄</button>
          </div>
          <div className="conversation-list">
            {visible.map((item) => (
              <button
                className={
                  selected === item.id ? "conversation active" : "conversation"
                }
                key={item.id}
                onClick={() => setSelected(item.id)}
              >
                <span className={`avatar avatar-${item.id}`}>
                  {item.initials}
                  <i className="presence" />
                </span>
                <span className="conversation-main">
                  <span className="conversation-line">
                    <strong>{item.name}</strong>
                    <time>{item.time}</time>
                  </span>
                  <span className="preview">{item.preview}</span>
                  <span className="meta-row">
                    <em
                      className={`status status-${item.status.replaceAll(" ", "-").toLowerCase()}`}
                    >
                      {item.status}
                    </em>
                    <small>{item.owner}</small>
                    {item.order && <small>{item.order}</small>}
                  </span>
                </span>
                {item.unread > 0 && (
                  <span className={item.priority ? "unread danger" : "unread"}>
                    {item.unread}
                  </span>
                )}
              </button>
            ))}
            {visible.length === 0 && (
              <div className="empty-state">
                <strong>Sin resultados</strong>
                <span>Proba con otro nombre o filtro.</span>
              </div>
            )}
          </div>
        </aside>

        <section className="chat-panel">
          <header className="chat-header">
            <span className="avatar avatar-1">
              {current.initials}
              <i className="presence" />
            </span>
            <div>
              <h2>{current.name}</h2>
              <p>+54 9 11 4827-1934 · WhatsApp</p>
            </div>
            <span className="sla-badge">
              <i /> Ventana abierta · 22 h 14 min
            </span>
            <div className="chat-actions">
              <button aria-label="Buscar en el chat">⌕</button>
              <button aria-label="Mas acciones">•••</button>
            </div>
          </header>
          <div className="assignment-bar">
            <span>✓</span>
            <p>
              <strong>Conversacion asignada a vos</strong>
              <small>Tomada hoy a las 10:31</small>
            </p>
            <button onClick={() => setNotice("Transferencia simulada")}>
              Transferir
            </button>
          </div>
          <div className="messages">
            <div className="date-divider">
              <span>Hoy</span>
            </div>
            <article className="bubble incoming">
              <p>Hola! Queria hacer un pedido para manana 😊</p>
              <time>10:28</time>
            </article>
            <article className="bubble outgoing">
              <p>
                Hola Luciana! Claro. Contame que productos necesitas y si
                preferis envio o retirar por el local.
              </p>
              <footer>
                <span>Ana Martinez</span>
                <time>10:32 ✓✓</time>
              </footer>
            </article>
            <article className="bubble incoming">
              <p>
                Quisiera 2 planchas de empanadas: una de carne suave y una de
                jamon y queso.
              </p>
              <time>10:36</time>
            </article>
            <article className="bubble incoming">
              <p>
                Seria con envio a la direccion de siempre, para manana al
                mediodia.
              </p>
              <time>10:37</time>
            </article>
            <article className="internal-note">
              <span>Nota interna · Ana</span>
              <p>
                Confirmar franja y metodo de pago antes de cerrar el pedido.
              </p>
            </article>
            <article className="bubble outgoing">
              <p>
                Perfecto! Tengo tu direccion de Av. Rivadavia 4521. ¿Te queda
                bien la franja de 12:00 a 14:00?
              </p>
              <footer>
                <span>Ana Martinez</span>
                <time>10:40 ✓✓</time>
              </footer>
            </article>
            <article className="bubble incoming">
              <p>
                Perfecto, seria para manana de 12 a 14. Pago por transferencia.
              </p>
              <time>10:42</time>
            </article>
            {sent.map((text, index) => (
              <article className="bubble outgoing" key={`${text}-${index}`}>
                <p>{text}</p>
                <footer>
                  <span>Ana Martinez</span>
                  <time>Ahora ✓</time>
                </footer>
              </article>
            ))}
          </div>
          <div className="composer">
            <div className="composer-tools">
              <button aria-label="Adjuntar">＋</button>
              <button
                onClick={() =>
                  setMessage("Hola {nombre}, tu pedido esta confirmado.")
                }
              >
                ⌁ Respuesta rapida
              </button>
              <button
                onClick={() => setNotice("Modo nota interna seleccionado")}
              >
                ▱ Nota interna
              </button>
            </div>
            <div className="composer-input">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Escribi un mensaje..."
                aria-label="Mensaje"
              />
              <button aria-label="Emoji">☺</button>
              <button
                className="send-button"
                onClick={sendMessage}
                aria-label="Enviar mensaje"
              >
                ➤
              </button>
            </div>
            <small>Enter para enviar · Shift + Enter para nueva linea</small>
          </div>
        </section>

        <aside className="detail-panel">
          <section className="customer-card">
            <div className="customer-head">
              <span className="large-avatar">LP</span>
              <div>
                <h2>{current.name}</h2>
                <p>Cliente desde mar. 2024</p>
              </div>
              <button aria-label="Editar cliente">✎</button>
            </div>
            <dl>
              <div>
                <dt>Telefono</dt>
                <dd>+54 9 11 4827-1934</dd>
              </div>
              <div>
                <dt>Sede habitual</dt>
                <dd>Centro</dd>
              </div>
              <div>
                <dt>Modalidad habitual</dt>
                <dd>
                  <span className="delivery-tag">♧ Envio</span>
                </dd>
              </div>
            </dl>
            <button className="link-button">Ver ficha completa →</button>
          </section>
          <section className="address-card">
            <div className="section-title">
              <h3>Direccion predeterminada</h3>
              <button>✎</button>
            </div>
            <p>
              <span>⌖</span>
              <strong>Av. Rivadavia 4521, 3° B</strong>
              <small>
                Caballito, CABA
                <br />
                Timbre: Peralta
              </small>
            </p>
          </section>
          <section className="order-card">
            <div className="section-title">
              <div>
                <span className="eyebrow">Pedido en carga</span>
                <h3>#SC-1048</h3>
              </div>
              <span className="draft-badge">Borrador</span>
            </div>
            <div className="order-meta">
              <span>◷ Manana · 12:00–14:00</span>
              <span>▣ Sede Centro</span>
            </div>
            <div className="order-line">
              <div>
                <strong>Plancha empanadas</strong>
                <small>Carne suave · 12 u.</small>
              </div>
              <span>$18.500</span>
            </div>
            <div className="order-line">
              <div>
                <strong>Plancha empanadas</strong>
                <small>Jamon y queso · 12 u.</small>
              </div>
              <span>$18.500</span>
            </div>
            <div className="order-line muted">
              <div>
                <strong>Envio</strong>
                <small>Caballito</small>
              </div>
              <span>$3.200</span>
            </div>
            <div className="order-total">
              <span>Total</span>
              <strong>$40.200</strong>
            </div>
            <button
              className="primary-button"
              onClick={() => setOrderOpen(true)}
            >
              Continuar pedido
            </button>
          </section>
          <section className="tags-card">
            <div className="section-title">
              <h3>Etiquetas</h3>
              <button>＋</button>
            </div>
            <div>
              <span>Cliente frecuente</span>
              <span>Pedido</span>
            </div>
          </section>
        </aside>
      </section>

      {orderOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setOrderOpen(false)}
        >
          <section
            className="order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <p className="eyebrow">Pedido #SC-1048</p>
                <h2 id="order-title">Completar pedido</h2>
              </div>
              <button onClick={() => setOrderOpen(false)} aria-label="Cerrar">
                ×
              </button>
            </header>
            <p className="modal-intro">
              Verifica la modalidad y los datos obligatorios antes de confirmar.
            </p>
            <div className="mode-picker">
              <button
                className={mode === "ENVIO" ? "active" : ""}
                onClick={() => setMode("ENVIO")}
              >
                <strong>♧ ENVIO</strong>
                <span>Entregar al domicilio guardado</span>
              </button>
              <button
                className={mode === "RETIRA" ? "active" : ""}
                onClick={() => setMode("RETIRA")}
              >
                <strong>⌂ RETIRA</strong>
                <span>El cliente pasa por la sede</span>
              </button>
            </div>
            {mode === "ENVIO" && (
              <label className="field">
                <span>Direccion de entrega</span>
                <input value="Av. Rivadavia 4521, 3° B" readOnly />
              </label>
            )}
            <div className="field-grid">
              <label className="field">
                <span>Fecha</span>
                <input value="22/07/2026" readOnly />
              </label>
              <label className="field">
                <span>Franja horaria</span>
                <input value="12:00–14:00" readOnly />
              </label>
            </div>
            <label className="field">
              <span>Metodo de pago</span>
              <input value="Transferencia" readOnly />
            </label>
            <div className="validation-ok">
              ✓ Datos minimos completos para confirmar
            </div>
            <footer>
              <button
                className="secondary-button"
                onClick={() => setOrderOpen(false)}
              >
                Guardar borrador
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  setOrderOpen(false);
                  setNotice("Pedido confirmado en la demo");
                }}
              >
                Confirmar · $40.200
              </button>
            </footer>
          </section>
        </div>
      )}
      {notice && (
        <div className="toast" role="status">
          ✓ {notice}
        </div>
      )}
    </main>
  );
}
