// const express = require("express");
// const cors = require("cors");
// const axios = require("axios");
// const mysql = require("mysql2/promise");
// const { printer: ThermalPrinter, types: PrinterTypes } = require("node-thermal-printer");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ══════════════════════════════════════════════════════════════════
// //  CONFIG
// // ══════════════════════════════════════════════════════════════════
// const CONFIG = {
//   ORDERS_API: "https://pngspace.com/orders_api.php",
//   ITEMS_API: "https://pngspace.com/order_items_api.php",
//   UPDATE_STATUS_URL: "https://pngspace.com/update_print_status.php",

//   STORE_NAME: "Mr. Biryani",
//   STORE_WEBSITE: "www.mrbiryani.com.au",
//   STORE_ABN: "97606050210",
//   STORE_ADDRESS: "73 Station St Pakenham VIC-3810",

// PRINTER: {
//   name: "USB Printer",
//   interface: "/dev/usb/lp0",   // Linux — change if needed
//   type: PrinterTypes.EPSON,
// },

//   DB: {
//     host: "localhost",
//     port: 3306,
//     user: "root",
//     password: "0112358",
//     database: "mrbiryani_db",
//   },

//   // ── Auto-print poll interval (milliseconds)
//   POLL_INTERVAL: 5000,   // 15 seconds
// };

// // ══════════════════════════════════════════════════════════════════
// //  DATABASE
// // ══════════════════════════════════════════════════════════════════
// let db;

// async function initDB() {
//   const bootstrap = await mysql.createConnection({
//     host: CONFIG.DB.host, port: CONFIG.DB.port,
//     user: CONFIG.DB.user, password: CONFIG.DB.password,
//   });
//   await bootstrap.execute(`CREATE DATABASE IF NOT EXISTS \`${CONFIG.DB.database}\``);
//   await bootstrap.end();

//   db = mysql.createPool({
//     host: CONFIG.DB.host, port: CONFIG.DB.port,
//     user: CONFIG.DB.user, password: CONFIG.DB.password,
//     database: CONFIG.DB.database,
//     waitForConnections: true, connectionLimit: 10,
//   });

//   await db.execute(`
//     CREATE TABLE IF NOT EXISTS print_log (
//       id            INT AUTO_INCREMENT PRIMARY KEY,
//       order_id      VARCHAR(64)  NOT NULL,
//       order_code    VARCHAR(64)  DEFAULT NULL,
//       print_target  VARCHAR(20)  NOT NULL,
//       print_status  VARCHAR(20)  NOT NULL DEFAULT 'printed',
//       reprint_count INT          NOT NULL DEFAULT 0,
//       printed_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
//       updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//       INDEX idx_order_id   (order_id),
//       INDEX idx_printed_at (printed_at)
//     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
//   `);
//   console.log("✅ DB ready — mrbiryani_db.print_log");
// }

// async function logPrint(orderId, orderCode, target) {
//   const [rows] = await db.execute(
//     "SELECT id FROM print_log WHERE order_id = ? LIMIT 1", [orderId]
//   );
//   if (rows.length > 0) {
//     await db.execute(
//       `UPDATE print_log SET print_target=?, print_status='reprinted',
//        reprint_count=reprint_count+1, printed_at=NOW() WHERE order_id=?`,
//       [target, orderId]
//     );
//   } else {
//     await db.execute(
//       `INSERT INTO print_log (order_id, order_code, print_target, print_status)
//        VALUES (?, ?, ?, 'printed')`,
//       [orderId, orderCode || null, target]
//     );
//   }
//   console.log("📝 DB logged — Order " + orderId);
// }

// // ══════════════════════════════════════════════════════════════════
// //  PRINTER FACTORY
// // ══════════════════════════════════════════════════════════════════
// function makePrinter() {
//   return new ThermalPrinter({
//     type: CONFIG.PRINTER.type,
//     interface: CONFIG.PRINTER.interface,
//     options: { timeout: 5000 },
//     width: 48,
//     characterSet: "PC437_USA",
//   });
// }

// // ══════════════════════════════════════════════════════════════════
// //  LAYOUT HELPERS
// // ══════════════════════════════════════════════════════════════════
// const TOTAL_W = 48;
// const CONTENT_W = 42;
// const MARGIN = " ".repeat(Math.floor((TOTAL_W - CONTENT_W) / 2));
// const SEP = MARGIN + "-".repeat(CONTENT_W);

// const ml = (t) => MARGIN + (t || "");
// const centre = (t) => {
//   const s = t || "";
//   return MARGIN + " ".repeat(Math.max(0, Math.floor((CONTENT_W - s.length) / 2))) + s;
// };
// const twoCol = (l, r) => {
//   const gap = Math.max(1, CONTENT_W - (l || "").length - (r || "").length);
//   return MARGIN + (l || "") + " ".repeat(gap) + (r || "");
// };
// const itemRowBilling = (name, price) => {
//   const n = (name.length > 30 ? name.slice(0, 29) + "." : name).padEnd(30);
//   const p = price.padStart(12);
//   return MARGIN + n + p;
// };

// // ══════════════════════════════════════════════════════════════════
// //  DATE HELPERS
// // ══════════════════════════════════════════════════════════════════
// function formatDateTime(dateStr) {
//   if (!dateStr) return "";
//   const d = new Date(dateStr);
//   const day = String(d.getDate()).padStart(2, "0");
//   const month = d.toLocaleString("en-AU", { month: "short" });
//   const year = d.getFullYear();
//   const time = d
//     .toLocaleString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true })
//     .toUpperCase();
//   return `${day}/${month}/${year} ${time}`;
// }

// function formatFullDate() {
//   const now = new Date();
//   const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//   const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//   const n = now.getDate();
//   const ord = [, "st", "nd", "rd"][((n % 100) - 20) % 10] || [, "st", "nd", "rd"][n % 100] || "th";
//   const time = now
//     .toLocaleString("en-AU", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
//     .toUpperCase();
//   return `${days[now.getDay()]} ${n}${ord} ${months[now.getMonth()]} ${now.getFullYear()} ${time}`;
// }

// // ══════════════════════════════════════════════════════════════════
// //  KITCHEN RECEIPT
// // ══════════════════════════════════════════════════════════════════
// async function printKitchenReceipt(order, items) {
//   const p = makePrinter();

//   p.println("");
//   p.setTextNormal();
//   p.println(centre("*** New Order ***"));
//   p.println(SEP);

//   p.bold(true);
//   p.setTextSize(0, 1);
//   p.println(centre(order.order_name.toUpperCase()));
//   p.setTextNormal();
//   p.bold(false);
//   p.println(SEP);

//   p.println(ml("Order ID: " + order.order_id));
//   p.println(SEP);
//   p.println(ml("Date Time: " + formatDateTime(order.created_at)));
//   p.println(SEP);

//   p.bold(true);
//   p.println(centre("Total Items #  " + items.length));
//   p.bold(false);
//   p.println(SEP);

//   for (const item of items) {
//     p.bold(true);
//     p.print(ml("  "));
//     p.bold(false);
//     p.println(item.item_name);
//   }
//   p.println(SEP);

//   p.bold(true);
//   p.setTextSize(1, 1);
//   p.println(centre(order.order_id));
//   p.setTextNormal();
//   p.bold(false);

//   p.println("");
//   p.println("");
//   p.cut();

//   try {
//     await p.execute();
//     console.log("✅ [Kitchen] Order " + order.order_id);
//     return { ok: true };
//   } catch (err) {
//     console.error("❌ [Kitchen] Order " + order.order_id + ": " + err.message);
//     return { ok: false, error: err.message };
//   }
// }

// // ══════════════════════════════════════════════════════════════════
// //  BILLING RECEIPT
// // ══════════════════════════════════════════════════════════════════
// async function printBillingReceipt(order, items) {
//   const p = makePrinter();
//   const total = items.reduce((s, i) => s + parseFloat(i.price || 0), 0);

//   p.println("");

//   p.bold(true);
//   p.setTextSize(0, 1);
//   p.println(centre(CONFIG.STORE_NAME));
//   p.setTextNormal();
//   p.bold(false);
//   p.println(centre(CONFIG.STORE_WEBSITE));
//   p.println(SEP);

//   p.println(ml("Order: " + order.order_id));
//   p.bold(true);
//   p.println(ml(order.order_name));
//   p.bold(false);
//   p.println(SEP);

//   p.bold(true);
//   p.println(centre("SALES INVOICE"));
//   p.bold(false);
//   p.println(SEP);

//   p.bold(true);
//   p.println(itemRowBilling("Item", "Price"));
//   p.bold(false);
//   p.println(SEP);

//   for (const item of items) {
//     p.println(itemRowBilling(
//       item.item_name,
//       "$" + parseFloat(item.price || 0).toFixed(2)
//     ));
//   }
//   p.println(SEP);

//   p.bold(true);
//   p.println(twoCol("TOTAL", "$" + total.toFixed(2)));
//   p.bold(false);
//   p.println(SEP);

//   p.bold(true);
//   p.setTextSize(0, 1);
//   p.println(twoCol("Paid", "$" + total.toFixed(2)));
//   p.setTextNormal();
//   p.bold(false);
//   p.println(SEP);

//   p.println(ml("ABN: " + CONFIG.STORE_ABN));
//   p.println(ml(CONFIG.STORE_ADDRESS));
//   p.println(SEP);

//   p.bold(true);
//   p.println(centre("--- THANK YOU ---"));
//   p.bold(false);
//   p.println(centre(formatFullDate()));

//   p.println("");
//   p.println("");
//   p.cut();

//   try {
//     await p.execute();
//     console.log("✅ [Billing] Order " + order.order_id);
//     return { ok: true };
//   } catch (err) {
//     console.error("❌ [Billing] Order " + order.order_id + ": " + err.message);
//     return { ok: false, error: err.message };
//   }
// }

// // ══════════════════════════════════════════════════════════════════
// //  API CALLS
// // ══════════════════════════════════════════════════════════════════
// async function fetchOrders() {
//   const res = await axios.get(CONFIG.ORDERS_API);
//   return res.data.data || [];
// }

// async function fetchOrderItems() {
//   const res = await axios.get(CONFIG.ITEMS_API);
//   return res.data.data || [];
// }

// async function markAsPrinted(orderId) {
//   try {
//     const res = await axios.post(CONFIG.UPDATE_STATUS_URL, {
//       order_id: orderId
//     }, {
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     });
//     console.log("✅ API status updated — Order " + orderId + " | " + JSON.stringify(res.data));
//   } catch (err) {
//     console.error("❌ API update failed for " + orderId + ": " + err.message);
//   }
// }

// // ══════════════════════════════════════════════════════════════════
// //  AUTO-PRINT LOOP  ← runs every 15 seconds automatically
// //  No frontend needed. Checks for pending orders and prints them.
// // ══════════════════════════════════════════════════════════════════
// let isPolling = false;   // prevent overlapping runs

// async function autoPrintLoop() {
//   if (isPolling) {
//     console.log("⏳ Previous poll still running, skipping...");
//     return;
//   }
//   isPolling = true;

//   try {
//     console.log(`\n🔄 [${new Date().toLocaleTimeString("en-AU")}] Checking for pending orders...`);

//     const [orders, allItems] = await Promise.all([fetchOrders(), fetchOrderItems()]);

//     // Filter only pending orders
//     const pending = orders.filter((o) => o.print_status === "need_print" || o.print_status === "not_printed");

//     if (pending.length === 0) {
//       console.log("📭 No pending orders.");
//     } else {
//       console.log(`📋 Found ${pending.length} pending order(s)`);
//     }

//     for (const order of pending) {
//       const orderId = order.order_id;
//       const orderItems = allItems.filter((i) => String(i.order_id) === String(orderId));

//       console.log(`🖨️  Printing Order ${orderId} — ${order.order_name} (${orderItems.length} items)`);

//       // Decide what to print based on where_to_print field
//       // Falls back to printing both if field is missing
//       const wtp = order.where_to_print || "both";
//       const printKitchen = wtp === "kitchen" || wtp === "both";
//       const printBilling = wtp === "billing" || wtp === "both";

//       const errors = [];
//       let anyOk = false;

//       if (printKitchen) {
//         const r = await printKitchenReceipt(order, orderItems);
//         if (r.ok) anyOk = true; else errors.push("Kitchen: " + r.error);
//       }

//       if (printBilling) {
//         const r = await printBillingReceipt(order, orderItems);
//         if (r.ok) anyOk = true; else errors.push("Billing: " + r.error);
//       }

//       if (anyOk) {
//         // Mark as printed on remote API
//         await markAsPrinted(orderId);
//         // Log to local DB
//         await logPrint(orderId, order.order_code || orderId, wtp);
//         console.log(`✅ Done — Order ${orderId}`);
//       } else {
//         console.error(`❌ All prints failed for Order ${orderId}: ${errors.join(" | ")}`);
//       }
//     }

//   } catch (err) {
//     console.error("❌ Auto-print loop error:", err.message);
//   } finally {
//     isPolling = false;
//   }
// }

// // ══════════════════════════════════════════════════════════════════
// //  REST ENDPOINTS  (still available for manual use / monitoring)
// // ══════════════════════════════════════════════════════════════════

// // Orders — proxied
// app.get("/orders", async (req, res) => {
//   try { res.json({ success: true, data: await fetchOrders() }); }
//   catch (err) { res.status(500).json({ success: false, message: err.message }); }
// });

// // Items — proxied
// app.get("/orderitems", async (req, res) => {
//   try { res.json({ success: true, data: await fetchOrderItems() }); }
//   catch (err) { res.status(500).json({ success: false, message: err.message }); }
// });

// // Manual print (target = "kitchen" | "billing" | "all" | "auto")
// app.post("/print/:orderId", async (req, res) => {
//   const orderId = req.params.orderId;
//   const target = req.body?.target || "all";
//   const errors = [];
//   let anyOk = false;

//   try {
//     const [orders, allItems] = await Promise.all([fetchOrders(), fetchOrderItems()]);

//     const order = orders.find((o) => String(o.order_id) === String(orderId));
//     if (!order) return res.status(404).json({ success: false, message: "Order " + orderId + " not found" });

//     const orderItems = allItems.filter((i) => String(i.order_id) === String(orderId));

//     let printKitchen = false;
//     let printBilling = false;

//     if (target === "auto") {
//       printKitchen = order.where_to_print === "kitchen" || order.where_to_print === "both";
//       printBilling = order.where_to_print === "billing" || order.where_to_print === "both";
//     } else {
//       printKitchen = target === "kitchen" || target === "all";
//       printBilling = target === "billing" || target === "all";
//     }

//     if (printKitchen) {
//       const r = await printKitchenReceipt(order, orderItems);
//       if (r.ok) anyOk = true; else errors.push("Kitchen: " + r.error);
//     }
//     if (printBilling) {
//       const r = await printBillingReceipt(order, orderItems);
//       if (r.ok) anyOk = true; else errors.push("Billing: " + r.error);
//     }

//     if (anyOk) {
//       await markAsPrinted(orderId);
//       await logPrint(orderId, order.order_code || orderId, target);
//     }

//     const labels = { kitchen: "Kitchen ticket", billing: "Billing receipt", all: "All", auto: "Auto" };
//     res.json({
//       success: anyOk,
//       message: errors.length > 0
//         ? (labels[target] || target) + " failed: " + errors.join(" | ")
//         : (labels[target] || target) + " printed successfully",
//       errors,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Printer status
// app.get("/printer-status", async (req, res) => {
//   try {
//     const p = makePrinter();
//     const connected = await p.isPrinterConnected();
//     res.json({ connected, name: CONFIG.PRINTER.name, interface: CONFIG.PRINTER.interface });
//   } catch (err) {
//     res.json({ connected: false, name: CONFIG.PRINTER.name, error: err.message });
//   }
// });

// // Print log
// app.get("/log", async (req, res) => {
//   try {
//     const [rows] = await db.execute("SELECT * FROM print_log ORDER BY printed_at DESC LIMIT 200");
//     res.json({ success: true, data: rows });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Poll status — useful for monitoring
// app.get("/poll-status", (req, res) => {
//   res.json({
//     polling: !isPolling,
//     interval_ms: CONFIG.POLL_INTERVAL,
//     next_check_in: CONFIG.POLL_INTERVAL / 1000 + "s",
//   });
// });

// // ══════════════════════════════════════════════════════════════════
// //  STARTUP
// // ══════════════════════════════════════════════════════════════════
// initDB()
//   .then(() => {
//     app.listen(5002, () => {
//       console.log("🚀 Server on port 5002");
//       console.log("📡 Orders API   : " + CONFIG.ORDERS_API);
//       console.log("📡 Items API    : " + CONFIG.ITEMS_API);
//       console.log("📡 Update URL   : " + CONFIG.UPDATE_STATUS_URL);
//       console.log("🖨️  USB          : " + CONFIG.PRINTER.interface);
//       console.log("🗄️  DB           : mrbiryani_db @ " + CONFIG.DB.host);
//       console.log(`⏱️  Auto-print   : every ${CONFIG.POLL_INTERVAL / 1000}s\n`);
//     });

//     // ── Run immediately on startup, then every 15 seconds
//     autoPrintLoop();
//     setInterval(autoPrintLoop, CONFIG.POLL_INTERVAL);
//   })
//   .catch((err) => {
//     console.error("❌ DB init failed:", err.message);
//     process.exit(1);
//   });



















































































// const axios = require("axios");
// const { printer: ThermalPrinter, types: PrinterTypes } = require("node-thermal-printer");

// // ══════════════════════════════════════════════════════════════════
// //  CONFIG  — only change these
// // ══════════════════════════════════════════════════════════════════
// const CONFIG = {
//   // ── APIs
//   ORDERS_API: "https://pngspace.com/orders_api.php",
//   ITEMS_API: "https://pngspace.com/order_items_api.php",
//   UPDATE_STATUS_URL: "https://pngspace.com/update_print_status.php",

//   // ── Store details (billing receipt)
//   STORE_NAME: "Mr. Biryani",
//   STORE_WEBSITE: "www.mrbiryani.com.au",
//   STORE_ABN: "97606050210",
//   STORE_ADDRESS: "73 Station St Pakenham VIC-3810",

//   // ── IP Printer — change to your printer's IP
//   // PRINTER: {
//   //   name: "Network Printer",
//   //   interface: "tcp://192.168.1.100",  // ← YOUR PRINTER IP HERE
//   //   type: PrinterTypes.EPSON,     // PrinterTypes.EPSON | PrinterTypes.STAR | PrinterTypes.CITIZEN
//   // }


//   PRINTER: {
//     name: "USB Printer",
//     interface: "/dev/usb/lp0",   // Linux — change if needed
//     type: PrinterTypes.EPSON,
//   }




//   ,

//   // ── Poll every 5 seconds
//   POLL_INTERVAL: 5000,

//   // ── Which statuses trigger auto-print
//   AUTO_PRINT_STATUSES: ["need_print", "not_printed"],
// };






// // async function getOrders() {
// //   const res = await axios.get("https://pngspace.com/orders_api.php");
// //   const orders = res.data.data || [];
// //   console.log("Total orders:", orders.length);
// //   console.log(orders);
// // }

// // getOrders();


// // async function getItems() {
// //   const res = await axios.get("https://pngspace.com/order_items_api.php");
// //   const items = res.data.data || [];
// //   console.log("Total items:", items.length);
// //   console.log(items);
// // }

// // getItems();



// async function logOrders() {
//   const res = await axios.get("https://vpos.net.au/api/getorders");
//   const orders = res.data; // plain array — no .data.data needed

//   console.log("─────────────────────────────────────────");
//   console.log(`Total orders: ${orders.length}`);
//   console.log("─────────────────────────────────────────");

//   orders.forEach(order => {
//     console.log(
//       `#${order.id} | ${order.order_code} | ${order.order_type === 1 ? "Takeaway" : order.order_type === 2 ? "Dine-In" : "Delivery"} | $${order.order_value ?? "?"} | ${order.print_status} | ${order.cust_name ?? "—"}`
//     );
//   });

//   // Log one full order to see all fields
//   console.log("\n── Sample full order object ──");
//   console.log(JSON.stringify(orders[0], null, 2));
// }

// logOrders();



// // ══════════════════════════════════════════════════════════════════
// //  PRINTER FACTORY
// // ══════════════════════════════════════════════════════════════════
// function makePrinter() {
//   return new ThermalPrinter({
//     type: CONFIG.PRINTER.type,
//     interface: CONFIG.PRINTER.interface,
//     options: { timeout: 5000 },  // 5s timeout — throws error if IP unreachable
//     width: 48,
//     characterSet: "PC437_USA",
//   });
// }

// // ── Check if printer is reachable before attempting to print
// async function isPrinterReachable() {
//   try {
//     const p = makePrinter();
//     const ok = await p.isPrinterConnected();
//     return ok;
//   } catch (err) {
//     return false;
//   }
// }

// // ══════════════════════════════════════════════════════════════════
// //  LAYOUT HELPERS
// // ══════════════════════════════════════════════════════════════════
// const TOTAL_W = 48;
// const CONTENT_W = 42;
// const MARGIN = " ".repeat(Math.floor((TOTAL_W - CONTENT_W) / 2));
// const SEP = MARGIN + "-".repeat(CONTENT_W);

// const ml = (t) => MARGIN + (t || "");

// const centre = (t) => {
//   const s = t || "";
//   return MARGIN + " ".repeat(Math.max(0, Math.floor((CONTENT_W - s.length) / 2))) + s;
// };

// const twoCol = (l, r) => {
//   const gap = Math.max(1, CONTENT_W - (l || "").length - (r || "").length);
//   return MARGIN + (l || "") + " ".repeat(gap) + (r || "");
// };

// const itemRowBilling = (name, price) => {
//   const n = (name.length > 22 ? name.slice(0, 21) + "." : name).padEnd(22);
//   const p = price.padStart(20);  // 22 + 20 = 42 = CONTENT_W
//   return MARGIN + n + p;
// };

// // ══════════════════════════════════════════════════════════════════
// //  DATE HELPERS
// // ══════════════════════════════════════════════════════════════════
// function formatDateTime(dateStr) {
//   if (!dateStr) return "";
//   const d = new Date(dateStr);
//   const day = String(d.getDate()).padStart(2, "0");
//   const month = d.toLocaleString("en-AU", { month: "short" });
//   const year = d.getFullYear();
//   const time = d
//     .toLocaleString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true })
//     .toUpperCase();
//   return `${day}/${month}/${year} ${time}`;
// }

// function formatFullDate() {
//   const now = new Date();
//   const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//   const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//   const n = now.getDate();
//   const ord = [, "st", "nd", "rd"][((n % 100) - 20) % 10] || [, "st", "nd", "rd"][n % 100] || "th";
//   const time = now
//     .toLocaleString("en-AU", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
//     .toUpperCase();
//   return `${days[now.getDay()]} ${n}${ord} ${months[now.getMonth()]} ${now.getFullYear()} ${time}`;
// }

// // ══════════════════════════════════════════════════════════════════
// //  KITCHEN RECEIPT  (no prices)
// // ══════════════════════════════════════════════════════════════════
// async function printKitchenReceipt(order, items) {
//   const p = makePrinter();

//   p.println("");
//   p.setTextNormal();
//   p.println(centre("*** New Order ***"));
//   p.println(SEP);

//   p.bold(true);
//   p.setTextSize(0, 1);
//   p.println(centre(order.order_name.toUpperCase()));
//   p.setTextNormal();
//   p.bold(false);
//   p.println(SEP);

//   p.println(ml("Order ID: " + order.order_id));
//   p.println(SEP);

//   p.println(ml("Date Time: " + formatDateTime(order.created_at)));
//   p.println(SEP);

//   p.bold(true);
//   p.println(centre("Total Items #  " + items.length));
//   p.bold(false);
//   p.println(SEP);

//   for (const item of items) {
//     p.bold(true);
//     p.print(ml("  "));
//     p.bold(false);
//     p.println(item.item_name);
//   }
//   p.println(SEP);

//   p.bold(true);
//   p.setTextSize(1, 1);
//   p.println(order.order_id);
//   p.setTextNormal();
//   p.bold(false);

//   p.println("");
//   p.println("");
//   p.cut();

//   try {
//     await p.execute();
//     console.log("✅ [Kitchen] Order " + order.order_id);
//     return { ok: true };
//   } catch (err) {
//     // Common errors:
//     // ECONNREFUSED  — wrong IP or printer off
//     // ETIMEDOUT     — IP unreachable / network issue
//     // EHOSTUNREACH  — IP doesn't exist on network
//     console.error("❌ [Kitchen] Order " + order.order_id + ": " + err.message);
//     return { ok: false, error: err.message };
//   }
// }

// // ══════════════════════════════════════════════════════════════════
// //  BILLING RECEIPT  (prices + total + ABN)
// // ══════════════════════════════════════════════════════════════════
// async function printBillingReceipt(order, items) {
//   const p = makePrinter();
//   const total = items.reduce((s, i) => s + parseFloat(i.price || 0), 0);

//   p.println("");

//   p.bold(true);
//   p.setTextSize(0, 1);
//   p.println(centre(CONFIG.STORE_NAME));
//   p.setTextNormal();
//   p.bold(false);
//   p.println(centre(CONFIG.STORE_WEBSITE));
//   p.println(SEP);

//   p.println(ml("Order: " + order.order_id));
//   p.bold(true);
//   p.println(ml(order.order_name));
//   p.bold(false);
//   p.println(SEP);

//   p.bold(true);
//   p.println(centre("SALES INVOICE"));
//   p.bold(false);
//   p.println(SEP);

//   p.bold(true);
//   p.println(itemRowBilling("Item", "Price"));
//   p.bold(false);
//   p.println(SEP);

//   for (const item of items) {
//     p.println(itemRowBilling(
//       item.item_name,
//       "$" + parseFloat(item.price || 0).toFixed(2)
//     ));
//   }
//   p.println(SEP);

//   p.bold(true);
//   p.println(twoCol("TOTAL", "$" + total.toFixed(2)));
//   p.bold(false);
//   p.println(SEP);

//   p.bold(true);
//   p.setTextSize(0, 1);
//   p.println(twoCol("Paid", "$" + total.toFixed(2)));
//   p.setTextNormal();
//   p.bold(false);
//   p.println(SEP);

//   p.println(ml("ABN: " + CONFIG.STORE_ABN));
//   p.println(ml(CONFIG.STORE_ADDRESS));
//   p.println(SEP);

//   p.bold(true);
//   p.println(centre("--- THANK YOU ---"));
//   p.bold(false);
//   p.println(centre(formatFullDate()));

//   p.println("");
//   p.println("");
//   p.cut();

//   try {
//     await p.execute();
//     console.log("✅ [Billing] Order " + order.order_id);
//     return { ok: true };
//   } catch (err) {
//     console.error("❌ [Billing] Order " + order.order_id + ": " + err.message);
//     return { ok: false, error: err.message };
//   }
// }

// // ══════════════════════════════════════════════════════════════════
// //  API CALLS
// // ══════════════════════════════════════════════════════════════════
// async function fetchOrders() {
//   const res = await axios.get(CONFIG.ORDERS_API);
//   return res.data.data || [];
// }

// async function fetchOrderItems() {
//   const res = await axios.get(CONFIG.ITEMS_API);
//   return res.data.data || [];
// }

// // ── Their PHP returns plain text: "updated" | "error" | "no order id"
// async function markAsPrinted(orderId) {
//   try {
//     const res = await axios.post(CONFIG.UPDATE_STATUS_URL, {
//       order_id: orderId,
//       print_status: "printed",
//     }, {
//       headers: { "Content-Type": "application/json" },
//       responseType: "text",   // ← critical: PHP returns plain text not JSON
//     });
//     const text = (res.data || "").trim();
//     if (text === "updated") {
//       console.log("✅ Status updated  — Order " + orderId + " → printed");
//     } else {
//       console.warn("⚠️  API response for " + orderId + ": '" + text + "'");
//     }
//   } catch (err) {
//     console.error("❌ Status update failed for " + orderId + ": " + err.message);
//     // Not fatal — will just retry on next poll if status wasn't updated
//   }
// }

// // ══════════════════════════════════════════════════════════════════
// //  AUTO-PRINT LOOP
// //  - Runs every POLL_INTERVAL ms
// //  - Checks printer reachability first
// //  - Prints need_print / not_printed orders based on where_to_print
// //  - Updates remote API status after printing
// //  - Skips already-printed orders this session (in-memory set)
// // ══════════════════════════════════════════════════════════════════
// let isPolling = false;
// let printedIds = new Set(); // avoid double-printing within same session

// async function autoPrintLoop() {
//   if (isPolling) return; // skip if previous poll still running
//   isPolling = true;

//   try {
//     const time = new Date().toLocaleTimeString("en-AU");

//     // ── Step 1: Check printer is reachable
//     const printerOk = await isPrinterReachable();
//     if (!printerOk) {
//       console.warn(`⚠️  [${time}] Printer not reachable at ${CONFIG.PRINTER.interface} — skipping poll`);
//       isPolling = false;
//       return;
//     }

//     // ── Step 2: Fetch orders + items
//     const [orders, allItems] = await Promise.all([fetchOrders(), fetchOrderItems()]);

//     // ── Step 3: Filter pending orders
//     const pending = orders.filter(o =>
//       CONFIG.AUTO_PRINT_STATUSES.includes(o.print_status) &&
//       !printedIds.has(o.order_id)  // skip already printed this session
//     );

//     if (pending.length === 0) {
//       process.stdout.write(`\r🟢 [${time}] Printer ready — no pending orders   `);
//       isPolling = false;
//       return;
//     }

//     console.log(`\n📋 [${time}] Found ${pending.length} order(s) to print`);

//     // ── Step 4: Print each pending order
//     for (const order of pending) {
//       const orderItems = allItems.filter(i => String(i.order_id) === String(order.order_id));
//       const wtp = order.where_to_print || "both";

//       console.log(`🖨️  Printing ${order.order_id} — "${order.order_name}" [${wtp}] (${orderItems.length} items)`);

//       let anyOk = false;
//       const errs = [];

//       if (wtp === "kitchen" || wtp === "both") {
//         const r = await printKitchenReceipt(order, orderItems);
//         if (r.ok) anyOk = true; else errs.push("Kitchen: " + r.error);
//       }

//       if (wtp === "billing" || wtp === "both") {
//         const r = await printBillingReceipt(order, orderItems);
//         if (r.ok) anyOk = true; else errs.push("Billing: " + r.error);
//       }

//       if (anyOk) {
//         printedIds.add(order.order_id);      // mark in memory
//         await markAsPrinted(order.order_id); // update remote API
//         console.log(`✅ Done — ${order.order_id}\n`);
//       } else {
//         // Don't add to printedIds — will retry on next poll
//         console.error(`❌ Print failed for ${order.order_id}: ${errs.join(" | ")} — will retry\n`);
//       }
//     }

//   } catch (err) {
//     console.error("❌ Poll error: " + err.message);
//   }

//   isPolling = false;
// }

// // ══════════════════════════════════════════════════════════════════
// //  START
// // ══════════════════════════════════════════════════════════════════
// console.log("╔════════════════════════════════════════╗");
// console.log("║       MR. BIRYANI — Auto Printer       ║");
// console.log("╚════════════════════════════════════════╝");
// console.log("🌐  Printer  : " + CONFIG.PRINTER.interface);
// console.log("📡  API      : " + CONFIG.ORDERS_API);
// console.log("⏱️   Polling  : every " + (CONFIG.POLL_INTERVAL / 1000) + "s");
// console.log("🎯  Triggers : " + CONFIG.AUTO_PRINT_STATUSES.join(", "));
// console.log("────────────────────────────────────────\n");

// // Run immediately, then every POLL_INTERVAL
// autoPrintLoop();
// setInterval(autoPrintLoop, CONFIG.POLL_INTERVAL);


















































































































const axios = require("axios");
const { printer: ThermalPrinter, types: PrinterTypes } = require("node-thermal-printer");

// ══════════════════════════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════════════════════════
const CONFIG = {
  // ── APIs
  ORDERS_API: "https://vpos.net.au/api/getorders",
  ITEMS_API: "https://vpos.net.au/api/getorderitems", // update if different
  UPDATE_STATUS_URL: "https://pngspace.com/update_print_status.php",

  // ── Store details (billing receipt)
  STORE_NAME: "Mr. Biryani",
  STORE_WEBSITE: "www.mrbiryani.com.au",
  STORE_ABN: "97606050210",
  STORE_ADDRESS: "73 Station St Pakenham VIC-3810",

  // ── Printer
  PRINTER: {
    name: "USB Printer",
    interface: "/dev/usb/lp0",
    type: PrinterTypes.EPSON,
  },

  // ── Poll every 5 seconds
  POLL_INTERVAL: 5000,

  // ── Which statuses trigger auto-print
  AUTO_PRINT_STATUSES: ["need_print", "not_printed"],
};

// ══════════════════════════════════════════════════════════════════
//  PRINTER FACTORY
// ══════════════════════════════════════════════════════════════════
function makePrinter() {
  return new ThermalPrinter({
    type: CONFIG.PRINTER.type,
    interface: CONFIG.PRINTER.interface,
    options: { timeout: 5000 },
    width: 48,
    characterSet: "PC437_USA",
  });
}

async function isPrinterReachable() {
  try {
    const p = makePrinter();
    return await p.isPrinterConnected();
  } catch {
    return false;
  }
}

// ══════════════════════════════════════════════════════════════════
//  LAYOUT HELPERS
// ══════════════════════════════════════════════════════════════════
const TOTAL_W = 48;
const CONTENT_W = 42;
const MARGIN = " ".repeat(Math.floor((TOTAL_W - CONTENT_W) / 2));
const SEP = MARGIN + "-".repeat(CONTENT_W);

const ml = (t) => MARGIN + (t || "");
const centre = (t) => {
  const s = t || "";
  return MARGIN + " ".repeat(Math.max(0, Math.floor((CONTENT_W - s.length) / 2))) + s;
};
const twoCol = (l, r) => {
  const gap = Math.max(1, CONTENT_W - (l || "").length - (r || "").length);
  return MARGIN + (l || "") + " ".repeat(gap) + (r || "");
};
const itemRowBilling = (name, price) => {
  const n = (name.length > 30 ? name.slice(0, 29) + "." : name).padEnd(30);
  const p = price.padStart(12);
  return MARGIN + n + p;
};

// ══════════════════════════════════════════════════════════════════
//  DATE HELPERS
// ══════════════════════════════════════════════════════════════════
function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-AU", { month: "short" });
  const year = d.getFullYear();
  const time = d
    .toLocaleString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true })
    .toUpperCase();
  return `${day}/${month}/${year} ${time}`;
}

function formatFullDate() {
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const n = now.getDate();
  const ord = [, "st", "nd", "rd"][((n % 100) - 20) % 10] || [, "st", "nd", "rd"][n % 100] || "th";
  const time = now
    .toLocaleString("en-AU", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
    .toUpperCase();
  return `${days[now.getDay()]} ${n}${ord} ${months[now.getMonth()]} ${now.getFullYear()} ${time}`;
}

// ══════════════════════════════════════════════════════════════════
//  ORDER TYPE HELPER  (vpos API: 1=Takeaway, 2=Dine-In, 3=Delivery)
// ══════════════════════════════════════════════════════════════════
const ORDER_TYPE = { 1: "Takeaway", 2: "Dine-In", 3: "Delivery" };

// ══════════════════════════════════════════════════════════════════
//  KITCHEN RECEIPT
// ══════════════════════════════════════════════════════════════════
async function printKitchenReceipt(order, items) {
  const p = makePrinter();

  // Order label — use table_name for dine-in, cust_name for takeaway/delivery
  const label = order.table_name
    ? `Table ${order.table_name}`
    : (order.cust_name || ORDER_TYPE[order.order_type] || "Order");

  p.println("");
  p.setTextNormal();
  p.println(centre("*** New Order ***"));
  p.println(SEP);

  // Order type + label — big bold
  p.bold(true);
  p.setTextSize(0, 1);
  p.println(centre((ORDER_TYPE[order.order_type] || "Order").toUpperCase()));
  p.println(centre(label.toUpperCase()));
  p.setTextNormal();
  p.bold(false);
  p.println(SEP);

  p.println(ml("Order  : " + order.order_code));
  p.println(ml("Date   : " + formatDateTime(order.order_at)));
  if (order.sp_instructions) {
    p.println(ml("Note   : " + order.sp_instructions));
  }
  p.println(SEP);

  p.bold(true);
  p.println(centre("Total Items #  " + items.length));
  p.bold(false);
  p.println(SEP);

  // Items — name only, no prices on kitchen ticket
  for (const item of items) {
    p.println(ml("• " + (item.itemname || item.item_name || "Item")));
    if (item.instruction) {
      p.println(ml("  ↳ " + item.instruction));
    }
  }
  p.println(SEP);

  // Big ticket number
  p.bold(true);
  p.setTextSize(1, 1);
  p.println(MARGIN + order.order_code);
  p.setTextNormal();
  p.bold(false);

  p.println("");
  p.println("");
  p.cut();

  try {
    await p.execute();
    console.log("  ✅ [Kitchen] " + order.order_code);
    return { ok: true };
  } catch (err) {
    console.error("  ❌ [Kitchen] " + order.order_code + ": " + err.message);
    return { ok: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════════════════
//  BILLING RECEIPT
// ══════════════════════════════════════════════════════════════════
async function printBillingReceipt(order, items) {
  const p = makePrinter();
  const total = items.reduce((s, i) => s + parseFloat(i.final_price || i.price || 0), 0);
  const label = order.table_name
    ? `Table ${order.table_name}`
    : (order.cust_name || ORDER_TYPE[order.order_type] || "Counter");

  p.println("");

  // Store header
  p.bold(true);
  p.setTextSize(0, 1);
  p.println(centre(CONFIG.STORE_NAME));
  p.setTextNormal();
  p.bold(false);
  p.println(centre(CONFIG.STORE_WEBSITE));
  p.println(SEP);

  // Order info
  p.println(ml("Order  : " + order.order_code));
  p.bold(true);
  p.println(ml(label));
  p.bold(false);
  if (order.cust_num) p.println(ml("Phone  : " + order.cust_num));
  if (order.partner_name) p.println(ml("Via    : " + order.partner_name));
  p.println(SEP);

  p.bold(true);
  p.println(centre("SALES INVOICE"));
  p.bold(false);
  p.println(SEP);

  // Column headers
  p.bold(true);
  p.println(itemRowBilling("Item", "Price"));
  p.bold(false);
  p.println(SEP);

  // Line items
  for (const item of items) {
    const name = item.itemname || item.item_name || "Item";
    const price = parseFloat(item.final_price || item.price || 0);
    p.println(itemRowBilling(name, "$" + price.toFixed(2)));
  }
  p.println(SEP);

  // Total
  p.bold(true);
  p.println(twoCol("TOTAL", "$" + total.toFixed(2)));
  p.bold(false);
  p.println(SEP);

  // Paid — double height
  p.bold(true);
  p.setTextSize(0, 1);
  p.println(twoCol("Paid", "$" + total.toFixed(2)));
  p.setTextNormal();
  p.bold(false);
  p.println(SEP);

  // Footer
  p.println(ml("ABN: " + CONFIG.STORE_ABN));
  p.println(ml(CONFIG.STORE_ADDRESS));
  p.println(SEP);
  p.bold(true);
  p.println(centre("--- THANK YOU ---"));
  p.bold(false);
  p.println(centre(formatFullDate()));

  p.println("");
  p.println("");
  p.cut();

  try {
    await p.execute();
    console.log("  ✅ [Billing] " + order.order_code);
    return { ok: true };
  } catch (err) {
    console.error("  ❌ [Billing] " + order.order_code + ": " + err.message);
    return { ok: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════════════════
//  API CALLS
//  vpos.net.au returns a plain ARRAY — no wrapper object
// ══════════════════════════════════════════════════════════════════
async function fetchOrders() {
  const res = await axios.get(CONFIG.ORDERS_API);
  // vpos: plain array  |  pngspace: { data: [] }
  return Array.isArray(res.data) ? res.data : (res.data.data || []);
}

async function fetchOrderItems() {
  const res = await axios.get(CONFIG.ITEMS_API);
  return Array.isArray(res.data) ? res.data : (res.data.data || []);
}

// ── Update remote print_status after printing
async function markAsPrinted(orderId) {
  try {
    const res = await axios.post(CONFIG.UPDATE_STATUS_URL, {
      order_id: String(orderId),
      print_status: "printed",
    }, {
      headers: { "Content-Type": "application/json" },
      responseType: "text",   // their PHP returns plain text
    });
    const text = (res.data || "").trim();
    if (text === "updated") {
      console.log("  ✅ Remote status updated → printed");
    } else {
      console.warn("  ⚠️  Remote API response: '" + text + "'");
    }
  } catch (err) {
    console.error("  ❌ Remote status update failed: " + err.message);
    // Not fatal — will retry on next poll
  }
}

// ══════════════════════════════════════════════════════════════════
//  LOG ORDERS  (console view — same as your snippet)
// ══════════════════════════════════════════════════════════════════
async function logOrders() {
  const orders = await fetchOrders();

  console.log("─────────────────────────────────────────────────────────────");
  console.log(`  Total orders fetched: ${orders.length}`);
  console.log("─────────────────────────────────────────────────────────────");

  orders.forEach(o => {
    const type = ORDER_TYPE[o.order_type] || "?";
    const label = o.table_name ? `Table ${o.table_name}` : (o.cust_name || "—");
    const status = o.print_status.padEnd(12);
    const flag = CONFIG.AUTO_PRINT_STATUSES.includes(o.print_status) ? "🖨 WILL PRINT" : "           ";
    console.log(`  #${String(o.id).padEnd(6)} | ${o.order_code.padEnd(22)} | ${type.padEnd(10)} | ${label.padEnd(16)} | $${String(o.order_value ?? "?").padEnd(7)} | ${status} | ${flag}`);
  });

  console.log("─────────────────────────────────────────────────────────────");
  console.log(`  Will print: ${orders.filter(o => CONFIG.AUTO_PRINT_STATUSES.includes(o.print_status)).length} orders`);
  console.log("─────────────────────────────────────────────────────────────\n");
}

// ══════════════════════════════════════════════════════════════════
//  AUTO-PRINT LOOP
//  1. Fetch orders from vpos.net.au
//  2. Filter by print_status = "need_print" | "not_printed"
//  3. Print kitchen/billing based on order_type
//  4. Mark as printed in remote API
// ══════════════════════════════════════════════════════════════════
let isPolling = false;
const printedIds = new Set(); // avoid double-printing in same session

async function autoPrintLoop() {
  if (isPolling) return;
  isPolling = true;

  try {
    const time = new Date().toLocaleTimeString("en-AU");

    // ── Check printer
    const printerOk = await isPrinterReachable();
    if (!printerOk) {
      process.stdout.write(`\r⚠️  [${time}] Printer not reachable — skipping    `);
      isPolling = false;
      return;
    }

    // ── Fetch orders from vpos.net.au
    const orders = await fetchOrders();

    // ── Filter: need_print or not_printed, not already done this session
    const pending = orders.filter(o =>
      CONFIG.AUTO_PRINT_STATUSES.includes(o.print_status) &&
      !printedIds.has(o.id)
    );

    if (pending.length === 0) {
      process.stdout.write(`\r🟢 [${time}] Printer ready — ${orders.length} orders, none pending   `);
      isPolling = false;
      return;
    }

    console.log(`\n📋 [${time}] Found ${pending.length} order(s) to print:\n`);

    // ── Print each pending order
    for (const order of pending) {

      // vpos API: items are typically embedded or fetched separately
      // For now fetch all items and match by order id
      let orderItems = [];
      try {
        const allItems = await fetchOrderItems();
        orderItems = allItems.filter(i => String(i.order_id) === String(order.id));
      } catch {
        // Items API might not exist yet — print without items
        orderItems = [];
      }

      const type = ORDER_TYPE[order.order_type] || "Order";
      const label = order.table_name ? `Table ${order.table_name}` : (order.cust_name || "Counter");
      console.log(`🖨️  #${order.id} | ${order.order_code} | ${type} | ${label} | $${order.order_value ?? "?"} | ${orderItems.length} items`);

      // ── Decide what to print based on order_type
      // Dine-In (2)  → kitchen + billing
      // Takeaway (1) → kitchen + billing
      // Delivery (3) → kitchen + billing
      // (adjust below if you want different logic per type)
      let anyOk = false;
      const errs = [];

      const kitchenResult = await printKitchenReceipt(order, orderItems);
      if (kitchenResult.ok) anyOk = true; else errs.push("Kitchen: " + kitchenResult.error);

      const billingResult = await printBillingReceipt(order, orderItems);
      if (billingResult.ok) anyOk = true; else errs.push("Billing: " + billingResult.error);

      if (anyOk) {
        printedIds.add(order.id);       // mark in memory
        await markAsPrinted(order.id);  // update remote API
        console.log(`  ✅ Done — ${order.order_code}\n`);
      } else {
        console.error(`  ❌ Failed — ${order.order_code}: ${errs.join(" | ")} — will retry\n`);
      }
    }

  } catch (err) {
    console.error("❌ Poll error: " + err.message);
  }

  isPolling = false;
}

// ══════════════════════════════════════════════════════════════════
//  START
// ══════════════════════════════════════════════════════════════════
console.log("╔════════════════════════════════════════════╗");
console.log("║      MR. BIRYANI — Auto Printer (vpos)     ║");
console.log("╚════════════════════════════════════════════╝");
console.log("📡  Orders API : " + CONFIG.ORDERS_API);
console.log("🖨️   Printer   : " + CONFIG.PRINTER.interface);
console.log("⏱️   Polling   : every " + CONFIG.POLL_INTERVAL / 1000 + "s");
console.log("🎯  Triggers  : " + CONFIG.AUTO_PRINT_STATUSES.join(", "));
console.log("────────────────────────────────────────────\n");

// ── Log all current orders to console first
logOrders().then(() => {
  // Then start the auto-print loop
  autoPrintLoop();
  setInterval(autoPrintLoop, CONFIG.POLL_INTERVAL);
});