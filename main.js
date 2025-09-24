let drivers = JSON.parse(localStorage.getItem("drivers")) || [];
let routes = JSON.parse(localStorage.getItem("routes")) || [];

const driversTable = document.querySelector("#driversTable tbody");
const searchDriver = document.getElementById("searchDriver");
const driverSubmitBtn = document.getElementById("driverSubmitBtn");
const driverCancelBtn = document.getElementById("driverCancelBtn");

const routeDriver = document.getElementById("routeDriver");
const routesTable = document.querySelector("#routesTable tbody");
const searchRoute = document.getElementById("searchRoute");
const routeSubmitBtn = document.getElementById("routeSubmitBtn");
const routeCancelBtn = document.getElementById("routeCancelBtn");

const resetBtn = document.getElementById("resetBtn");
const calendarDiv = document.getElementById("calendar");
const calendarDetails = document.getElementById("calendarDetails");
const monthFilter = document.getElementById("monthFilter");

function saveData() {
  localStorage.setItem("drivers", JSON.stringify(drivers));
  localStorage.setItem("routes", JSON.stringify(routes));
}

function escapeHtml(s) {
  if (!s) return "";
  return String(s).replaceAll("&","&amp;")
                  .replaceAll("<","&lt;")
                  .replaceAll(">","&gt;")
                  .replaceAll('"',"&quot;")
                  .replaceAll("'", "&#039;");
}

function populateRouteDriverSelect() {
  routeDriver.innerHTML = '<option value="">Unassigned</option>';
  drivers.forEach(d => {
    const option = document.createElement('option');
    option.value = d.id;
    option.textContent = d.name;
    routeDriver.appendChild(option);
  });
}

function renderDrivers(filter = "") {
  driversTable.innerHTML = "";
  const q = filter.trim().toLowerCase();

  drivers.filter(d => {
    if (!q) return true;
    return (d.name || "").toLowerCase().includes(q) ||
           (d.email || "").toLowerCase().includes(q) ||
           (d.company || "").toLowerCase().includes(q);
  }).forEach(d => {
    // الحالة يتم حسابها ديناميكيًا
    const assigned = routes.some(r => r.driverId && String(r.driverId) === String(d.id));
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${escapeHtml(d.name)}</td>
                    <td>${escapeHtml(d.email)}</td>
                    <td>${escapeHtml(d.company || "-")}</td>
                    <td>${assigned ? '<span class="busy">Busy</span>' : '<span class="available">Available</span>'}</td>
                    <td>
                      <button class="btn btn-sm btn-warning action-btn" onclick="editDriver(${d.id})">Edit</button>
                      <button class="btn btn-sm btn-danger action-btn" onclick="deleteDriver(${d.id})">Delete</button>
                    </td>`;
    driversTable.appendChild(tr);
  });

  populateRouteDriverSelect(); // تحديث الاختيار مباشرة
  renderCalendar();
}

function renderRoutes(filter = "") {
  routesTable.innerHTML = "";
  const q = filter.trim().toLowerCase();

  routes.filter(r => {
    if (!q) return true;
    const drv = drivers.find(d => String(d.id) === String(r.driverId));
    const driverName = drv ? drv.name : "";
    return (r.from || "").toLowerCase().includes(q) ||
           (r.to || "").toLowerCase().includes(q) ||
           (r.date || "").toLowerCase().includes(q) ||
           (driverName || "").toLowerCase().includes(q);
  }).forEach(r => {
    const drv = drivers.find(d => String(d.id) === String(r.driverId));
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${escapeHtml(r.from)}</td>
                    <td>${escapeHtml(r.to)}</td>
                    <td>${escapeHtml(r.date)}</td>
                    <td>${drv ? escapeHtml(drv.name) : '<span class="text-muted">Unassigned</span>'}</td>
                    <td>
                      <button class="btn btn-sm btn-warning action-btn" onclick="editRoute(${r.id})">Edit</button>
                      <button class="btn btn-sm btn-danger action-btn" onclick="deleteRoute(${r.id})">Delete</button>
                    </td>`;
    routesTable.appendChild(tr);
  });
  renderCalendar();
}

document.getElementById("driverForm").addEventListener("submit", e => {
  e.preventDefault();
  const editId = document.getElementById("driverEditId").value;
  const name = document.getElementById("driverName").value.trim();
  const email = document.getElementById("driverEmail").value.trim();
  const company = document.getElementById("driverCompany").value.trim();

  if (editId) {
    const idx = drivers.findIndex(d => String(d.id) === String(editId));
    if (idx !== -1) drivers[idx] = { id: Number(editId), name, email, company };
  } else {
    drivers.push({ id: Date.now(), name, email, company });
  }

  saveData();
  renderDrivers(searchDriver.value);
  document.getElementById("driverForm").reset();
  document.getElementById("driverEditId").value = "";
  driverSubmitBtn.textContent = "Add";
  driverCancelBtn.classList.add("d-none");
});

document.getElementById("routeForm").addEventListener("submit", e => {
  e.preventDefault();
  const editId = document.getElementById("routeEditId").value;
  const from = document.getElementById("routeFrom").value.trim();
  const to = document.getElementById("routeTo").value.trim();
  const date = document.getElementById("routeDate").value;
  const driverIdRaw = document.getElementById("routeDriver").value;
  const driverId = driverIdRaw ? String(driverIdRaw) : null;

  if (editId) {
    const idx = routes.findIndex(r => String(r.id) === String(editId));
    if (idx !== -1) routes[idx] = { id: Number(editId), from, to, date, driverId };
  } else {
    routes.push({ id: Date.now(), from, to, date, driverId });
  }

  saveData();
  renderRoutes(searchRoute.value);
  renderDrivers(searchDriver.value); // تحديث الحالة مباشرة
  document.getElementById("routeForm").reset();
  document.getElementById("routeEditId").value = "";
  routeSubmitBtn.textContent = "Add";
  routeCancelBtn.classList.add("d-none");
});

driverCancelBtn.addEventListener("click", () => {
  document.getElementById("driverForm").reset();
  document.getElementById("driverEditId").value = "";
  driverSubmitBtn.textContent = "Add";
  driverCancelBtn.classList.add("d-none");
});

routeCancelBtn.addEventListener("click", () => {
  document.getElementById("routeForm").reset();
  document.getElementById("routeEditId").value = "";
  routeSubmitBtn.textContent = "Add";
  routeCancelBtn.classList.add("d-none");
});

function editDriver(id) {
  const d = drivers.find(x => x.id === id);
  if (!d) return;
  document.getElementById("driverEditId").value = d.id;
  document.getElementById("driverName").value = d.name;
  document.getElementById("driverEmail").value = d.email;
  document.getElementById("driverCompany").value = d.company || "";
  driverSubmitBtn.textContent = "Update";
  driverCancelBtn.classList.remove("d-none");
}

function deleteDriver(id) {
  if (!confirm("Delete driver?")) return;
  drivers = drivers.filter(d => d.id !== id);
  routes = routes.map(r => String(r.driverId) === String(id) ? {...r, driverId: null} : r);
  saveData();
  renderDrivers(searchDriver.value);
  renderRoutes(searchRoute.value);
}

function editRoute(id) {
  const r = routes.find(x => x.id === id);
  if (!r) return;
  document.getElementById("routeEditId").value = r.id;
  document.getElementById("routeFrom").value = r.from;
  document.getElementById("routeTo").value = r.to;
  document.getElementById("routeDate").value = r.date;
  document.getElementById("routeDriver").value = r.driverId || "";
  routeSubmitBtn.textContent = "Update";
  routeCancelBtn.classList.remove("d-none");
}

function deleteRoute(id) {
  if (!confirm("Delete route?")) return;
  routes = routes.filter(r => r.id !== id);
  saveData();
  renderRoutes(searchRoute.value);
  renderDrivers(searchDriver.value); // تحديث الحالة مباشرة
}

resetBtn.addEventListener("click", () => {
  if (!confirm("This will clear all data. Continue?")) return;
  localStorage.removeItem("drivers");
  localStorage.removeItem("routes");
  drivers = [];
  routes = [];
  renderDrivers();
  renderRoutes();
  calendarDetails.innerHTML = "";
});

function renderCalendar() {
  calendarDiv.innerHTML = "";
  const selectedMonth = monthFilter.value || new Date().toISOString().slice(0,7);
  const filteredRoutes = routes.filter(r => r.date.startsWith(selectedMonth));
  const uniqueDays = [...new Set(filteredRoutes.map(r => r.date))].sort();
  if (!uniqueDays.length) {
    calendarDiv.innerHTML = `<p class="text-muted">No routes this month</p>`;
    return;
  }

  uniqueDays.forEach(dateStr => {
    const div = document.createElement("div");
    div.className = "day has-route";
    const day = dateStr.split("-")[2];
    div.innerHTML = `<div style="font-weight:600">${day}</div>`;
    const dayRoutes = filteredRoutes.filter(r => r.date === dateStr);
    dayRoutes.slice(0,3).forEach(dr => {
      const drv = drivers.find(d => String(d.id) === String(dr.driverId));
      const span = document.createElement("div");
      span.style.marginTop = "6px";
      span.innerHTML = `<small>${escapeHtml(dr.from)}→${escapeHtml(dr.to)}</small><br>
                        <span class="${drv ? 'badge-assigned' : 'badge-unassigned'}">${drv ? escapeHtml(drv.name) : 'Unassigned'}</span>`;
      div.appendChild(span);
    });
    div.onclick = () => showCalendarDetails(dateStr);
    calendarDiv.appendChild(div);
  });
}

function showCalendarDetails(date) {
  const dayRoutes = routes.filter(r => r.date === date);
  if (!dayRoutes.length) {
    calendarDetails.innerHTML = `<p class="text-muted">No routes on ${date}</p>`;
    return;
  }
  let html = `<h6>Routes on ${date}</h6><ul class="list-group">`;
  dayRoutes.forEach(r => {
    const drv = drivers.find(d => String(d.id) === String(r.driverId));
    html += `<li class="list-group-item d-flex justify-content-between align-items-center">
               <div>${escapeHtml(r.from)} → ${escapeHtml(r.to)}</div>
               <div>${drv ? escapeHtml(drv.name) : '<span class="text-muted">Unassigned</span>'}</div>
             </li>`;
  });
  html += `</ul>`;
  calendarDetails.innerHTML = html;
}

monthFilter.addEventListener("change", renderCalendar);
searchDriver.addEventListener("input", () => renderDrivers(searchDriver.value));
searchRoute.addEventListener("input", () => renderRoutes(searchRoute.value));

renderDrivers();
renderRoutes();
renderCalendar();
