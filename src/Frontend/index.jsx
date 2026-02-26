// // import React, { useState, useEffect, useCallback, useRef } from "react";
// // import axios from "axios";
// // import "./index.css";

// // const BACKEND = "http://localhost:5002";
// // const REFRESH_INTERVAL = 10000;
// // const ORDER_TYPE = { 1: "Takeaway", 2: "Dine-In", 3: "Delivery" };
// // const ORDER_TYPE_ICON = { 1: "🥡", 2: "🍽️", 3: "🛵" };

// // // ── Print buttons — kitchen | billing | all
// // function PrintButtons({ orderId, onPrint, printState }) {
// //     const ps = printState[orderId];
// //     const isLoading = (t) => ps?.loading === t;
// //     const anyLoading = !!ps?.loading;

// //     return (
// //         <div className="print-actions">
// //             <button
// //                 className="print-btn btn-kitchen"
// //                 disabled={anyLoading}
// //                 onClick={(e) => onPrint(e, orderId, "kitchen")}
// //                 title="Kitchen ticket — no prices"
// //             >
// //                 {isLoading("kitchen") ? <span className="btn-spinner" /> : "🔥"} Kitchen
// //             </button>

// //             <button
// //                 className="print-btn btn-billing"
// //                 disabled={anyLoading}
// //                 onClick={(e) => onPrint(e, orderId, "billing")}
// //                 title="Billing receipt — prices + total"
// //             >
// //                 {isLoading("billing") ? <span className="btn-spinner" /> : "🧾"} Bill
// //             </button>

// //             <button
// //                 className="print-btn btn-all"
// //                 disabled={anyLoading}
// //                 onClick={(e) => onPrint(e, orderId, "all")}
// //                 title="Print kitchen ticket + billing receipt"
// //             >
// //                 {isLoading("all") ? <span className="btn-spinner" /> : "🖨"} All
// //             </button>
// //         </div>
// //     );
// // }

// // export default function App() {
// //     const [orders, setOrders] = useState([]);
// //     const [items, setItems] = useState([]);
// //     const [loading, setLoading] = useState(true);
// //     const [lastRefresh, setRefresh] = useState(null);
// //     const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
// //     const [search, setSearch] = useState("");
// //     const [filterPrint, setFilter] = useState("all");
// //     const [filterType, setFilterType] = useState("all");
// //     const [expanded, setExpanded] = useState(null);
// //     const [printState, setPrintState] = useState({});
// //     const [printerOnline, setPrinterOnline] = useState(null);
// //     const [toast, setToast] = useState(null);
// //     const countRef = useRef(REFRESH_INTERVAL / 1000);

// //     const showToast = (msg, type = "success") => {
// //         setToast({ msg, type });
// //         setTimeout(() => setToast(null), 3500);
// //     };

// //     const fetchData = useCallback(async (silent = false) => {
// //         if (!silent) setLoading(true);
// //         try {
// //             const [oRes, iRes] = await Promise.all([
// //                 axios.get(`${BACKEND}/orders`),
// //                 axios.get(`${BACKEND}/orderitems`),
// //             ]);
// //             setOrders((oRes.data.data || []).sort((a, b) => b.id - a.id));
// //             setItems(iRes.data.data || []);
// //             setRefresh(new Date());
// //             countRef.current = REFRESH_INTERVAL / 1000;
// //             setCountdown(REFRESH_INTERVAL / 1000);
// //         } catch {
// //             showToast("Cannot reach backend — is index.js running?", "error");
// //         } finally {
// //             setLoading(false);
// //         }
// //     }, []);

// //     const fetchPrinterStatus = useCallback(async () => {
// //         try {
// //             const res = await axios.get(`${BACKEND}/printer-status`);
// //             setPrinterOnline(res.data?.connected ?? false);
// //         } catch {
// //             setPrinterOnline(false);
// //         }
// //     }, []);

// //     useEffect(() => {
// //         fetchData();
// //         fetchPrinterStatus();
// //         const d = setInterval(() => fetchData(true), REFRESH_INTERVAL);
// //         const s = setInterval(fetchPrinterStatus, 30000);
// //         return () => { clearInterval(d); clearInterval(s); };
// //     }, [fetchData, fetchPrinterStatus]);

// //     // countdown ticker
// //     useEffect(() => {
// //         const tick = setInterval(() => {
// //             countRef.current = Math.max(0, countRef.current - 1);
// //             setCountdown(countRef.current);
// //         }, 1000);
// //         return () => clearInterval(tick);
// //     }, []);

// //     const handlePrint = async (e, orderId, target) => {
// //         e.stopPropagation();
// //         setPrintState((p) => ({ ...p, [orderId]: { loading: target } }));
// //         try {
// //             const data = await axios.post(`${BACKEND}/print/${orderId}`, { target });
// //             setPrintState((p) => ({ ...p, [orderId]: { loading: null } }));
// //             if (data.data.errors?.length > 0) {
// //                 showToast(`⚠️ ${data.data.message}`, "warning");
// //             } else {
// //                 showToast(`✅ ${data.data.message}`, "success");
// //             }
// //             fetchData(true);
// //         } catch (err) {
// //             setPrintState((p) => ({ ...p, [orderId]: { loading: null } }));
// //             showToast(`❌ ${err.response?.data?.message || err.message}`, "error");
// //         }
// //     };

// //     const getOrderItems = (id) => items.filter((i) => i.order_id === id && i.status !== "cancel");
// //     const getTotal = (id) => getOrderItems(id).reduce((s, i) => s + parseFloat(i.final_price || 0), 0);

// //     const filtered = orders.filter((o) => {
// //         if (filterPrint !== "all" && o.print_status !== filterPrint) return false;
// //         if (filterType !== "all" && String(o.order_type) !== filterType) return false;
// //         if (search) {
// //             const q = search.toLowerCase();
// //             return (
// //                 (o.order_code || "").toLowerCase().includes(q) ||
// //                 (o.cust_name || "").toLowerCase().includes(q) ||
// //                 (o.cust_num || "").includes(q) ||
// //                 String(o.id).includes(q)
// //             );
// //         }
// //         return true;
// //     });

// //     const counts = {
// //         not_printed: orders.filter((o) => o.print_status === "not_printed").length,
// //         need_print: orders.filter((o) => o.print_status === "need_print").length,
// //         printed: orders.filter((o) => o.print_status === "printed").length,
// //     };

// //     return (
// //         <div className="app">
// //             {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

// //             {/* ── Header ── */}
// //             <header className="header">
// //                 <div className="header-left">
// //                     <div className="header-logo">🖨️</div>
// //                     <div>
// //                         <h1 className="header-title">VPOS Order Printer</h1>
// //                         <p className="header-sub">
// //                             Last: {lastRefresh ? lastRefresh.toLocaleTimeString() : "—"}
// //                             &nbsp;·&nbsp;Next in <span className="countdown-num">{countdown}s</span>
// //                         </p>
// //                     </div>
// //                 </div>
// //                 <div className="header-right">
// //                     <span
// //                         className={`printer-pill ${printerOnline === null ? "pill-checking"
// //                             : printerOnline ? "pill-online" : "pill-offline"
// //                             }`}
// //                         title="USB Printer status"
// //                     >
// //                         🖨 USB &nbsp;
// //                         {printerOnline === null ? "checking…" : printerOnline ? "● Online" : "○ Offline"}
// //                     </span>
// //                     <button className="refresh-btn" onClick={() => fetchData()}>↻ Refresh</button>
// //                 </div>
// //             </header>

// //             {/* ── Stats ── */}
// //             <div className="stats-bar">
// //                 <div className="stat-card">
// //                     <span className="stat-num">{orders.length}</span>
// //                     <span className="stat-label">Total</span>
// //                 </div>
// //                 <div className="stat-card stat-red">
// //                     <span className="stat-num">{counts.not_printed}</span>
// //                     <span className="stat-label">Not Printed</span>
// //                 </div>
// //                 <div className="stat-card stat-orange">
// //                     <span className="stat-num">{counts.need_print}</span>
// //                     <span className="stat-label">Need Print</span>
// //                 </div>
// //                 <div className="stat-card stat-green">
// //                     <span className="stat-num">{counts.printed}</span>
// //                     <span className="stat-label">Printed</span>
// //                 </div>
// //             </div>

// //             {/* ── Filters ── */}
// //             <div className="filters">
// //                 <div className="search-wrap">
// //                     <span className="search-icon">🔍</span>
// //                     <input
// //                         className="search-input"
// //                         type="text"
// //                         placeholder="Search #, name, phone..."
// //                         value={search}
// //                         onChange={(e) => setSearch(e.target.value)}
// //                     />
// //                     {search && <button className="search-clear" onClick={() => setSearch("")}>✕</button>}
// //                 </div>
// //                 <select className="filter-select" value={filterPrint} onChange={(e) => setFilter(e.target.value)}>
// //                     <option value="all">All Print Status</option>
// //                     <option value="not_printed">Not Printed</option>
// //                     <option value="need_print">Need Print</option>
// //                     <option value="printed">Printed</option>
// //                 </select>
// //                 <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
// //                     <option value="all">All Types</option>
// //                     <option value="1">🥡 Takeaway</option>
// //                     <option value="2">🍽️ Dine-In</option>
// //                     <option value="3">🛵 Delivery</option>
// //                 </select>
// //                 <span className="result-count">{filtered.length} of {orders.length} orders</span>
// //             </div>

// //             {/* ── Table ── */}
// //             {loading ? (
// //                 <div className="loading-state"><div className="spinner" /><p>Loading orders...</p></div>
// //             ) : filtered.length === 0 ? (
// //                 <div className="empty-state"><p className="empty-icon">📭</p><p>No orders match filters</p></div>
// //             ) : (
// //                 <div className="table-wrapper">
// //                     <table className="orders-table">
// //                         <thead>
// //                             <tr>
// //                                 <th>Order</th>
// //                                 <th>Customer</th>
// //                                 <th>Type</th>
// //                                 <th>Order Status</th>
// //                                 <th>Print Status</th>
// //                                 <th className="align-right">Total</th>
// //                                 <th>Time</th>
// //                                 <th className="actions-col">Print</th>
// //                             </tr>
// //                         </thead>
// //                         <tbody>
// //                             {filtered.map((order) => {
// //                                 const isExpanded = expanded === order.id;
// //                                 const orderItems = getOrderItems(order.id);
// //                                 const total = getTotal(order.id);
// //                                 const dispTotal = total > 0 ? `$${total.toFixed(2)}`
// //                                     : order.order_value ? `$${order.order_value}` : "—";

// //                                 return (
// //                                     <React.Fragment key={order.id}>

// //                                         {/* ── Order Row ── */}
// //                                         <tr
// //                                             className={`order-row ${isExpanded ? "row-expanded" : ""}`}
// //                                             onClick={() => setExpanded(isExpanded ? null : order.id)}
// //                                         >
// //                                             <td>
// //                                                 <div className="order-id">#{order.id}</div>
// //                                                 <div className="order-code">{order.order_code}</div>
// //                                             </td>
// //                                             <td>
// //                                                 <div className="cust-name">{order.cust_name || <span className="muted">—</span>}</div>
// //                                                 {order.cust_num && <div className="cust-phone">📞 {order.cust_num}</div>}
// //                                                 {order.table_name && <div className="cust-table">🪑 {order.table_name}</div>}
// //                                                 {order.sp_instructions && <div className="cust-note">📝 {order.sp_instructions}</div>}
// //                                             </td>
// //                                             <td>
// //                                                 <span className={`type-badge type-${order.order_type}`}>
// //                                                     {ORDER_TYPE_ICON[order.order_type]} {ORDER_TYPE[order.order_type] || "?"}
// //                                                 </span>
// //                                                 {order.partner_name && <div className="partner-name">{order.partner_name}</div>}
// //                                             </td>
// //                                             <td>
// //                                                 <span className={`badge badge-${order.order_status}`}>{order.order_status}</span>
// //                                             </td>
// //                                             <td>
// //                                                 <span className={`badge badge-${order.print_status}`}>
// //                                                     {(order.print_status || "").replace(/_/g, " ")}
// //                                                 </span>
// //                                             </td>
// //                                             <td className="total-value">{dispTotal}</td>
// //                                             <td className="order-time">{(order.order_at || "").slice(5, 16)}</td>
// //                                             <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
// //                                                 <PrintButtons orderId={order.id} onPrint={handlePrint} printState={printState} />
// //                                             </td>
// //                                         </tr>

// //                                         {/* ── Expanded Items Panel ── */}
// //                                         {isExpanded && (
// //                                             <tr className="items-row">
// //                                                 <td colSpan={8}>
// //                                                     <div className="items-expand">
// //                                                         <div className="items-header">
// //                                                             <span className="items-label">
// //                                                                 📋 {orderItems.length} item{orderItems.length !== 1 ? "s" : ""}
// //                                                                 {order.cust_name ? ` — ${order.cust_name}` : ""}
// //                                                                 {order.table_name ? ` · Table ${order.table_name}` : ""}
// //                                                             </span>
// //                                                             <div className="expand-print-bar">
// //                                                                 <span className="expand-print-label">Print:</span>
// //                                                                 <PrintButtons orderId={order.id} onPrint={handlePrint} printState={printState} />
// //                                                             </div>
// //                                                         </div>

// //                                                         {orderItems.length === 0 ? (
// //                                                             <p className="no-items">No items found.</p>
// //                                                         ) : (
// //                                                             <table className="items-inner-table">
// //                                                                 <thead>
// //                                                                     <tr>
// //                                                                         <th>Item Name</th>
// //                                                                         <th>Instruction</th>
// //                                                                         <th className="align-center">Qty</th>
// //                                                                         <th className="align-right">Unit Price</th>
// //                                                                         <th className="align-right">Line Total</th>
// //                                                                     </tr>
// //                                                                 </thead>
// //                                                                 <tbody>
// //                                                                     {orderItems.map((item) => (
// //                                                                         <tr key={item.id}>
// //                                                                             <td className="item-name">{item.itemname}</td>
// //                                                                             <td className="item-instruction">
// //                                                                                 {item.instruction
// //                                                                                     ? <span className="instruction-tag">{item.instruction}</span>
// //                                                                                     : <span className="muted">—</span>}
// //                                                                             </td>
// //                                                                             <td className="align-center item-qty">×{item.qty}</td>
// //                                                                             <td className="align-right">${parseFloat(item.base_price).toFixed(2)}</td>
// //                                                                             <td className="align-right item-total">${parseFloat(item.final_price).toFixed(2)}</td>
// //                                                                         </tr>
// //                                                                     ))}
// //                                                                 </tbody>
// //                                                                 <tfoot>
// //                                                                     <tr className="total-row">
// //                                                                         <td colSpan={3} />
// //                                                                         <td className="align-right total-label">ORDER TOTAL</td>
// //                                                                         <td className="align-right total-amount">${total.toFixed(2)}</td>
// //                                                                     </tr>
// //                                                                 </tfoot>
// //                                                             </table>
// //                                                         )}
// //                                                     </div>
// //                                                 </td>
// //                                             </tr>
// //                                         )}

// //                                     </React.Fragment>
// //                                 );
// //                             })}
// //                         </tbody>
// //                     </table>
// //                 </div>
// //             )}
// //         </div>
// //     );
// // }




























































import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import "./index.css";

const BACKEND = "https://thermalprinter.onrender.com";
const REFRESH_INTERVAL = 15000;

// ── Print buttons: Kitchen | Bill | All | Auto
function PrintButtons({ orderId, onPrint, printState }) {
    const ps = printState[orderId];
    const isLoading = (t) => ps?.loading === t;
    const anyLoading = !!ps?.loading;

    return (
        <div className="print-actions">
            <button
                className="print-btn btn-kitchen"
                disabled={anyLoading}
                onClick={(e) => onPrint(e, orderId, "kitchen")}
                title="Kitchen ticket — no prices"
            >
                {isLoading("kitchen") ? <span className="btn-spinner" /> : "🔥"} Kitchen
            </button>

            <button
                className="print-btn btn-billing"
                disabled={anyLoading}
                onClick={(e) => onPrint(e, orderId, "billing")}
                title="Billing receipt — prices + total"
            >
                {isLoading("billing") ? <span className="btn-spinner" /> : "🧾"} Bill
            </button>

            <button
                className="print-btn btn-all"
                disabled={anyLoading}
                onClick={(e) => onPrint(e, orderId, "all")}
                title="Both kitchen + billing"
            >
                {isLoading("all") ? <span className="btn-spinner" /> : "🖨"} All
            </button>

            <button
                className="print-btn btn-auto"
                disabled={anyLoading}
                onClick={(e) => onPrint(e, orderId, "auto")}
                title="Print based on where_to_print field"
            >
                {isLoading("auto") ? <span className="btn-spinner" /> : "⚡"} Auto
            </button>
        </div>
    );
}

export default function App() {
    const [orders, setOrders] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setRefresh] = useState(null);
    const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
    const [search, setSearch] = useState("");
    const [filterPrint, setFilter] = useState("all");
    const [filterWtp, setFilterWtp] = useState("all");
    const [expanded, setExpanded] = useState(null);
    const [printState, setPrintState] = useState({});
    const [printerOnline, setPrinterOnline] = useState(null);
    const [toast, setToast] = useState(null);
    const countRef = useRef(REFRESH_INTERVAL / 1000);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Fetch orders + items from backend (which proxies pngspace.com)
    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [oRes, iRes] = await Promise.all([
                axios.get(`${BACKEND}/orders`),
                axios.get(`${BACKEND}/orderitems`),
            ]);
            // Sort newest first by numeric id
            setOrders((oRes.data.data || []).sort((a, b) => Number(b.id) - Number(a.id)));
            setItems(iRes.data.data || []);
            setRefresh(new Date());
            countRef.current = REFRESH_INTERVAL / 1000;
            setCountdown(REFRESH_INTERVAL / 1000);
        } catch {
            showToast("Cannot reach backend — is index.js running?", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPrinterStatus = useCallback(async () => {
        try {
            const res = await axios.get(`${BACKEND}/printer-status`);
            setPrinterOnline(res.data?.connected ?? false);
        } catch {
            setPrinterOnline(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        fetchPrinterStatus();
        const d = setInterval(() => fetchData(true), REFRESH_INTERVAL);
        const s = setInterval(fetchPrinterStatus, 30000);
        return () => { clearInterval(d); clearInterval(s); };
    }, [fetchData, fetchPrinterStatus]);

    // Countdown ticker
    useEffect(() => {
        const tick = setInterval(() => {
            countRef.current = Math.max(0, countRef.current - 1);
            setCountdown(countRef.current);
        }, 1000);
        return () => clearInterval(tick);
    }, []);

    // ── Print handler
    // orderId = order.order_id string e.g. "ORD1001"
    const handlePrint = async (e, orderId, target) => {
        e.stopPropagation();
        setPrintState((p) => ({ ...p, [orderId]: { loading: target } }));
        try {
            const res = await axios.post(`${BACKEND}/print/${orderId}`, { target });
            setPrintState((p) => ({ ...p, [orderId]: { loading: null } }));
            if (res.data.errors?.length > 0) {
                showToast(`⚠️ ${res.data.message}`, "warning");
            } else {
                showToast(`✅ ${res.data.message}`, "success");
            }
            fetchData(true);
        } catch (err) {
            setPrintState((p) => ({ ...p, [orderId]: { loading: null } }));
            showToast(`❌ ${err.response?.data?.message || err.message}`, "error");
        }
    };

    // ── Helpers — new API uses order_id string, item_name, price (no qty)
    const getOrderItems = (orderId) =>
        items.filter((i) => String(i.order_id) === String(orderId));

    const getTotal = (orderId) =>
        getOrderItems(orderId).reduce((s, i) => s + parseFloat(i.price || 0), 0);

    // ── Filter
    const filtered = orders.filter((o) => {
        if (filterPrint !== "all" && o.print_status !== filterPrint) return false;
        if (filterWtp !== "all" && o.where_to_print !== filterWtp) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                (o.order_id || "").toLowerCase().includes(q) ||
                (o.order_name || "").toLowerCase().includes(q)
            );
        }
        return true;
    });

    const counts = {
        not_printed: orders.filter((o) => o.print_status === "not_printed").length,
        need_print: orders.filter((o) => o.print_status === "need_print").length,
        printed: orders.filter((o) => o.print_status === "printed").length,
    };

    // where_to_print badge styles
    const wtpClass = { kitchen: "wtp-kitchen", billing: "wtp-billing", both: "wtp-both" };
    const wtpLabel = { kitchen: "🔥 Kitchen", billing: "🧾 Billing", both: "🔥🧾 Both" };

    return (
        <div className="app">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

            {/* ── Header ── */}
            <header className="header">
                <div className="header-left">
                    <div className="header-logo">🍛</div>
                    <div>
                        <h1 className="header-title">VPOS Order Printer</h1>
                        <p className="header-sub">
                            Last: {lastRefresh ? lastRefresh.toLocaleTimeString() : "—"}
                            &nbsp;·&nbsp;Next in <span className="countdown-num">{countdown}s</span>
                        </p>
                    </div>
                </div>
                <div className="header-right">
                    <span
                        className={`printer-pill ${printerOnline === null ? "pill-checking"
                            : printerOnline ? "pill-online" : "pill-offline"
                            }`}
                    >
                        🖨 USB&nbsp;
                        {printerOnline === null ? "checking…" : printerOnline ? "● Online" : "○ Offline"}
                    </span>
                    <button className="refresh-btn" onClick={() => fetchData()}>↻ Refresh</button>
                </div>
            </header>

            {/* ── Stats ── */}
            <div className="stats-bar">
                <div className="stat-card">
                    <span className="stat-num">{orders.length}</span>
                    <span className="stat-label">Total</span>
                </div>
                <div className="stat-card stat-red">
                    <span className="stat-num">{counts.not_printed}</span>
                    <span className="stat-label">Not Printed</span>
                </div>
                <div className="stat-card stat-orange">
                    <span className="stat-num">{counts.need_print}</span>
                    <span className="stat-label">Need Print</span>
                </div>
                <div className="stat-card stat-green">
                    <span className="stat-num">{counts.printed}</span>
                    <span className="stat-label">Printed</span>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="filters">
                <div className="search-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search order ID or name…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && <button className="search-clear" onClick={() => setSearch("")}>✕</button>}
                </div>

                <select className="filter-select" value={filterPrint} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All Print Status</option>
                    <option value="not_printed">Not Printed</option>
                    <option value="need_print">Need Print</option>
                    <option value="printed">Printed</option>
                </select>

                <select className="filter-select" value={filterWtp} onChange={(e) => setFilterWtp(e.target.value)}>
                    <option value="all">All Print Types</option>
                    <option value="kitchen">🔥 Kitchen</option>
                    <option value="billing">🧾 Billing</option>
                    <option value="both">🔥🧾 Both</option>
                </select>

                <span className="result-count">{filtered.length} of {orders.length} orders</span>
            </div>

            {/* ── Table ── */}
            {loading ? (
                <div className="loading-state"><div className="spinner" /><p>Loading orders...</p></div>
            ) : filtered.length === 0 ? (
                <div className="empty-state"><p className="empty-icon">📭</p><p>No orders match filters</p></div>
            ) : (
                <div className="table-wrapper">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Order Name</th>
                                <th>Print Type</th>
                                <th>Print Status</th>
                                <th className="align-right">Total</th>
                                <th>Time</th>
                                <th className="actions-col">Print</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((order) => {
                                const isExpanded = expanded === order.order_id;
                                const orderItems = getOrderItems(order.order_id);
                                const total = getTotal(order.order_id);

                                return (
                                    <React.Fragment key={order.order_id}>

                                        {/* ── Order Row ── */}
                                        <tr
                                            className={`order-row ${isExpanded ? "row-expanded" : ""}`}
                                            onClick={() => setExpanded(isExpanded ? null : order.order_id)}
                                        >
                                            {/* Order ID */}
                                            <td>
                                                <div className="order-id">{order.order_id}</div>
                                                <div className="order-code">#{order.id}</div>
                                            </td>

                                            {/* Order name — replaces old cust_name + table_name */}
                                            <td>
                                                <div className="cust-name">{order.order_name || <span className="muted">—</span>}</div>
                                            </td>

                                            {/* where_to_print */}
                                            <td>
                                                <span className={`type-badge ${wtpClass[order.where_to_print] || ""}`}>
                                                    {wtpLabel[order.where_to_print] || order.where_to_print || "—"}
                                                </span>
                                            </td>

                                            {/* Print status */}
                                            <td>
                                                <span className={`badge badge-${order.print_status}`}>
                                                    {(order.print_status || "").replace(/_/g, " ")}
                                                </span>
                                            </td>

                                            {/* Total */}
                                            <td className="total-value">${total.toFixed(2)}</td>

                                            {/* Time */}
                                            <td className="order-time">
                                                {(order.created_at || "").slice(5, 16)}
                                            </td>

                                            {/* Print buttons */}
                                            <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                                                <PrintButtons
                                                    orderId={order.order_id}
                                                    onPrint={handlePrint}
                                                    printState={printState}
                                                />
                                            </td>
                                        </tr>

                                        {/* ── Expanded Items Panel ── */}
                                        {isExpanded && (
                                            <tr className="items-row">
                                                <td colSpan={7}>
                                                    <div className="items-expand">
                                                        <div className="items-header">
                                                            <span className="items-label">
                                                                📋 {orderItems.length} item{orderItems.length !== 1 ? "s" : ""}
                                                                &nbsp;—&nbsp;{order.order_name}
                                                            </span>
                                                            <div className="expand-print-bar">
                                                                <span className="expand-print-label">Print:</span>
                                                                <PrintButtons
                                                                    orderId={order.order_id}
                                                                    onPrint={handlePrint}
                                                                    printState={printState}
                                                                />
                                                            </div>
                                                        </div>

                                                        {orderItems.length === 0 ? (
                                                            <p className="no-items">No items found.</p>
                                                        ) : (
                                                            <table className="items-inner-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Item ID</th>
                                                                        <th>Item Name</th>
                                                                        <th className="align-right">Price</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {orderItems.map((item) => (
                                                                        <tr key={item.id}>
                                                                            <td className="order-code">{item.item_id}</td>
                                                                            <td className="item-name">{item.item_name}</td>
                                                                            <td className="align-right item-total">
                                                                                ${parseFloat(item.price || 0).toFixed(2)}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                                <tfoot>
                                                                    <tr className="total-row">
                                                                        <td colSpan={2} />
                                                                        <td className="align-right total-amount">
                                                                            ${total.toFixed(2)}
                                                                        </td>
                                                                    </tr>
                                                                </tfoot>
                                                            </table>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}

                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}





























































// import React, { useState, useEffect, useCallback, useRef } from "react";
// import axios from "axios";
// import "./index.css";

// // ── Direct API endpoints (same as your new index.js)
// const API_ORDERS = "https://pngspace.com/orders_api.php";
// const API_ITEMS = (id) => `https://pngspace.com/order_items_api.php?order_id=${id}`;
// const API_UPDATE = "https://pngspace.com/update_print_status.php";
// const BACKEND = "http://localhost:5002";   // still used for printer-status + manual print
// const REFRESH_INTERVAL = 5000;                    // matches setInterval(checkOrders, 5000)

// // ── Print button (single "Reprint" since auto-print is handled by index.js)
// function ReprintButton({ orderId, onPrint, printState }) {
//     const ps = printState[orderId];
//     const loading = !!ps?.loading;
//     return (
//         <button
//             className="print-btn btn-billing"
//             disabled={loading}
//             onClick={(e) => onPrint(e, orderId)}
//             title="Reprint this order"
//         >
//             {loading ? <span className="btn-spinner" /> : "🖨️"} Reprint
//         </button>
//     );
// }

// export default function App() {
//     const [orders, setOrders] = useState([]);
//     const [itemsMap, setItemsMap] = useState({});   // { order_id: [items] }
//     const [loading, setLoading] = useState(true);
//     const [lastRefresh, setRefresh] = useState(null);
//     const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
//     const [search, setSearch] = useState("");
//     const [filterPrint, setFilter] = useState("all");
//     const [expanded, setExpanded] = useState(null);
//     const [printState, setPrintState] = useState({});
//     const [printerOnline, setPrinterOnline] = useState(null);
//     const [toast, setToast] = useState(null);
//     const countRef = useRef(REFRESH_INTERVAL / 1000);

//     const showToast = (msg, type = "success") => {
//         setToast({ msg, type });
//         setTimeout(() => setToast(null), 3500);
//     };

//     // ── Fetch all orders from pngspace.com (same URL as your new index.js)
//     const fetchOrders = useCallback(async (silent = false) => {
//         if (!silent) setLoading(true);
//         try {
//             const res = await axios.get(API_ORDERS);
//             const list = (res.data?.data || res.data || []).sort(
//                 (a, b) => Number(b.id) - Number(a.id)
//             );
//             setOrders(list);
//             setRefresh(new Date());
//             countRef.current = REFRESH_INTERVAL / 1000;
//             setCountdown(REFRESH_INTERVAL / 1000);
//         } catch {
//             showToast("Cannot reach pngspace.com API", "error");
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     // ── Fetch items for a single order (lazy — only when row is expanded)
//     const fetchItems = useCallback(async (orderId) => {
//         if (itemsMap[orderId]) return;   // already loaded
//         try {
//             const res = await axios.get(API_ITEMS(orderId));
//             const items = res.data?.data || res.data || [];
//             setItemsMap((prev) => ({ ...prev, [orderId]: items }));
//         } catch {
//             setItemsMap((prev) => ({ ...prev, [orderId]: [] }));
//         }
//     }, [itemsMap]);

//     // ── Printer status (from local backend)
//     const fetchPrinterStatus = useCallback(async () => {
//         try {
//             const res = await axios.get(`${BACKEND}/printer-status`);
//             setPrinterOnline(res.data?.connected ?? false);
//         } catch {
//             setPrinterOnline(false);
//         }
//     }, []);

//     // ── Auto-refresh every 5s (matching index.js setInterval)
//     useEffect(() => {
//         fetchOrders();
//         fetchPrinterStatus();
//         const d = setInterval(() => fetchOrders(true), REFRESH_INTERVAL);
//         const s = setInterval(fetchPrinterStatus, 30000);
//         return () => { clearInterval(d); clearInterval(s); };
//     }, [fetchOrders, fetchPrinterStatus]);

//     // ── Countdown ticker
//     useEffect(() => {
//         const tick = setInterval(() => {
//             countRef.current = Math.max(0, countRef.current - 1);
//             setCountdown(countRef.current);
//         }, 1000);
//         return () => clearInterval(tick);
//     }, []);

//     // ── Expand row → fetch items
//     const handleExpand = (orderId) => {
//         const next = expanded === orderId ? null : orderId;
//         setExpanded(next);
//         if (next) fetchItems(next);
//     };

//     // ── Manual reprint (posts to update endpoint to mark pending again, then index.js picks it up)
//     const handleReprint = async (e, orderId) => {
//         e.stopPropagation();
//         setPrintState((p) => ({ ...p, [orderId]: { loading: true } }));
//         try {
//             // Reset status to pending so index.js re-prints it automatically
//             await axios.post(API_UPDATE, { order_id: orderId, print_status: "pending" });
//             showToast(`✅ Order #${orderId} queued for reprint`, "success");
//             fetchOrders(true);
//         } catch (err) {
//             showToast(`❌ ${err.message}`, "error");
//         } finally {
//             setPrintState((p) => ({ ...p, [orderId]: { loading: false } }));
//         }
//     };

//     // ── Filter
//     const filtered = orders.filter((o) => {
//         if (filterPrint !== "all" && o.print_status !== filterPrint) return false;
//         if (search) {
//             const q = search.toLowerCase();
//             return (
//                 String(o.id).includes(q) ||
//                 (o.order_name || "").toLowerCase().includes(q) ||
//                 (o.cust_name || "").toLowerCase().includes(q)
//             );
//         }
//         return true;
//     });

//     const counts = {
//         pending: orders.filter((o) => o.print_status === "pending").length,
//         printed: orders.filter((o) => o.print_status === "printed").length,
//         total: orders.length,
//     };

//     // ── Print status badge colour
//     const badgeClass = (status) => {
//         if (status === "pending") return "badge-need_print";
//         if (status === "printed") return "badge-printed";
//         return "badge-not_printed";
//     };

//     return (
//         <div className="app">
//             {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

//             {/* ── Header ── */}
//             <header className="header">
//                 <div className="header-left">
//                     <div className="header-logo">🖨️</div>
//                     <div>
//                         <h1 className="header-title">PNG SPACE POS</h1>
//                         <p className="header-sub">
//                             Last: {lastRefresh ? lastRefresh.toLocaleTimeString() : "—"}
//                             &nbsp;·&nbsp;Next in <span className="countdown-num">{countdown}s</span>
//                         </p>
//                     </div>
//                 </div>
//                 <div className="header-right">
//                     <span
//                         className={`printer-pill ${printerOnline === null ? "pill-checking"
//                                 : printerOnline ? "pill-online"
//                                     : "pill-offline"
//                             }`}
//                         title="USB Printer (/dev/usb/lp0) — node-thermal-printer"
//                     >
//                         🖨 USB&nbsp;
//                         {printerOnline === null ? "checking…" : printerOnline ? "● Online" : "○ Offline"}
//                     </span>
//                     <button className="refresh-btn" onClick={() => fetchOrders()}>↻ Refresh</button>
//                 </div>
//             </header>

//             {/* ── Stats ── */}
//             <div className="stats-bar">
//                 <div className="stat-card">
//                     <span className="stat-num">{counts.total}</span>
//                     <span className="stat-label">Total Orders</span>
//                 </div>
//                 <div className="stat-card stat-orange">
//                     <span className="stat-num">{counts.pending}</span>
//                     <span className="stat-label">Pending Print</span>
//                 </div>
//                 <div className="stat-card stat-green">
//                     <span className="stat-num">{counts.printed}</span>
//                     <span className="stat-label">Printed</span>
//                 </div>
//                 <div className="stat-card">
//                     <span className="stat-num" style={{ fontSize: "0.9rem" }}>5s</span>
//                     <span className="stat-label">Auto-Poll</span>
//                 </div>
//             </div>

//             {/* ── Filters ── */}
//             <div className="filters">
//                 <div className="search-wrap">
//                     <span className="search-icon">🔍</span>
//                     <input
//                         className="search-input"
//                         type="text"
//                         placeholder="Search order ID or name…"
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                     />
//                     {search && (
//                         <button className="search-clear" onClick={() => setSearch("")}>✕</button>
//                     )}
//                 </div>

//                 <select
//                     className="filter-select"
//                     value={filterPrint}
//                     onChange={(e) => setFilter(e.target.value)}
//                 >
//                     <option value="all">All Print Status</option>
//                     <option value="pending">⏳ Pending</option>
//                     <option value="printed">✅ Printed</option>
//                 </select>

//                 <span className="result-count">{filtered.length} of {orders.length} orders</span>
//             </div>

//             {/* ── Table ── */}
//             {loading ? (
//                 <div className="loading-state">
//                     <div className="spinner" />
//                     <p>Loading orders…</p>
//                 </div>
//             ) : filtered.length === 0 ? (
//                 <div className="empty-state">
//                     <p className="empty-icon">📭</p>
//                     <p>No orders match filters</p>
//                 </div>
//             ) : (
//                 <div className="table-wrapper">
//                     <table className="orders-table">
//                         <thead>
//                             <tr>
//                                 <th>Order ID</th>
//                                 <th>Order Name</th>
//                                 <th>Print Status</th>
//                                 <th className="align-right">Total</th>
//                                 <th>Time</th>
//                                 <th className="actions-col">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {filtered.map((order) => {
//                                 const isExpanded = expanded === order.id;
//                                 const orderItems = itemsMap[order.id] || [];

//                                 return (
//                                     <React.Fragment key={order.id}>

//                                         {/* ── Order Row ── */}
//                                         <tr
//                                             className={`order-row ${isExpanded ? "row-expanded" : ""}`}
//                                             onClick={() => handleExpand(order.id)}
//                                         >
//                                             {/* Order ID */}
//                                             <td>
//                                                 <div className="order-id">#{order.id}</div>
//                                             </td>

//                                             {/* Order Name */}
//                                             <td>
//                                                 <div className="cust-name">
//                                                     {order.order_name || order.cust_name || (
//                                                         <span className="muted">—</span>
//                                                     )}
//                                                 </div>
//                                             </td>

//                                             {/* Print Status */}
//                                             <td>
//                                                 <span className={`badge ${badgeClass(order.print_status)}`}>
//                                                     {order.print_status === "pending"
//                                                         ? "⏳ Pending"
//                                                         : order.print_status === "printed"
//                                                             ? "✅ Printed"
//                                                             : order.print_status || "—"}
//                                                 </span>
//                                             </td>

//                                             {/* Total — from order.total (same field your JS prints) */}
//                                             <td className="total-value">
//                                                 {order.total ? `$${parseFloat(order.total).toFixed(2)}` : "—"}
//                                             </td>

//                                             {/* Time */}
//                                             <td className="order-time">
//                                                 {(order.created_at || order.order_at || "").slice(5, 16)}
//                                             </td>

//                                             {/* Reprint button */}
//                                             <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
//                                                 <ReprintButton
//                                                     orderId={order.id}
//                                                     onPrint={handleReprint}
//                                                     printState={printState}
//                                                 />
//                                             </td>
//                                         </tr>

//                                         {/* ── Expanded Items Panel ── */}
//                                         {isExpanded && (
//                                             <tr className="items-row">
//                                                 <td colSpan={6}>
//                                                     <div className="items-expand">
//                                                         <div className="items-header">
//                                                             <span className="items-label">
//                                                                 📋 Items for Order #{order.id}
//                                                                 {order.order_name ? ` — ${order.order_name}` : ""}
//                                                             </span>
//                                                         </div>

//                                                         {orderItems.length === 0 ? (
//                                                             <p className="no-items">
//                                                                 Loading items… (click to expand again if empty)
//                                                             </p>
//                                                         ) : (
//                                                             <table className="items-inner-table">
//                                                                 <thead>
//                                                                     <tr>
//                                                                         <th>Item Name</th>
//                                                                         <th className="align-center">Qty</th>
//                                                                         <th className="align-right">Price</th>
//                                                                     </tr>
//                                                                 </thead>
//                                                                 <tbody>
//                                                                     {/* item.name and item.qty — same fields index.js uses */}
//                                                                     {orderItems.map((item, idx) => (
//                                                                         <tr key={item.id || idx}>
//                                                                             <td className="item-name">{item.name}</td>
//                                                                             <td className="align-center item-qty">×{item.qty}</td>
//                                                                             <td className="align-right item-total">
//                                                                                 {item.price
//                                                                                     ? `$${parseFloat(item.price).toFixed(2)}`
//                                                                                     : "—"}
//                                                                             </td>
//                                                                         </tr>
//                                                                     ))}
//                                                                 </tbody>
//                                                                 <tfoot>
//                                                                     <tr className="total-row">
//                                                                         <td colSpan={2} className="align-right total-label">
//                                                                             ORDER TOTAL
//                                                                         </td>
//                                                                         <td className="align-right total-amount">
//                                                                             {order.total
//                                                                                 ? `$${parseFloat(order.total).toFixed(2)}`
//                                                                                 : "—"}
//                                                                         </td>
//                                                                     </tr>
//                                                                 </tfoot>
//                                                             </table>
//                                                         )}
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         )}

//                                     </React.Fragment>
//                                 );
//                             })}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// }