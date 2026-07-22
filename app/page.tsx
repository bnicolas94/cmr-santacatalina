"use client";

import { useEffect, useState, useMemo, useCallback } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
};

type Customer = {
  id: string;
  whatsappNumber: string;
  whatsappName?: string | null;
  displayName?: string | null;
  addresses?: Array<{
    id: string;
    street: string;
    number: string;
    city: string;
  }>;
};

type Message = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  text?: string | null;
  status: string;
  createdAt: string;
  sentByUser?: { name: string } | null;
};

type Conversation = {
  id: string;
  status: string;
  unreadCount: number;
  lastMessageAt?: string | null;
  serviceWindowExpiresAt?: string | null;
  customer: Customer;
  assignedUser?: { name: string } | null;
  messages?: Message[];
};

type Category = {
  id: string;
  name: string;
  description?: string | null;
};

type Product = {
  id: string;
  name: string;
  price: string;
  unit: string;
  categoryId: string;
  category?: { name: string };
};

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  fulfillmentType: "RETIRA" | "ENVIO";
  total: string;
  notes?: string | null;
  createdAt: string;
  customer: Customer;
  items: OrderItem[];
};

type AuditLogEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorUserId?: string | null;
  after?: Record<string, unknown> | null;
  createdAt: string;
};

type QuickReply = {
  id: string;
  shortcut: string;
  title: string;
  content: string;
  category?: string | null;
};

type OperatorUser = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  userRoles?: Array<{ role: { name: string } }>;
};

type Metrics = {
  totalCustomers: number;
  activeConversations: number;
  ordersTodayCount: number;
  revenueToday: number;
};

export default function SantaCatalinaCRM() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Tab State: CHAT | ORDERS | REPORTS | ADMIN
  const [activeTab, setActiveTab] = useState<
    "CHAT" | "ORDERS" | "REPORTS" | "ADMIN"
  >("CHAT");

  // Admin Sub-Tab State: CATALOG | QUICK_REPLIES | OPERATORS
  const [adminSubTab, setAdminSubTab] = useState<
    "CATALOG" | "QUICK_REPLIES" | "OPERATORS"
  >("CATALOG");

  // Auth State
  const [loginEmail, setLoginEmail] = useState("admin@santacatalina.local");
  const [loginPassword, setLoginPassword] = useState("Admin123!");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // App Data State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState("");

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("TODOS");

  // Catalog State
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [fulfillmentType, setFulfillmentType] = useState<"RETIRA" | "ENVIO">(
    "RETIRA",
  );
  const [orderNotes, setOrderNotes] = useState("");
  const [orderStatusMsg, setOrderStatusMsg] = useState<string | null>(null);

  // Admin Form States: Category, Product, Quick Reply, Operator
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [catStatusMsg, setCatStatusMsg] = useState<string | null>(null);

  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdUnit, setNewProdUnit] = useState("docena");
  const [newProdCatId, setNewProdCatId] = useState("");
  const [prodStatusMsg, setProdStatusMsg] = useState<string | null>(null);

  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [qrShortcut, setQrShortcut] = useState("");
  const [qrTitle, setQrTitle] = useState("");
  const [qrContent, setQrContent] = useState("");
  const [qrCategory, setQrCategory] = useState("General");
  const [qrStatusMsg, setQrStatusMsg] = useState<string | null>(null);

  const [operatorUsers, setOperatorUsers] = useState<OperatorUser[]>([]);
  const [opName, setOpName] = useState("");
  const [opEmail, setOpEmail] = useState("");
  const [opPassword, setOpPassword] = useState("");
  const [opRole, setOpRole] = useState<
    "TELEFONISTA" | "SUPERVISOR" | "ADMINISTRADOR"
  >("TELEFONISTA");
  const [opStatusMsg, setOpStatusMsg] = useState<string | null>(null);

  // Dashboard Metrics & Audit State
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODAS");

  const selectConversation = useCallback(async (id: string) => {
    setSelectedConversationId(id);
    try {
      const res = await fetch(`/api/conversations/${id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error cargando mensajes:", err);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (data.conversations?.length > 0 && !selectedConversationId) {
          selectConversation(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error("Error cargando conversaciones:", err);
    }
  }, [selectedConversationId, selectConversation]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/catalog/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        if (data.categories?.length > 0 && !newProdCatId) {
          setNewProdCatId(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error("Error cargando categorías:", err);
    }
  }, [newProdCatId]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/catalog/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        if (data.products?.length > 0) {
          setSelectedProductId(data.products[0].id);
        }
      }
    } catch (err) {
      console.error("Error cargando catálogo:", err);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Error cargando pedidos:", err);
    }
  }, []);

  const fetchQuickReplies = useCallback(async () => {
    try {
      const res = await fetch("/api/quick-replies");
      if (res.ok) {
        const data = await res.json();
        setQuickReplies(data.quickReplies || []);
      }
    } catch (err) {
      console.error("Error cargando respuestas rápidas:", err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setOperatorUsers(data.users || []);
      }
    } catch (err) {
      console.error("Error cargando operadores:", err);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/reporting/metrics");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error("Error cargando métricas:", err);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/reporting/audit");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.auditLogs || []);
      }
    } catch (err) {
      console.error("Error cargando auditoría:", err);
    }
  }, []);

  const loadDashboardData = useCallback(() => {
    fetchConversations();
    fetchCategories();
    fetchProducts();
    fetchOrders();
    fetchQuickReplies();
    fetchUsers();
    fetchMetrics();
    fetchAuditLogs();
  }, [
    fetchConversations,
    fetchCategories,
    fetchProducts,
    fetchOrders,
    fetchQuickReplies,
    fetchUsers,
    fetchMetrics,
    fetchAuditLogs,
  ]);

  // Check active session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setCurrentUser(data.user);
            fetchConversations();
            fetchCategories();
            fetchProducts();
            fetchOrders();
            fetchQuickReplies();
            fetchUsers();
            fetchMetrics();
            fetchAuditLogs();
          }
        } else if (isMounted) {
          setCurrentUser(null);
        }
      } catch {
        if (isMounted) setCurrentUser(null);
      } finally {
        if (isMounted) setLoadingSession(false);
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setIsSubmittingLogin(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Credenciales inválidas.");
      } else {
        setCurrentUser(data.user);
        loadDashboardData();
      }
    } catch {
      setLoginError("Error conectando con el servidor.");
    } finally {
      setIsSubmittingLogin(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    setSelectedConversationId(null);
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedConversationId || !newMessageText.trim()) return;

    const textToSend = newMessageText.trim();
    setNewMessageText("");

    try {
      const res = await fetch(
        `/api/conversations/${selectedConversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textToSend }),
        },
      );

      if (res.ok) {
        selectConversation(selectedConversationId);
        fetchConversations();
      }
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  }

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedConversationId || !selectedProductId) return;

    const activeConv = conversations.find(
      (c) => c.id === selectedConversationId,
    );
    if (!activeConv) return;

    setOrderStatusMsg(null);

    try {
      const payload = {
        customerId: activeConv.customer.id,
        conversationId: activeConv.id,
        fulfillmentType,
        deliveryAddressId: activeConv.customer.addresses?.[0]?.id || undefined,
        notes: orderNotes,
        items: [
          {
            productId: selectedProductId,
            quantity: orderQuantity,
          },
        ],
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setOrderStatusMsg(data.error || "Error al crear pedido.");
      } else {
        setOrderStatusMsg(
          "✅ Pedido creado exitosamente: " + data.order.orderNumber,
        );
        setTimeout(() => {
          setShowOrderModal(false);
          setOrderStatusMsg(null);
          fetchMetrics();
          fetchOrders();
        }, 1500);
      }
    } catch {
      setOrderStatusMsg("Error de conexión al guardar el pedido.");
    }
  }

  async function handleUpdateOrderStatus(orderId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
        fetchMetrics();
        fetchAuditLogs();
      }
    } catch (err) {
      console.error("Error actualizando pedido:", err);
    }
  }

  // Admin Actions: Categories, Products, Quick Replies, Operators
  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setCatStatusMsg(null);

    try {
      const res = await fetch("/api/catalog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName, description: newCatDesc }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCatStatusMsg(data.error || "Error creando categoría.");
      } else {
        setCatStatusMsg("✅ Categoría '" + data.category.name + "' creada.");
        setNewCatName("");
        setNewCatDesc("");
        fetchCategories();
        fetchAuditLogs();
      }
    } catch {
      setCatStatusMsg("Error de conexión.");
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setProdStatusMsg(null);

    try {
      const res = await fetch("/api/catalog/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProdName,
          price: parseFloat(newProdPrice) || 0,
          unit: newProdUnit,
          categoryId: newProdCatId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProdStatusMsg(data.error || "Error creando producto.");
      } else {
        setProdStatusMsg("✅ Producto '" + data.product.name + "' creado.");
        setNewProdName("");
        setNewProdPrice("");
        fetchProducts();
        fetchAuditLogs();
      }
    } catch {
      setProdStatusMsg("Error de conexión.");
    }
  }

  async function handleCreateQuickReply(e: React.FormEvent) {
    e.preventDefault();
    setQrStatusMsg(null);

    try {
      const res = await fetch("/api/quick-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortcut: qrShortcut,
          title: qrTitle,
          content: qrContent,
          category: qrCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setQrStatusMsg(data.error || "Error al guardar plantilla.");
      } else {
        setQrStatusMsg(
          "✅ Plantilla '" + data.quickReply.title + "' guardada.",
        );
        setQrShortcut("");
        setQrTitle("");
        setQrContent("");
        fetchQuickReplies();
        fetchAuditLogs();
      }
    } catch {
      setQrStatusMsg("Error de conexión.");
    }
  }

  async function handleDeleteQuickReply(id: string) {
    try {
      const res = await fetch(`/api/quick-replies/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchQuickReplies();
        fetchAuditLogs();
      }
    } catch (err) {
      console.error("Error eliminando plantilla:", err);
    }
  }

  async function handleCreateOperator(e: React.FormEvent) {
    e.preventDefault();
    setOpStatusMsg(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: opName,
          email: opEmail,
          password: opPassword,
          roleName: opRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOpStatusMsg(data.error || "Error al crear operador.");
      } else {
        setOpStatusMsg("✅ Operador '" + data.user.name + "' registrado.");
        setOpName("");
        setOpEmail("");
        setOpPassword("");
        fetchUsers();
        fetchAuditLogs();
      }
    } catch {
      setOpStatusMsg("Error de conexión.");
    }
  }

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId],
  );

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchesSearch =
        c.customer.whatsappNumber.includes(searchQuery) ||
        (c.customer.displayName || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "TODAS" ||
        c.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [conversations, searchQuery, statusFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter === "TODOS") return true;
      return o.status === orderStatusFilter;
    });
  }, [orders, orderStatusFilter]);

  if (loadingSession) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-slate-400">
            Cargando Santa Catalina CRM...
          </p>
        </div>
      </div>
    );
  }

  // Render Login Modal if not authenticated
  if (!currentUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-2xl font-bold text-slate-950 shadow-lg shadow-amber-500/20">
              SC
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">
              Santa Catalina CRM
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Atención Multiusuario WhatsApp & Pedidos
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            {loginError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="mt-2 w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
            >
              {isSubmittingLogin ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Full CRM UI
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="flex w-16 flex-col items-center justify-between border-r border-slate-800 bg-slate-900 py-4">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-sm font-black text-slate-950 shadow-md shadow-amber-500/20">
            SC
          </div>
          <button
            onClick={() => setActiveTab("CHAT")}
            title="Bandeja de Atención WhatsApp"
            className={`rounded-xl p-2.5 transition ${
              activeTab === "CHAT"
                ? "bg-slate-800 text-amber-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            💬
          </button>
          <button
            onClick={() => setActiveTab("ORDERS")}
            title="Gestión de Pedidos & Catálogo"
            className={`rounded-xl p-2.5 transition ${
              activeTab === "ORDERS"
                ? "bg-slate-800 text-amber-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            🍕
          </button>
          <button
            onClick={() => setActiveTab("REPORTS")}
            title="Dashboard de Métricas & Auditoría"
            className={`rounded-xl p-2.5 transition ${
              activeTab === "REPORTS"
                ? "bg-slate-800 text-amber-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            👥
          </button>
          <button
            onClick={() => setActiveTab("ADMIN")}
            title="Configuración & Panel de Administración"
            className={`rounded-xl p-2.5 transition ${
              activeTab === "ADMIN"
                ? "bg-slate-800 text-amber-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            ⚙️
          </button>
        </div>

        <button
          onClick={handleLogout}
          title="Cerrar Sesión"
          className="rounded-xl p-2.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
        >
          🚪
        </button>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header / Metric Bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
          <div className="flex items-center space-x-6">
            <h1 className="text-lg font-bold text-white">Santa Catalina CRM</h1>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              ● WhatsApp Online
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-8 text-sm">
            <div>
              <span className="text-xs text-slate-400">Ventas Hoy:</span>
              <p className="font-bold text-emerald-400">
                $
                {metrics?.revenueToday
                  ? metrics.revenueToday.toLocaleString("es-AR")
                  : "0"}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Pedidos Hoy:</span>
              <p className="font-bold text-white">
                {metrics?.ordersTodayCount ?? 0}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Activos:</span>
              <p className="font-bold text-amber-400">
                {metrics?.activeConversations ?? 0}
              </p>
            </div>
            <div className="border-l border-slate-800 pl-6 text-xs text-slate-400">
              Operador:{" "}
              <span className="font-semibold text-white">
                {currentUser.name}
              </span>
            </div>
          </div>
        </header>

        {/* TAB 1: CHAT / ATENCION WHATSAPP */}
        {activeTab === "CHAT" && (
          <div className="flex flex-1 overflow-hidden">
            {/* Conversations Column */}
            <section className="flex w-80 flex-col border-r border-slate-800 bg-slate-900/50">
              <div className="p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Buscar por teléfono o nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />

                <div className="flex space-x-1">
                  {["TODAS", "NUEVA", "EN_ATENCION", "CERRADA"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                        statusFilter === st
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No se encontraron conversaciones.
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className={`w-full p-4 text-left transition hover:bg-slate-800/50 ${
                        selectedConversationId === conv.id
                          ? "bg-slate-800/80 border-l-4 border-amber-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-sm">
                          {conv.customer.displayName ||
                            conv.customer.whatsappNumber}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        📱 {conv.customer.whatsappNumber}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-slate-300 font-medium">
                          {conv.status}
                        </span>
                        <span className="text-slate-500">
                          {conv.assignedUser
                            ? `👤 ${conv.assignedUser.name}`
                            : "Sin Asignar"}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* Chat / Detail View */}
            <section className="flex flex-1 flex-col bg-slate-950">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/30 px-6">
                    <div>
                      <h2 className="text-base font-bold text-white">
                        {selectedConversation.customer.displayName ||
                          selectedConversation.customer.whatsappNumber}
                      </h2>
                      <p className="text-xs text-slate-400">
                        WhatsApp: {selectedConversation.customer.whatsappNumber}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowOrderModal(true)}
                        className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/10"
                      >
                        🛒 Tomar Pedido
                      </button>
                    </div>
                  </div>

                  {/* Messages List */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-xs text-slate-500">
                        Sin mensajes anteriores en esta conversación.
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-md rounded-2xl px-4 py-3 text-sm shadow-md ${
                              msg.direction === "OUTBOUND"
                                ? "bg-amber-500 text-slate-950 rounded-br-none"
                                : "bg-slate-800 text-white rounded-bl-none"
                            }`}
                          >
                            <p>{msg.text || "(Mensaje Multimedia)"}</p>
                            <div
                              className={`mt-1 flex items-center justify-end space-x-1 text-[10px] ${
                                msg.direction === "OUTBOUND"
                                  ? "text-slate-900/70"
                                  : "text-slate-400"
                              }`}
                            >
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                              {msg.direction === "OUTBOUND" && (
                                <span>• {msg.status}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Quick Replies Picker & Input Area */}
                  <div className="border-t border-slate-800 bg-slate-900/50 p-4 space-y-3">
                    {/* Quick Replies Bar */}
                    {quickReplies.length > 0 && (
                      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider whitespace-nowrap">
                          ⚡ Respuestas Rápidas:
                        </span>
                        {quickReplies.map((qr) => (
                          <button
                            key={qr.id}
                            type="button"
                            onClick={() => setNewMessageText(qr.content)}
                            title={qr.content}
                            className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-amber-500 hover:text-slate-950 transition whitespace-nowrap border border-slate-700"
                          >
                            {qr.shortcut} ({qr.title})
                          </button>
                        ))}
                      </div>
                    )}

                    <form
                      onSubmit={handleSendMessage}
                      className="flex space-x-3"
                    >
                      <input
                        type="text"
                        placeholder="Escribe una respuesta para WhatsApp o selecciona una plantilla arriba..."
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!newMessageText.trim()}
                        className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                      >
                        Enviar 🚀
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                  Selecciona una conversación para iniciar la atención.
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: PEDIDOS & CATALOGO */}
        {activeTab === "ORDERS" && (
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-950">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Gestión de Pedidos & Catálogo
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Control en tiempo real de estados de preparación, envíos y
                  snapshot de precios
                </p>
              </div>
              <button
                onClick={() => setShowOrderModal(true)}
                className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/10"
              >
                ➕ Nuevo Pedido
              </button>
            </div>

            {/* Order Status Filters */}
            <div className="flex space-x-2 border-b border-slate-800 pb-4">
              {[
                "TODOS",
                "PENDIENTE_CONFIRMACION",
                "CONFIRMADO",
                "EN_PREPARACION",
                "EN_CAMINO",
                "ENTREGADO",
                "CANCELADO",
              ].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    orderStatusFilter === st
                      ? "bg-amber-500 text-slate-950"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="px-6 py-4">N° Pedido</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Modalidad</th>
                    <th className="px-6 py-4">Ítems (Snapshot)</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Estado Actual</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        No hay pedidos en este estado.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr
                        key={ord.id}
                        className="hover:bg-slate-800/30 transition"
                      >
                        <td className="px-6 py-4 font-bold text-white">
                          {ord.orderNumber}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-100">
                            {ord.customer.displayName ||
                              ord.customer.whatsappNumber}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            📱 {ord.customer.whatsappNumber}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                              ord.fulfillmentType === "ENVIO"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}
                          >
                            {ord.fulfillmentType === "ENVIO"
                              ? "🛵 Envío"
                              : "🏃 Retira"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {ord.items.map((it) => (
                            <div key={it.id} className="text-slate-300">
                              {it.quantity}x {it.productName} ($
                              {Number(it.unitPrice).toLocaleString("es-AR")})
                            </div>
                          ))}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-400">
                          ${Number(ord.total).toLocaleString("es-AR")}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-md bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-200">
                            {ord.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {ord.status === "PENDIENTE_CONFIRMACION" && (
                            <button
                              onClick={() =>
                                handleUpdateOrderStatus(ord.id, "CONFIRMADO")
                              }
                              className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/30"
                            >
                              Confirmar
                            </button>
                          )}
                          {ord.status === "CONFIRMADO" && (
                            <button
                              onClick={() =>
                                handleUpdateOrderStatus(
                                  ord.id,
                                  "EN_PREPARACION",
                                )
                              }
                              className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-[10px] font-bold text-amber-400 hover:bg-amber-500/30"
                            >
                              En Preparación
                            </button>
                          )}
                          {ord.status === "EN_PREPARACION" && (
                            <button
                              onClick={() =>
                                handleUpdateOrderStatus(ord.id, "ENTREGADO")
                              }
                              className="rounded-lg bg-blue-500/20 px-2.5 py-1 text-[10px] font-bold text-blue-400 hover:bg-blue-500/30"
                            >
                              Marcar Entregado
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Catalog Grid Section */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">
                Catálogo de Productos Activos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      {p.category?.name || "Menú"}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">
                      {p.name}
                    </h4>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-400">{p.unit}</span>
                      <span className="text-sm font-black text-emerald-400">
                        ${Number(p.price).toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REPORTES & AUDITORIA */}
        {activeTab === "REPORTS" && (
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-950">
            <div>
              <h2 className="text-xl font-bold text-white">
                Dashboard de Métricas & Auditoría
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Indicadores clave de negocio y registros inmutables de auditoría
                del sistema
              </p>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Ventas Hoy ($ ARS)
                </span>
                <p className="mt-2 text-2xl font-black text-emerald-400">
                  $
                  {metrics?.revenueToday
                    ? metrics.revenueToday.toLocaleString("es-AR")
                    : "0"}
                </p>
                <span className="mt-2 inline-block text-[10px] font-medium text-emerald-500/80">
                  ↑ Snapshot de pedidos confirmados
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Pedidos Registrados Hoy
                </span>
                <p className="mt-2 text-2xl font-black text-white">
                  {metrics?.ordersTodayCount ?? 0}
                </p>
                <span className="mt-2 inline-block text-[10px] font-medium text-slate-500">
                  Modalidades Retira y Envío
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Conversaciones Activas
                </span>
                <p className="mt-2 text-2xl font-black text-amber-400">
                  {metrics?.activeConversations ?? 0}
                </p>
                <span className="mt-2 inline-block text-[10px] font-medium text-amber-500/80">
                  Atenciones en curso
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Clientes Registrados
                </span>
                <p className="mt-2 text-2xl font-black text-blue-400">
                  {metrics?.totalCustomers ?? 0}
                </p>
                <span className="mt-2 inline-block text-[10px] font-medium text-blue-500/80">
                  Base de contactos WhatsApp
                </span>
              </div>
            </div>

            {/* Audit Log Table */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">
                Registro de Auditoría de Operaciones
              </h3>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase">
                    <tr>
                      <th className="px-6 py-4">Fecha / Hora</th>
                      <th className="px-6 py-4">Acción</th>
                      <th className="px-6 py-4">Tipo de Entidad</th>
                      <th className="px-6 py-4">ID de Entidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          Sin registros de auditoría recientes.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr
                          key={log.id}
                          className="hover:bg-slate-800/30 transition"
                        >
                          <td className="px-6 py-4 text-slate-400 font-mono">
                            {new Date(log.createdAt).toLocaleString("es-AR")}
                          </td>
                          <td className="px-6 py-4 font-bold text-amber-400">
                            {log.action}
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded-md bg-slate-800 px-2 py-0.5 font-semibold text-slate-300">
                              {log.entityType}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-[10px] text-slate-400">
                            {log.entityId}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PANEL DE ADMINISTRACION & CONFIGURACION */}
        {activeTab === "ADMIN" && (
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-950">
            <div>
              <h2 className="text-xl font-bold text-white">
                ⚙️ Panel de Administración & Personalización
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configurá de forma dinámica categorías, productos, precios,
                plantillas de chat y operadores
              </p>
            </div>

            {/* Admin Sub-Tab Selector */}
            <div className="flex space-x-2 border-b border-slate-800 pb-4">
              <button
                onClick={() => setAdminSubTab("CATALOG")}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  adminSubTab === "CATALOG"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                🍕 Catálogo & Precios
              </button>
              <button
                onClick={() => setAdminSubTab("QUICK_REPLIES")}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  adminSubTab === "QUICK_REPLIES"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                ⚡ Respuestas Rápidas (Plantillas)
              </button>
              <button
                onClick={() => setAdminSubTab("OPERATORS")}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  adminSubTab === "OPERATORS"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                👥 Operadores & Usuarios
              </button>
            </div>

            {/* SUB-TAB 1: CATALOGO & PRECIOS */}
            {adminSubTab === "CATALOG" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Alta de Categoría */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
                  <h3 className="text-base font-bold text-white">
                    Alta de Nueva Categoría
                  </h3>
                  {catStatusMsg && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400">
                      {catStatusMsg}
                    </div>
                  )}
                  <form
                    onSubmit={handleCreateCategory}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block font-semibold text-slate-400">
                        Nombre de la Categoría
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Postres, Promos Especiales, Minutas"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-400">
                        Descripción (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Menú especial de postres artesanales"
                        value={newCatDesc}
                        onChange={(e) => setNewCatDesc(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400"
                    >
                      Guardar Categoría 📁
                    </button>
                  </form>
                </div>

                {/* Form Alta de Producto */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
                  <h3 className="text-base font-bold text-white">
                    Alta de Nuevo Producto / Sabor
                  </h3>
                  {prodStatusMsg && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400">
                      {prodStatusMsg}
                    </div>
                  )}
                  <form
                    onSubmit={handleCreateProduct}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block font-semibold text-slate-400">
                        Categoría
                      </label>
                      <select
                        value={newProdCatId}
                        onChange={(e) => setNewProdCatId(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-400">
                        Nombre del Producto / Sabor
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Pizza Napolitana con Fainá"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-400">
                          Precio ($ ARS)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          required
                          placeholder="Ej: 14500"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-400">
                          Unidad de Medida
                        </label>
                        <select
                          value={newProdUnit}
                          onChange={(e) => setNewProdUnit(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white"
                        >
                          <option value="unidad">unidad</option>
                          <option value="docena">docena</option>
                          <option value="medio docena">media docena</option>
                          <option value="porcion">porción</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400"
                    >
                      Guardar Producto en el Menú 🍕
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: RESPUESTAS RÁPIDAS (PLANTILLAS) */}
            {adminSubTab === "QUICK_REPLIES" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Alta de Plantilla */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
                  <h3 className="text-base font-bold text-white">
                    Crear Nueva Respuesta Rápida
                  </h3>
                  {qrStatusMsg && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400">
                      {qrStatusMsg}
                    </div>
                  )}
                  <form
                    onSubmit={handleCreateQuickReply}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-400">
                          Atajo (ej: /alias)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="/alias"
                          value={qrShortcut}
                          onChange={(e) => setQrShortcut(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-400">
                          Título Identificador
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Datos de Pago CBU"
                          value={qrTitle}
                          onChange={(e) => setQrTitle(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-400">
                        Mensaje Completo para WhatsApp
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Ej: CBU Mercado Pago: 00000031000... Alias: SANTA.CATALINA.PIZZA. Titular: Santa Catalina SRL"
                        value={qrContent}
                        onChange={(e) => setQrContent(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-400">
                        Categoría
                      </label>
                      <input
                        type="text"
                        placeholder="General, Pagos, Horarios"
                        value={qrCategory}
                        onChange={(e) => setQrCategory(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400"
                    >
                      Guardar Respuesta Rápida ⚡
                    </button>
                  </form>
                </div>

                {/* Lista de Plantillas Guardadas */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
                  <h3 className="text-base font-bold text-white">
                    Plantillas Registradas
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {quickReplies.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-8">
                        Sin respuestas rápidas configuradas.
                      </p>
                    ) : (
                      quickReplies.map((qr) => (
                        <div
                          key={qr.id}
                          className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-400 text-xs">
                              {qr.shortcut} — {qr.title}
                            </span>
                            <button
                              onClick={() => handleDeleteQuickReply(qr.id)}
                              className="text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-1 rounded-lg"
                            >
                              Eliminar 🗑️
                            </button>
                          </div>
                          <p className="text-xs text-slate-300 whitespace-pre-wrap">
                            {qr.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: OPERADORES & USUARIOS */}
            {adminSubTab === "OPERATORS" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Alta de Operador */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
                  <h3 className="text-base font-bold text-white">
                    Dar de Alta Nuevo Operador
                  </h3>
                  {opStatusMsg && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400">
                      {opStatusMsg}
                    </div>
                  )}
                  <form
                    onSubmit={handleCreateOperator}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block font-semibold text-slate-400">
                        Nombre Completo del Empleado
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Mariana Gómez"
                        value={opName}
                        onChange={(e) => setOpName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-400">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="ejemplo@santacatalina.local"
                        value={opEmail}
                        onChange={(e) => setOpEmail(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-400">
                        Contraseña de Acceso
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={opPassword}
                        onChange={(e) => setOpPassword(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-400">
                        Rol del Usuario
                      </label>
                      <select
                        value={opRole}
                        onChange={(e) =>
                          setOpRole(
                            e.target.value as
                              | "TELEFONISTA"
                              | "SUPERVISOR"
                              | "ADMINISTRADOR",
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white"
                      >
                        <option value="TELEFONISTA">
                          TELEFONISTA (Atención y Toma de Pedidos)
                        </option>
                        <option value="SUPERVISOR">
                          SUPERVISOR (Control de Atenciones)
                        </option>
                        <option value="ADMINISTRADOR">
                          ADMINISTRADOR (Acceso Total)
                        </option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400"
                    >
                      Registrar Operador 👥
                    </button>
                  </form>
                </div>

                {/* Lista de Operadores */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
                  <h3 className="text-base font-bold text-white">
                    Personal Registrado
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {operatorUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"
                      >
                        <div>
                          <p className="font-bold text-white text-xs">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {u.email}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-[10px] font-extrabold text-amber-400">
                          {u.userRoles?.[0]?.role.name || "TELEFONISTA"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para Tomar Pedido */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Tomar Nuevo Pedido</h3>
            <p className="mt-1 text-xs text-slate-400">
              Cliente:{" "}
              {selectedConversation?.customer.displayName ||
                selectedConversation?.customer.whatsappNumber}
            </p>

            {orderStatusMsg && (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400">
                {orderStatusMsg}
              </div>
            )}

            <form
              onSubmit={handleCreateOrder}
              className="mt-4 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-400">
                  Modalidad de Entrega
                </label>
                <div className="mt-1 flex space-x-2">
                  {(["RETIRA", "ENVIO"] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setFulfillmentType(m)}
                      className={`flex-1 rounded-xl py-2 font-bold ${
                        fulfillmentType === m
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {m === "RETIRA"
                        ? "🏃 Retira por Sede"
                        : "🛵 Envío a Domicilio"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-400">
                  Producto del Menú
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${Number(p.price).toLocaleString("es-AR")} (
                      {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-400">
                  Cantidad
                </label>
                <input
                  type="number"
                  min={1}
                  value={orderQuantity}
                  onChange={(e) =>
                    setOrderQuantity(parseInt(e.target.value, 10) || 1)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400">
                  Notas / Aclaraciones
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sin cebolla, abonará en efectivo con $10.000"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="rounded-xl bg-slate-800 px-4 py-2.5 font-bold text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-6 py-2.5 font-bold text-slate-950 hover:bg-amber-400"
                >
                  Confirmar Pedido 🍕
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
