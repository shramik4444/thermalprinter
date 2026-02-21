// const express = require("express");
// const cors = require("cors");
// const axios = require("axios");
// const { printer: ThermalPrinter, types: PrinterTypes } = require("node-thermal-printer");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ══════════════════════════════════════════════════════════════════
// //  CONFIG
// //  Change PRINTER.interface to match your USB path:
// //    Linux:   /dev/usb/lp0
// //    Windows: \\.\COM3
// //    Mac:     /dev/tty.usbserial-XXXX
// // ══════════════════════════════════════════════════════════════════
// const CONFIG = {
//   VPOS_API_BASE: "https://vpos.net.au/api",
//   LARAVEL_UPDATE_URL: "https://vpos.net.au/api/updateprintstatus",

//   STORE_NAME: "Mr. Biryani",
//   STORE_WEBSITE: "www.mrbiryani.com.au",
//   STORE_ABN: "97606050210",
//   STORE_ADDRESS: "73 Station St Pakenham VIC-3810",

//   PRINTER: {
//     name: "USB Printer",
//     interface: "/dev/usb/lp0",
//     type: PrinterTypes.EPSON,
//   },
// };

// // ══════════════════════════════════════════════════════════════════
// //  PRINTER FACTORY
// // ══════════════════════════════════════════════════════════════════
// function makePrinter() {
//   return new ThermalPrinter({
//     type: CONFIG.PRINTER.type,
//     interface: CONFIG.PRINTER.interface,
//     options: { timeout: 5000 },
//     width: 48,           // 80mm paper = 48 chars wide
//     characterSet: "PC437_USA",
//   });
// }

// // ══════════════════════════════════════════════════════════════════
// //  LAYOUT CONSTANTS
// //
// //  80mm paper = 48 printable chars at normal size.
// //  Content zone = 42 chars, giving a 3-char margin each side.
// // ══════════════════════════════════════════════════════════════════
// const TOTAL_W = 48;
// const CONTENT_W = 42;
// const L_PAD = Math.floor((TOTAL_W - CONTENT_W) / 2);  // 3
// const MARGIN = " ".repeat(L_PAD);

// // Separator line
// const SEP = MARGIN + "-".repeat(CONTENT_W);

// // Left-margin prefix
// const ml = (text) => MARGIN + (text || "");

// // Centre text within CONTENT_W
// const centre = (text) => {
//   const t = text || "";
//   const pad = Math.max(0, Math.floor((CONTENT_W - t.length) / 2));
//   return MARGIN + " ".repeat(pad) + t;
// };

// // Two-column: label left, value right, total = CONTENT_W
// const twoCol = (left, right) => {
//   const l = left || "";
//   const r = right || "";
//   const gap = Math.max(1, CONTENT_W - l.length - r.length);
//   return MARGIN + l + " ".repeat(gap) + r;
// };

// // Billing item row — Name:22 | Price:7 | Qty:4 | Total:9 = 42
// const itemRow = (name, price, qty, total) => {
//   const n = (name.length > 22 ? name.slice(0, 21) + "." : name).padEnd(22);
//   const p = price.padStart(7);
//   const q = qty.padStart(4);
//   const t = total.padStart(9);
//   return MARGIN + n + p + q + t;
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

// const ORDER_TYPE_LABEL = { 1: "TAKE AWAY", 2: "DINE IN", 3: "THIRD PARTY" };

// // ══════════════════════════════════════════════════════════════════
// //  KITCHEN RECEIPT  (no prices)
// // ══════════════════════════════════════════════════════════════════
// async function printKitchenReceipt(order, items) {
//   const p = makePrinter();
//   const typeLabel = ORDER_TYPE_LABEL[order.order_type] || "ORDER";
//   const totalQty = items.reduce((s, i) => s + (parseInt(i.qty) || 0), 0);

//   p.println("");  // top margin

//   // "*** New Order ***" — normal, centred
//   p.setTextNormal();
//   p.println(centre("*** New Order ***"));
//   p.println(SEP);

//   // Order type — double-height bold, centred
//   p.bold(true);
//   p.setTextSize(0, 1);
//   p.println(centre(typeLabel));
//   p.setTextNormal();
//   p.bold(false);
//   p.println(SEP);

//   // Customer label normal, name bold
//   p.println(ml("Customer Name"));
//   if (order.cust_name) {
//     p.bold(true);
//     p.println(ml(order.cust_name));
//     p.bold(false);
//   }
//   if (order.partner_name) p.println(ml(order.partner_name.toLowerCase()));
//   p.println(SEP);

//   // Date/time — normal
//   p.println(ml("Date Time: " + formatDateTime(order.order_at)));
//   p.println(SEP);

//   // Total items — bold, centred
//   p.bold(true);
//   p.println(centre("Total Items #  " + totalQty));
//   p.bold(false);
//   p.println(SEP);






//   // Items — qty bold, item name normal
//   for (const item of items) {
//     p.bold(true);
//     p.setTextSize(0, 1);
//     p.print(ml("x" + item.qty + "  "));
//     p.bold(false);
//     p.println(item.itemname);
//     if (item.instruction && item.instruction.trim()) {
//       p.println(ml("      >> " + item.instruction.trim())); 
//     }
//   }
//   p.println(SEP);

//   // Ticket number — double-size bold, centred
//   p.bold(true);
//   p.setTextSize(1, 1);
//   p.println(MARGIN + "Ticket No: " + order.id);
//   p.setTextNormal();
//   p.bold(false);

//   p.println("");  // bottom margin
//   p.println("");
//   p.cut();

//   try {
//     await p.execute();
//     console.log("✅ [Kitchen] Order #" + order.id);
//     return { ok: true };
//   } catch (err) {
//     console.error("❌ [Kitchen] Order #" + order.id + ": " + err.message);
//     return { ok: false, error: err.message };
//   }
// }

// // ══════════════════════════════════════════════════════════════════
// //  BILLING RECEIPT  (prices + totals + ABN)
// // ══════════════════════════════════════════════════════════════════
// async function printBillingReceipt(order, items) {
//   const p = makePrinter();
//   const subtotal = items.reduce((s, i) => s + parseFloat(i.final_price || 0), 0);
//   const discount = parseFloat(order.discount_val || 0);
//   const total = subtotal - discount;

//   p.println("");  // top margin

//   // Store name — double-height bold, centred
//   p.bold(true);
//   p.setTextSize(0, 1);
//   p.println(centre(CONFIG.STORE_NAME));
//   p.setTextNormal();
//   p.bold(false);

//   // Website — normal, centred
//   p.println(centre(CONFIG.STORE_WEBSITE));
//   p.println(SEP);

//   // Order code — normal; table — bold
//   p.println(ml("ORD: " + order.order_code));
//   if (order.table_name) {
//     p.bold(true);
//     p.println(ml("Table: " + order.table_name.toUpperCase()));
//     p.bold(false);
//   }
//   p.println(SEP);

//   // SALES INVOICE — bold, centred
//   p.bold(true);
//   p.println(centre("SALES INVOICE"));
//   p.bold(false);
//   p.println(SEP);

//   // Column headers — bold
//   p.bold(true);
//   p.println(itemRow("Product", "Price", "Qty", "Total"));
//   p.bold(false);
//   p.println(SEP);

//   // Line items — normal
//   for (const item of items) {
//     p.println(itemRow(
//       item.itemname,
//       parseFloat(item.base_price || 0).toFixed(2),
//       String(item.qty || 1),
//       parseFloat(item.final_price || 0).toFixed(2)
//     ));
//     if (item.instruction && item.instruction.trim()) {
//       p.println(ml("  (" + item.instruction.trim() + ")"));
//     }
//   }
//   p.println(SEP);

//   // Subtotal + Discount — normal; Total — bold
//   p.println(twoCol("Subtotal", "$" + subtotal.toFixed(2)));
//   p.println(twoCol("Discount", "$" + discount.toFixed(2)));
//   p.bold(true);
//   p.println(twoCol("Total", "$" + total.toFixed(2)));
//   p.bold(false);
//   p.println(SEP);

//   // Paid — double-height bold
//   p.bold(true);
//   p.setTextSize(0, 1);
//   p.println(twoCol("Paid", "$" + total.toFixed(2)));
//   p.setTextNormal();
//   p.bold(false);
//   if (order.payment_type) {
//     p.println(ml("   (" + order.payment_type.toUpperCase() + ")"));
//   }
//   p.println(SEP);

//   // ABN + address — normal
//   p.println(ml("ABN: " + CONFIG.STORE_ABN));
//   p.println(ml(CONFIG.STORE_ADDRESS));
//   p.println(SEP);

//   // Thank you — bold, centred
//   p.bold(true);
//   p.println(centre("--- THANK YOU ---"));
//   p.bold(false);

//   // Timestamp — normal, centred
//   p.println(centre(formatFullDate()));

//   p.println("");  // bottom margin
//   p.println("");
//   p.cut();

//   try {
//     await p.execute();
//     console.log("✅ [Billing] Order #" + order.id);
//     return { ok: true };
//   } catch (err) {
//     console.error("❌ [Billing] Order #" + order.id + ": " + err.message);
//     return { ok: false, error: err.message };
//   }
// }

// // ══════════════════════════════════════════════════════════════════
// //  VPOS API
// // ══════════════════════════════════════════════════════════════════
// async function fetchOrders() {
//   const res = await axios.get(CONFIG.VPOS_API_BASE + "/getorders");
//   return res.data;
// }
// async function fetchOrderItems() {
//   const res = await axios.get(CONFIG.VPOS_API_BASE + "/getorderitems");
//   return res.data;
// }
// async function markAsPrinted(orderId) {
//   try {
//     await axios.post(CONFIG.LARAVEL_UPDATE_URL, { order_id: orderId, print_status: "printed" });
//     console.log("✅ Laravel updated — Order #" + orderId + " → printed");
//   } catch (err) {
//     console.error("❌ Laravel update failed #" + orderId + ": " + err.message);
//   }
// }

// // ══════════════════════════════════════════════════════════════════
// //  REST API  —  NO auto-print, manual button only
// // ══════════════════════════════════════════════════════════════════

// app.get("/orders", async (req, res) => {
//   try { res.json({ success: true, data: await fetchOrders() }); }
//   catch (err) { res.status(500).json({ success: false, message: err.message }); }
// });

// app.get("/orderitems", async (req, res) => {
//   try { res.json({ success: true, data: await fetchOrderItems() }); }
//   catch (err) { res.status(500).json({ success: false, message: err.message }); }
// });

// // target = "kitchen" | "billing" | "all"
// app.post("/print/:orderId", async (req, res) => {
//   const orderId = parseInt(req.params.orderId);
//   const target = req.body?.target || "all";
//   const errors = [];
//   let anyOk = false;

//   try {
//     const [orders, allItems] = await Promise.all([fetchOrders(), fetchOrderItems()]);
//     const order = orders.find((o) => o.id === orderId);
//     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

//     const orderItems = allItems.filter(
//       (i) => i.order_id === orderId && i.status !== "cancel"
//     );

//     if (target === "kitchen" || target === "all") {
//       const r = await printKitchenReceipt(order, orderItems);
//       if (r.ok) anyOk = true; else errors.push("Kitchen: " + r.error);
//     }
//     if (target === "billing" || target === "all") {
//       const r = await printBillingReceipt(order, orderItems);
//       if (r.ok) anyOk = true; else errors.push("Billing: " + r.error);
//     }

//     if (anyOk) await markAsPrinted(orderId);

//     const labels = { kitchen: "Kitchen ticket", billing: "Billing receipt", all: "All" };
//     res.json({
//       success: anyOk,
//       message: errors.length > 0
//         ? labels[target] + " failed: " + errors.join(" | ")
//         : labels[target] + " printed successfully",
//       errors,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.get("/printer-status", async (req, res) => {
//   try {
//     const p = makePrinter();
//     const connected = await p.isPrinterConnected();
//     res.json({ connected, name: CONFIG.PRINTER.name, interface: CONFIG.PRINTER.interface });
//   } catch (err) {
//     res.json({ connected: false, name: CONFIG.PRINTER.name, error: err.message });
//   }
// });

// app.listen(5002, () => {
//   console.log("🚀 Server on port 5002 — manual print only");
//   console.log("🖨️  USB: " + CONFIG.PRINTER.interface);
// });






















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
//   VPOS_API_BASE: "https://vpos.net.au/api",
//   LARAVEL_UPDATE_URL: "https://vpos.net.au/api/updateprintstatus",

//   STORE_NAME: "Mr. Biryani",
//   STORE_WEBSITE: "www.mrbiryani.com.au",
//   STORE_ABN: "97606050210",
//   STORE_ADDRESS: "73 Station St Pakenham VIC-3810",

//   PRINTER: {
//     name: "USB Printer",
//     interface: "/dev/usb/lp0",   // Linux — change if needed
//     type: PrinterTypes.EPSON,
//   },

//   // ── MySQL — update these to match your server
// DB: {
//   host: "localhost",
//   port: 3306,
//   user: "root",        // your MySQL username
//   password: "0112358", // your MySQL password
//   database: "mrbiryani_db",
// },
// };

// // ══════════════════════════════════════════════════════════════════
// //  DATABASE SETUP
// //  Runs once on startup — creates DB and table if they don't exist
// // ══════════════════════════════════════════════════════════════════
// let db; // global pool

// async function initDB() {
//   // First connect WITHOUT selecting a database so we can CREATE it
//   const bootstrap = await mysql.createConnection({
//     host: CONFIG.DB.host,
//     port: CONFIG.DB.port,
//     user: CONFIG.DB.user,
//     password: CONFIG.DB.password,
//   });

//   await bootstrap.execute(
//     `CREATE DATABASE IF NOT EXISTS \`${CONFIG.DB.database}\``
//   );
//   await bootstrap.end();

//   // Now create the pool connected to mrbiryani_db
//   db = mysql.createPool({
//     host: CONFIG.DB.host,
//     port: CONFIG.DB.port,
//     user: CONFIG.DB.user,
//     password: CONFIG.DB.password,
//     database: CONFIG.DB.database,
//     waitForConnections: true,
//     connectionLimit: 10,
//   });

//   // Create table if it doesn't exist
//   await db.execute(`
//     CREATE TABLE IF NOT EXISTS print_log (
//       id            INT AUTO_INCREMENT PRIMARY KEY,
//       order_id      INT          NOT NULL,
//       order_code    VARCHAR(64)  DEFAULT NULL,
//       print_target  VARCHAR(20)  NOT NULL,          -- kitchen | billing | all
//       print_status  VARCHAR(20)  NOT NULL DEFAULT 'printed',
//       reprint_count INT          NOT NULL DEFAULT 0,
//       printed_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
//       updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
//                                           ON UPDATE CURRENT_TIMESTAMP,
//       INDEX idx_order_id   (order_id),
//       INDEX idx_order_code (order_code),
//       INDEX idx_printed_at (printed_at)
//     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
//   `);

//   console.log("✅ DB ready — mrbiryani_db.print_log");
// }

// // ── Save or update a print record
// async function logPrint(orderId, orderCode, target) {
//   // Check if this order was already printed
//   const [rows] = await db.execute(
//     "SELECT id, reprint_count FROM print_log WHERE order_id = ? LIMIT 1",
//     [orderId]
//   );

//   if (rows.length > 0) {
//     // Already exists — increment reprint_count and update
//     await db.execute(
//       `UPDATE print_log
//           SET print_target  = ?,
//               print_status  = 'reprinted',
//               reprint_count = reprint_count + 1,
//               printed_at    = NOW()
//         WHERE order_id = ?`,
//       [target, orderId]
//     );
//     console.log(`📝 DB updated (reprint) — Order #${orderId}`);
//   } else {
//     // First time — insert
//     await db.execute(
//       `INSERT INTO print_log (order_id, order_code, print_target, print_status)
//        VALUES (?, ?, ?, 'printed')`,
//       [orderId, orderCode || null, target]
//     );
//     console.log(`📝 DB saved — Order #${orderId}`);
//   }
// }

// // ── Get print log for a specific order
// async function getPrintLog(orderId) {
//   const [rows] = await db.execute(
//     "SELECT * FROM print_log WHERE order_id = ? LIMIT 1",
//     [orderId]
//   );
//   return rows[0] || null;
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
// //  LAYOUT CONSTANTS
// // ══════════════════════════════════════════════════════════════════
// const TOTAL_W = 48;
// const CONTENT_W = 42;
// const L_PAD = Math.floor((TOTAL_W - CONTENT_W) / 2);
// const MARGIN = " ".repeat(L_PAD);
// const SEP = MARGIN + "-".repeat(CONTENT_W);

// const ml = (text) => MARGIN + (text || "");

// const centre = (text) => {
//   const t = text || "";
//   const pad = Math.max(0, Math.floor((CONTENT_W - t.length) / 2));
//   return MARGIN + " ".repeat(pad) + t;
// };

// const twoCol = (left, right) => {
//   const l = left || "";
//   const r = right || "";
//   const gap = Math.max(1, CONTENT_W - l.length - r.length);
//   return MARGIN + l + " ".repeat(gap) + r;
// };

// const itemRow = (name, price, qty, total) => {
//   const n = (name.length > 22 ? name.slice(0, 21) + "." : name).padEnd(22);
//   const p = price.padStart(7);
//   const q = qty.padStart(4);
//   const t = total.padStart(9);
//   return MARGIN + n + p + q + t;
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

// const ORDER_TYPE_LABEL = { 1: "TAKE AWAY", 2: "DINE IN", 3: "THIRD PARTY" };

// // ══════════════════════════════════════════════════════════════════
// //  KITCHEN RECEIPT  (no prices)
// // ══════════════════════════════════════════════════════════════════
// async function printKitchenReceipt(order, items) {
//   const p = makePrinter();
//   const typeLabel = ORDER_TYPE_LABEL[order.order_type] || "ORDER";
//   const totalQty = items.reduce((s, i) => s + (parseInt(i.qty) || 0), 0);

//   p.println("");

//   p.setTextNormal();
//   p.println(centre("*** New Order ***"));
//   p.println(SEP);

//   p.bold(true);
//   p.setTextSize(0, 1);
//   p.println(centre(typeLabel));
//   p.setTextNormal();
//   p.bold(false);
//   p.println(SEP);

//   p.println(ml("Customer Name"));
//   if (order.cust_name) {
//     p.bold(true);
//     p.println(ml(order.cust_name));
//     p.bold(false);
//   }
//   if (order.partner_name) p.println(ml(order.partner_name.toLowerCase()));
//   p.println(SEP);

//   p.println(ml("Date Time: " + formatDateTime(order.order_at)));
//   p.println(SEP);

//   p.bold(true);
//   p.println(centre("Total Items #  " + totalQty));
//   p.bold(false);
//   p.println(SEP);

//   if (order.order_type === 2 && order.table_name) {
//     p.bold(true);
//     p.setTextSize(0, 1);
//     p.println(centre("Table: " + order.table_name.toUpperCase()));
//     p.setTextNormal();
//     p.bold(false);
//     p.println(SEP);
//   }

//   for (const item of items) {
//     p.bold(true);
//     p.setTextSize(0, 1);
//     p.print(ml("x" + item.qty + "  "));
//     p.bold(false);
//     p.println(item.itemname);
//     if (item.instruction && item.instruction.trim()) {
//       p.println(ml("      >> " + item.instruction.trim()));
//     }
//   }
//   p.println(SEP);

//   p.bold(true);
//   p.setTextSize(1, 1);
//   p.println(MARGIN + "Ticket No: " + order.id);
//   p.setTextNormal();
//   p.bold(false);

//   p.println("");
//   p.println("");
//   p.cut();

//   try {
//     await p.execute();
//     console.log("✅ [Kitchen] Order #" + order.id);
//     return { ok: true };
//   } catch (err) {
//     console.error("❌ [Kitchen] Order #" + order.id + ": " + err.message);
//     return { ok: false, error: err.message };
//   }
// }

// // ══════════════════════════════════════════════════════════════════
// //  BILLING RECEIPT  (prices + totals + ABN)
// // ══════════════════════════════════════════════════════════════════
// async function printBillingReceipt(order, items) {
//   const p = makePrinter();
//   const subtotal = items.reduce((s, i) => s + parseFloat(i.final_price || 0), 0);
//   const discount = parseFloat(order.discount_val || 0);
//   const total = subtotal - discount;

//   p.println("");

//   p.bold(true);
//   p.setTextSize(0, 1);
//   p.println(centre(CONFIG.STORE_NAME));
//   p.setTextNormal();
//   p.bold(false);
//   p.println(centre(CONFIG.STORE_WEBSITE));
//   p.println(SEP);

//   p.println(ml("ORD: " + order.order_code));
//   if (order.table_name) {
//     p.bold(true);
//     p.println(ml("Table: " + order.table_name.toUpperCase()));
//     p.bold(false);
//   }
//   p.println(SEP);

//   p.bold(true);
//   p.println(centre("SALES INVOICE"));
//   p.bold(false);
//   p.println(SEP);

//   p.bold(true);
//   p.println(itemRow("Product", "Price", "Qty", "Total"));
//   p.bold(false);
//   p.println(SEP);

//   for (const item of items) {
//     p.println(itemRow(
//       item.itemname,
//       parseFloat(item.base_price || 0).toFixed(2),
//       String(item.qty || 1),
//       parseFloat(item.final_price || 0).toFixed(2)
//     ));
//     if (item.instruction && item.instruction.trim()) {
//       p.println(ml("  (" + item.instruction.trim() + ")"));
//     }
//   }
//   p.println(SEP);

//   p.println(twoCol("Subtotal", "$" + subtotal.toFixed(2)));
//   p.println(twoCol("Discount", "$" + discount.toFixed(2)));
//   p.bold(true);
//   p.println(twoCol("Total", "$" + total.toFixed(2)));
//   p.bold(false);
//   p.println(SEP);

//   p.bold(true);
//   p.setTextSize(0, 1);
//   p.println(twoCol("Paid", "$" + total.toFixed(2)));
//   p.setTextNormal();
//   p.bold(false);
//   if (order.payment_type) {
//     p.println(ml("   (" + order.payment_type.toUpperCase() + ")"));
//   }
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
//     console.log("✅ [Billing] Order #" + order.id);
//     return { ok: true };
//   } catch (err) {
//     console.error("❌ [Billing] Order #" + order.id + ": " + err.message);
//     return { ok: false, error: err.message };
//   }
// }

// // ══════════════════════════════════════════════════════════════════
// //  VPOS API
// // ══════════════════════════════════════════════════════════════════
// async function fetchOrders() {
//   const res = await axios.get(CONFIG.VPOS_API_BASE + "/getorders");
//   return res.data;
// }
// async function fetchOrderItems() {
//   const res = await axios.get(CONFIG.VPOS_API_BASE + "/getorderitems");
//   return res.data;
// }
// async function markAsPrinted(orderId) {
//   try {
//     await axios.post(CONFIG.LARAVEL_UPDATE_URL, { order_id: orderId, print_status: "printed" });
//     console.log("✅ Laravel updated — Order #" + orderId + " → printed");
//   } catch (err) {
//     console.error("❌ Laravel update failed #" + orderId + ": " + err.message);
//   }
// }

// // ══════════════════════════════════════════════════════════════════
// //  REST API  —  NO auto-print, manual button only
// // ══════════════════════════════════════════════════════════════════

// app.get("/orders", async (req, res) => {
//   try { res.json({ success: true, data: await fetchOrders() }); }
//   catch (err) { res.status(500).json({ success: false, message: err.message }); }
// });

// app.get("/orderitems", async (req, res) => {
//   try { res.json({ success: true, data: await fetchOrderItems() }); }
//   catch (err) { res.status(500).json({ success: false, message: err.message }); }
// });

// // ── PRINT ENDPOINT — target = "kitchen" | "billing" | "all"
// app.post("/print/:orderId", async (req, res) => {
//   const orderId = parseInt(req.params.orderId);
//   const target = req.body?.target || "all";
//   const errors = [];
//   let anyOk = false;

//   try {
//     const [orders, allItems] = await Promise.all([fetchOrders(), fetchOrderItems()]);
//     const order = orders.find((o) => o.id === orderId);
//     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

//     const orderItems = allItems.filter(
//       (i) => i.order_id === orderId && i.status !== "cancel"
//     );

//     if (target === "kitchen" || target === "all") {
//       const r = await printKitchenReceipt(order, orderItems);
//       if (r.ok) anyOk = true; else errors.push("Kitchen: " + r.error);
//     }
//     if (target === "billing" || target === "all") {
//       const r = await printBillingReceipt(order, orderItems);
//       if (r.ok) anyOk = true; else errors.push("Billing: " + r.error);
//     }

//     if (anyOk) {
//       // Update Laravel
//       await markAsPrinted(orderId);
//       // Save to local DB
//       await logPrint(orderId, order.order_code, target);
//     }

//     const labels = { kitchen: "Kitchen ticket", billing: "Billing receipt", all: "All" };
//     res.json({
//       success: anyOk,
//       message: errors.length > 0
//         ? labels[target] + " failed: " + errors.join(" | ")
//         : labels[target] + " printed successfully",
//       errors,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── PRINTER STATUS
// app.get("/printer-status", async (req, res) => {
//   try {
//     const p = makePrinter();
//     const connected = await p.isPrinterConnected();
//     res.json({ connected, name: CONFIG.PRINTER.name, interface: CONFIG.PRINTER.interface });
//   } catch (err) {
//     res.json({ connected: false, name: CONFIG.PRINTER.name, error: err.message });
//   }
// });

// // ── PRINT LOG — get history for one order
// app.get("/log/:orderId", async (req, res) => {
//   try {
//     const log = await getPrintLog(parseInt(req.params.orderId));
//     res.json({ success: true, data: log });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── PRINT LOG — get full history (last 200 records)
// app.get("/log", async (req, res) => {
//   try {
//     const [rows] = await db.execute(
//       "SELECT * FROM print_log ORDER BY printed_at DESC LIMIT 200"
//     );
//     res.json({ success: true, data: rows });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ══════════════════════════════════════════════════════════════════
// //  STARTUP — init DB first, then start server
// // ══════════════════════════════════════════════════════════════════
// initDB()
//   .then(() => {
//     app.listen(5002, () => {
//       console.log("🚀 Server on port 5002 — manual print only");
//       console.log("🖨️  USB: " + CONFIG.PRINTER.interface);
//       console.log("🗄️  DB:  mrbiryani_db @ " + CONFIG.DB.host);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ DB init failed — server not started:", err.message);
//     console.error("   Check your MySQL credentials in CONFIG.DB");
//     process.exit(1);
//   });












































































const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mysql = require("mysql2/promise");
const { printer: ThermalPrinter, types: PrinterTypes } = require("node-thermal-printer");

const app = express();
app.use(cors());
app.use(express.json());

// ══════════════════════════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════════════════════════
const CONFIG = {
  // ── New API endpoints
  ORDERS_API: "https://pngspace.com/orders_api.php",
  ITEMS_API: "https://pngspace.com/order_items_api.php",

  // ── Update print_status after printing
  // Change this to the correct URL when you have it
  // Expected: POST with { order_id: "ORD1001", print_status: "printed" }
  UPDATE_STATUS_URL: "https://pngspace.com/update_print_status.php",

  STORE_NAME: "Mr. Biryani",
  STORE_WEBSITE: "www.mrbiryani.com.au",
  STORE_ABN: "97606050210",
  STORE_ADDRESS: "73 Station St Pakenham VIC-3810",

  PRINTER: {
    name: "USB Printer",
    interface: "/dev/usb/lp0",   // Linux — change if needed
    type: PrinterTypes.EPSON,
  },

  DB: {
    host: "localhost",
    port: 3306,
    user: "root",        // your MySQL username
    password: "0112358", // your MySQL password
    database: "mrbiryani_db",
  },
};

// ══════════════════════════════════════════════════════════════════
//  DATABASE
// ══════════════════════════════════════════════════════════════════
let db;

async function initDB() {
  const bootstrap = await mysql.createConnection({
    host: CONFIG.DB.host, port: CONFIG.DB.port,
    user: CONFIG.DB.user, password: CONFIG.DB.password,
  });
  await bootstrap.execute(`CREATE DATABASE IF NOT EXISTS \`${CONFIG.DB.database}\``);
  await bootstrap.end();

  db = mysql.createPool({
    host: CONFIG.DB.host, port: CONFIG.DB.port,
    user: CONFIG.DB.user, password: CONFIG.DB.password,
    database: CONFIG.DB.database,
    waitForConnections: true, connectionLimit: 10,
  });

  await db.execute(`
    CREATE TABLE IF NOT EXISTS print_log (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      order_id      VARCHAR(64)  NOT NULL,
      order_code    VARCHAR(64)  DEFAULT NULL,
      print_target  VARCHAR(20)  NOT NULL,
      print_status  VARCHAR(20)  NOT NULL DEFAULT 'printed',
      reprint_count INT          NOT NULL DEFAULT 0,
      printed_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_order_id   (order_id),
      INDEX idx_printed_at (printed_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("✅ DB ready — mrbiryani_db.print_log");
}

async function logPrint(orderId, orderCode, target) {
  const [rows] = await db.execute(
    "SELECT id FROM print_log WHERE order_id = ? LIMIT 1", [orderId]
  );
  if (rows.length > 0) {
    await db.execute(
      `UPDATE print_log SET print_target=?, print_status='reprinted',
       reprint_count=reprint_count+1, printed_at=NOW() WHERE order_id=?`,
      [target, orderId]
    );
  } else {
    await db.execute(
      `INSERT INTO print_log (order_id, order_code, print_target, print_status)
       VALUES (?, ?, ?, 'printed')`,
      [orderId, orderCode || null, target]
    );
  }
  console.log("📝 DB logged — Order " + orderId);
}

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

// Billing item row — Name:24 | Price:10 | Total:8 = 42
// No qty in new API so: Name | Price
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
//  KITCHEN RECEIPT
//  New API fields: order_id, order_name, where_to_print
//  Items: item_name, price (no qty in new API)
// ══════════════════════════════════════════════════════════════════
async function printKitchenReceipt(order, items) {
  const p = makePrinter();

  p.println("");

  // Header
  p.setTextNormal();
  p.println(centre("*** New Order ***"));
  p.println(SEP);

  // Order name — big bold (e.g. "Table 5 - Dinner" or "Takeaway Counter")
  p.bold(true);
  p.setTextSize(0, 1);
  p.println(centre(order.order_name.toUpperCase()));
  p.setTextNormal();
  p.bold(false);
  p.println(SEP);

  // Order ID
  p.println(ml("Order ID: " + order.order_id));
  p.println(SEP);

  // Date/time
  p.println(ml("Date Time: " + formatDateTime(order.created_at)));
  p.println(SEP);

  // Total items — bold
  p.bold(true);
  p.println(centre("Total Items #  " + items.length));
  p.bold(false);
  p.println(SEP);

  // Items — name only, NO prices on kitchen ticket
  for (const item of items) {
    p.bold(true);
    p.print(ml("  "));
    p.bold(false);
    p.println(item.item_name);
  }
  p.println(SEP);

  // Ticket number — double-size bold
  p.bold(true);
  p.setTextSize(1, 1);
  p.println(centre(order.order_id));
  p.setTextNormal();
  p.bold(false);

  p.println("");
  p.println("");
  p.cut();

  try {
    await p.execute();
    console.log("✅ [Kitchen] Order " + order.order_id);
    return { ok: true };
  } catch (err) {
    console.error("❌ [Kitchen] Order " + order.order_id + ": " + err.message);
    return { ok: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════════════════
//  BILLING RECEIPT
// ══════════════════════════════════════════════════════════════════
async function printBillingReceipt(order, items) {
  const p = makePrinter();
  const total = items.reduce((s, i) => s + parseFloat(i.price || 0), 0);

  p.println("");

  // Store name
  p.bold(true);
  p.setTextSize(0, 1);
  p.println(centre(CONFIG.STORE_NAME));
  p.setTextNormal();
  p.bold(false);
  p.println(centre(CONFIG.STORE_WEBSITE));
  p.println(SEP);

  // Order info
  p.println(ml("Order: " + order.order_id));
  p.bold(true);
  p.println(ml(order.order_name));
  p.bold(false);
  p.println(SEP);

  // SALES INVOICE
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
    p.println(itemRowBilling(
      item.item_name,
      "$" + parseFloat(item.price || 0).toFixed(2)
    ));
  }
  p.println(SEP);

  // Total — bold
  p.bold(true);
  p.println(twoCol("TOTAL", "$" + total.toFixed(2)));
  p.bold(false);
  p.println(SEP);

  // Paid — double height bold
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
    console.log("✅ [Billing] Order " + order.order_id);
    return { ok: true };
  } catch (err) {
    console.error("❌ [Billing] Order " + order.order_id + ": " + err.message);
    return { ok: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════════════════
//  NEW API CALLS
// ══════════════════════════════════════════════════════════════════
async function fetchOrders() {
  const res = await axios.get(CONFIG.ORDERS_API);
  return res.data.data || [];
}

async function fetchOrderItems() {
  const res = await axios.get(CONFIG.ITEMS_API);
  return res.data.data || [];
}

// Update print_status in the API after printing
// POST to UPDATE_STATUS_URL with { order_id, print_status: "printed" }
async function markAsPrinted(orderId) {
  try {
    await axios.post(CONFIG.UPDATE_STATUS_URL, {
      order_id: orderId,
      print_status: "printed",
    });
    console.log("✅ API updated — Order " + orderId + " → printed");
  } catch (err) {
    console.error("❌ API update failed for " + orderId + ": " + err.message);
    // Not fatal — DB still logs it
  }
}

// ══════════════════════════════════════════════════════════════════
//  REST ENDPOINTS
// ══════════════════════════════════════════════════════════════════

// Orders — proxied for the dashboard
app.get("/orders", async (req, res) => {
  try { res.json({ success: true, data: await fetchOrders() }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Items — proxied for the dashboard
app.get("/orderitems", async (req, res) => {
  try { res.json({ success: true, data: await fetchOrderItems() }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── PRINT  (target = "kitchen" | "billing" | "all")
// Also respects where_to_print from the order itself when target = "auto"
app.post("/print/:orderId", async (req, res) => {
  // orderId here is the string like "ORD1001"
  const orderId = req.params.orderId;
  const target = req.body?.target || "all";
  const errors = [];
  let anyOk = false;

  try {
    const [orders, allItems] = await Promise.all([fetchOrders(), fetchOrderItems()]);

    // Match by order_id string
    const order = orders.find((o) => String(o.order_id) === String(orderId));
    if (!order) return res.status(404).json({ success: false, message: "Order " + orderId + " not found" });

    const orderItems = allItems.filter((i) => String(i.order_id) === String(orderId));

    // Determine what to actually print
    // "auto" = use where_to_print from API
    // otherwise use what the button pressed
    let printKitchen = false;
    let printBilling = false;

    if (target === "auto") {
      printKitchen = order.where_to_print === "kitchen" || order.where_to_print === "both";
      printBilling = order.where_to_print === "billing" || order.where_to_print === "both";
    } else {
      printKitchen = target === "kitchen" || target === "all";
      printBilling = target === "billing" || target === "all";
    }

    if (printKitchen) {
      const r = await printKitchenReceipt(order, orderItems);
      if (r.ok) anyOk = true; else errors.push("Kitchen: " + r.error);
    }
    if (printBilling) {
      const r = await printBillingReceipt(order, orderItems);
      if (r.ok) anyOk = true; else errors.push("Billing: " + r.error);
    }

    if (anyOk) {
      // Update status in the remote API
      await markAsPrinted(orderId);
      // Log to local DB
      await logPrint(orderId, order.order_id, target);
    }

    const labels = { kitchen: "Kitchen ticket", billing: "Billing receipt", all: "All", auto: "Auto" };
    res.json({
      success: anyOk,
      message: errors.length > 0
        ? (labels[target] || target) + " failed: " + errors.join(" | ")
        : (labels[target] || target) + " printed successfully",
      errors,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Printer status
app.get("/printer-status", async (req, res) => {
  try {
    const p = makePrinter();
    const connected = await p.isPrinterConnected();
    res.json({ connected, name: CONFIG.PRINTER.name, interface: CONFIG.PRINTER.interface });
  } catch (err) {
    res.json({ connected: false, name: CONFIG.PRINTER.name, error: err.message });
  }
});

// Print log
app.get("/log", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM print_log ORDER BY printed_at DESC LIMIT 200"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════
//  STARTUP
// ══════════════════════════════════════════════════════════════════
initDB()
  .then(() => {
    app.listen(5002, () => {
      console.log("🚀 Server on port 5002");
      console.log("📡 Orders API  : " + CONFIG.ORDERS_API);
      console.log("📡 Items API   : " + CONFIG.ITEMS_API);
      console.log("📡 Update URL  : " + CONFIG.UPDATE_STATUS_URL);
      console.log("🖨️  USB         : " + CONFIG.PRINTER.interface);
      console.log("🗄️  DB          : mrbiryani_db @ " + CONFIG.DB.host);
    });
  })
  .catch((err) => {
    console.error("❌ DB init failed:", err.message);
    process.exit(1);
  });