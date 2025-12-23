const translations = {
    ru: {
        title: "Дневник", newTradeTitle: "Новая сделка",
        coin: "Монета", position: "Позиция", date: "Дата", risk: "Риск ($)", profit: "Прибыль ($)", loss: "Убыток ($)", result: "Итог (%)", notes: "Сетап / Заметки",
        addPhoto: "Добавить фото", photoHint: "Макс. 3 фото", saveBtn: "Сохранить сделку", cancelBtn: "Отмена",
        historyTitle: "История", tableDate: "Дата", tablePair: "Пара", tablePos: "Поз.", tableAct: "Действия",
        equityTitle: "Кривая капитала", statTotal: "Всего сделок", statWinrate: "Винрейт", statNet: "Чистая прибыль", statFactor: "Профит фактор",
        navInput: "Ввод", navJournal: "Журнал", navAnalysis: "Анализ", modalTitle: "Просмотр", updateBtn: "Обновить запись",
        toastSaved: "Сделка сохранена!", toastUpdated: "Сделка обновлена!", toastDeleted: "Сделка удалена", confirmDelete: "Удалить запись?",
        achievementsTitle: "Достижения", scrollHint: "Свайп для просмотра",
        achieve1: "Первая кровь", achieve1Desc: "Первая закрытая сделка",
        achieve2: "Снайпер", achieve2Desc: "Винрейт > 60% (мин 5 сделок)",
        achieve3: "Кит", achieve3Desc: "Профит > $1000",
        achieve4: "Стальные яйца", achieve4Desc: "20+ сделок в журнале",
        emptyState: "История чиста. Время открыть первую сделку!", startBtn: "Начать",
        greetMorning: "Доброе утро, Трейдер", greetDay: "Продуктивного дня", greetEvening: "Добрый вечер", greetNight: "Рынок не спит, и ты тоже",
        dropHint: "Нажми или перетащи скриншот сюда",
        calcTitle: "Калькулятор Риска", calcDeposit: "Твой Депозит ($)", calcRiskPercent: "Риск (%)", calcApply: "Применить",
        weekDays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
        tapHint: "Нажми на день для подробностей",
        dayNet: "Чистый итог", dayTrades: "Сделки дня"
    },
    en: {
        title: "Journal", newTradeTitle: "New Trade",
        coin: "Coin", position: "Position", date: "Date", risk: "Risk ($)", profit: "Profit ($)", loss: "Loss ($)", result: "Result (%)", notes: "Setup / Notes",
        addPhoto: "Add Photo", photoHint: "Max 3 photos", saveBtn: "Save Trade", cancelBtn: "Cancel",
        historyTitle: "History", tableDate: "Date", tablePair: "Pair", tablePos: "Pos.", tableAct: "Actions",
        equityTitle: "Equity Curve", statTotal: "Total Trades", statWinrate: "Winrate", statNet: "Net Profit", statFactor: "Profit Factor",
        navInput: "Input", navJournal: "Journal", navAnalysis: "Analysis", modalTitle: "View Image", updateBtn: "Update Trade",
        toastSaved: "Trade Saved!", toastUpdated: "Trade Updated!", toastDeleted: "Trade Deleted", confirmDelete: "Delete record?",
        achievementsTitle: "Achievements", scrollHint: "Swipe to view table",
        achieve1: "First Blood", achieve1Desc: "First trade closed",
        achieve2: "Sniper", achieve2Desc: "Winrate > 60% (min 5 trades)",
        achieve3: "Whale", achieve3Desc: "Profit > $1000",
        achieve4: "Iron Hands", achieve4Desc: "20+ trades logged",
        emptyState: "History is clean. Time to make the first trade!", startBtn: "Start",
        greetMorning: "Good Morning", greetDay: "Good Afternoon", greetEvening: "Good Evening", greetNight: "Market never sleeps",
        dropHint: "Click or drag screenshot here",
        calcTitle: "Risk Calculator", calcDeposit: "Your Balance ($)", calcRiskPercent: "Risk (%)", calcApply: "Apply Risk",
        weekDays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        tapHint: "Tap on day to see details",
        dayNet: "Net Result", dayTrades: "Trades of the day"
    }
};

let trades = JSON.parse(localStorage.getItem("trades")) || [];
let coins = JSON.parse(localStorage.getItem("coins")) || ["BTC/USDT", "ETH/USDT", "SOL/USDT"];
let currentLang = localStorage.getItem("lang") || "ru";
let editId = null;
let equityChartInstance = null;
let currentImages = [];
let privacyMode = false;
let userBalance = localStorage.getItem("userBalance") || "";
let calendarDate = new Date();

window.onload = function() {
    setLang(currentLang);
    renderCoinSelect();
    document.getElementById("open_date").valueAsDate = new Date();
    updateStats();
    updateGreeting();
    setupDragAndDrop();
    document.getElementById("calcBalance").value = userBalance;
    updateCalcDisplay();
    VanillaTilt.init(document.querySelectorAll(".tilt-card"), { max: 15, speed: 400, glare: true, "max-glare": 0.1 });
};

function openCalculator() { new bootstrap.Modal(document.getElementById('calcModal')).show(); }

function updateCalcDisplay() {
    const bal = parseFloat(document.getElementById("calcBalance").value) || 0;
    const riskP = parseFloat(document.getElementById("calcRiskInput").value);
    document.getElementById("calcRiskDisplay").innerText = riskP + "%";
    const riskAmount = (bal * riskP) / 100;
    document.getElementById("calcResult").innerText = "$" + riskAmount.toFixed(2);
    localStorage.setItem("userBalance", bal);
}

function applyRisk() {
    const bal = parseFloat(document.getElementById("calcBalance").value) || 0;
    const riskP = parseFloat(document.getElementById("calcRiskInput").value);
    const riskAmount = (bal * riskP) / 100;
    document.getElementById("risk").value = riskAmount.toFixed(2);
    bootstrap.Modal.getInstance(document.getElementById('calcModal')).hide();
}

function generateShareCard(tradeId) {
    const t = trades.find(tr => tr.id === tradeId);
    if (!t) return;
    const canvas = document.getElementById('shareCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1080; canvas.height = 1080;
    const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
    gradient.addColorStop(0, '#161b22'); gradient.addColorStop(1, '#0f1115');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1080, 1080);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'; ctx.lineWidth = 2;
    for(let i=0; i<1080; i+=60) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1080, i); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1080); ctx.stroke(); }
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 120px Inter'; ctx.textAlign = 'center'; ctx.fillText(t.coin, 540, 400);
    const isWin = t.result > 0; const pnl = isWin ? t.profit : -t.loss; const sign = pnl > 0 ? '+' : '';
    ctx.fillStyle = isWin ? '#238636' : '#da3633'; ctx.font = 'bold 180px Roboto Mono';
    ctx.shadowColor = isWin ? 'rgba(35, 134, 54, 0.5)' : 'rgba(218, 54, 51, 0.5)'; ctx.shadowBlur = 40;
    ctx.fillText(`${sign}${pnl}$`, 540, 600); ctx.shadowBlur = 0;
    ctx.fillStyle = '#8b949e'; ctx.font = '60px Inter'; ctx.fillText(`ROI: ${t.result}%`, 540, 700);
    ctx.fillStyle = '#3b82f6'; ctx.font = 'bold 50px Inter'; ctx.fillText('СМОТРИТЕЛЬ РЫНКА', 540, 950);
    ctx.fillStyle = '#ffffff'; ctx.font = '30px Inter'; ctx.fillText(t.date, 540, 1000);
    const link = document.createElement('a'); link.download = `trade_${t.coin}_${t.date}.png`; link.href = canvas.toDataURL(); link.click();
}

function togglePrivacy() {
    privacyMode = !privacyMode;
    const btn = document.getElementById("privacyBtn"); const icon = btn.querySelector("i");
    if (privacyMode) { document.body.classList.add("privacy-active"); icon.classList.remove("fa-eye"); icon.classList.add("fa-eye-slash"); btn.classList.add("active"); showToast(currentLang === 'ru' ? "Режим инкогнито вкл." : "Privacy mode ON"); } 
    else { document.body.classList.remove("privacy-active"); icon.classList.remove("fa-eye-slash"); icon.classList.add("fa-eye"); btn.classList.remove("active"); }
    updateStats(); renderTable(); renderCalendar();
}

function setupDragAndDrop() {
    const dropZone = document.getElementById("dropZone"); const input = document.getElementById("imageInput");
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => { dropZone.addEventListener(eventName, e => {e.preventDefault(); e.stopPropagation();}, false); });
    ['dragenter', 'dragover'].forEach(eventName => { dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false); });
    ['dragleave', 'drop'].forEach(eventName => { dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false); });
    dropZone.addEventListener('drop', e => { const files = e.dataTransfer.files; input.files = files; handleImageSelect({ target: { files: files } }); }, false);
}

function updateGreeting() {
    const hour = new Date().getHours(); const t = translations[currentLang];
    let greet = t.greetDay;
    if (hour >= 5 && hour < 12) greet = t.greetMorning; else if (hour >= 18 && hour < 23) greet = t.greetEvening; else if (hour >= 23 || hour < 5) greet = t.greetNight;
    document.getElementById("greeting").innerText = greet + " | Смотритель Рынка";
}
function triggerConfetti() { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#3b82f6', '#8b5cf6', '#238636'] }); }
function setLang(lang) {
    currentLang = lang; localStorage.setItem("lang", lang);
    document.querySelectorAll('[data-translate]').forEach(el => { const key = el.getAttribute('data-translate'); if(translations[lang][key]) el.innerText = translations[lang][key]; });
    document.getElementById("setup").placeholder = lang === 'ru' ? "Почему вошел?" : "Why enter?"; document.getElementById("result").placeholder = "-1.5 / 3.2"; document.getElementById("appTitle").innerText = translations[lang].title;
    const submitBtnText = editId ? translations[lang].updateBtn : translations[lang].saveBtn; document.querySelector("#submitBtn span").innerText = submitBtnText;
    updateStats(); renderTable(); updateGreeting();
}
function handleImageSelect(event) {
    const files = event.target.files; if (!files.length) return;
    if (currentImages.length + files.length > 3) { alert(currentLang === 'ru' ? "Максимум 3 фото!" : "Max 3 photos!"); return; }
    Array.from(files).forEach(file => { const reader = new FileReader(); reader.onload = function(e) { compressImage(e.target.result, 800, 0.7).then(compressedSrc => { currentImages.push(compressedSrc); renderImagePreviews(); }); }; reader.readAsDataURL(file); });
}
function compressImage(src, maxWidth, quality) { return new Promise((resolve) => { const img = new Image(); img.src = src; img.onload = () => { const canvas = document.createElement('canvas'); let w = img.width, h = img.height; if (w > maxWidth) { h *= maxWidth / w; w = maxWidth; } canvas.width = w; canvas.height = h; canvas.getContext('2d').drawImage(img, 0, 0, w, h); resolve(canvas.toDataURL('image/jpeg', quality)); }; }); }
function renderImagePreviews() { const container = document.getElementById("imagePreviewContainer"); container.innerHTML = ""; currentImages.forEach((src, index) => { container.innerHTML += `<div class="img-thumbnail-wrapper"><img src="${src}" onclick="viewFullImage('${src}')"><button class="btn-remove-img" onclick="removeImage(${index})">×</button></div>`; }); }
function removeImage(index) { currentImages.splice(index, 1); renderImagePreviews(); }
function viewFullImage(src) { document.getElementById("modalImageFull").src = src; new bootstrap.Modal(document.getElementById('imageModal')).show(); }

function showSection(sectionId, element) {
    document.getElementById('mainSection').style.display = 'none'; document.getElementById('viewSection').style.display = 'none'; document.getElementById('statsSection').style.display = 'none';
    if(sectionId === 'main') document.getElementById('mainSection').style.display = 'block'; if(sectionId === 'view') { document.getElementById('viewSection').style.display = 'block'; renderTable(); } if(sectionId === 'stats') { document.getElementById('statsSection').style.display = 'block'; updateStats(); }
    document.querySelectorAll('.nav-link-custom').forEach(el => el.classList.remove('active')); if(element) element.classList.add('active');
}
function renderCoinSelect() { const select = document.getElementById("coin"); select.innerHTML = ""; coins.forEach(c => { let opt = document.createElement("option"); opt.value = c; opt.text = c; select.appendChild(opt); }); }
function addCustomCoin() { const val = prompt(currentLang === 'ru' ? "Введите пару:" : "Enter pair:"); if(val) { coins.push(val.toUpperCase()); localStorage.setItem("coins", JSON.stringify(coins)); renderCoinSelect(); document.getElementById("coin").value = val.toUpperCase(); } }

function saveTrade(e) {
    e.preventDefault();
    const trade = { id: editId || Date.now(), coin: document.getElementById("coin").value, position: document.getElementById("position").value, date: document.getElementById("open_date").value, risk: parseFloat(document.getElementById("risk").value) || 0, profit: parseFloat(document.getElementById("profit").value) || 0, loss: parseFloat(document.getElementById("loss").value) || 0, result: parseFloat(document.getElementById("result").value) || 0, setup: document.getElementById("setup").value, images: currentImages };
    if (trade.result > 0 && !editId) triggerConfetti();
    if(editId) { trades[trades.findIndex(t => t.id === editId)] = trade; showToast(translations[currentLang].toastUpdated); editId = null; document.querySelector("#submitBtn span").innerText = translations[currentLang].saveBtn; document.getElementById("cancelBtn").style.display = 'none'; } 
    else { trades.push(trade); showToast(translations[currentLang].toastSaved); }
    localStorage.setItem("trades", JSON.stringify(trades)); e.target.reset(); document.getElementById("open_date").valueAsDate = new Date(); currentImages = []; renderImagePreviews();
}
function deleteTrade(id) { if(confirm(translations[currentLang].confirmDelete)) { trades = trades.filter(t => t.id !== id); localStorage.setItem("trades", JSON.stringify(trades)); renderTable(); updateStats(); showToast(translations[currentLang].toastDeleted); } }
function editTrade(id) {
    const t = trades.find(t => t.id === id); if(!t) return;
    editId = id; document.getElementById("coin").value = t.coin; document.getElementById("position").value = t.position; document.getElementById("open_date").value = t.date; document.getElementById("risk").value = t.risk; document.getElementById("profit").value = t.profit; document.getElementById("loss").value = t.loss; document.getElementById("result").value = t.result; document.getElementById("setup").value = t.setup; currentImages = t.images || []; renderImagePreviews();
    document.querySelector("#submitBtn span").innerText = translations[currentLang].updateBtn; document.getElementById("cancelBtn").style.display = 'block'; showSection('main', document.querySelector('.nav-link-custom:nth-child(1)'));
}
function cancelEdit() { editId = null; document.getElementById("tradeForm").reset(); currentImages = []; renderImagePreviews(); document.querySelector("#submitBtn span").innerText = translations[currentLang].saveBtn; document.getElementById("cancelBtn").style.display = 'none'; }

function renderTable() {
    const tbody = document.getElementById("tradesBody"); tbody.innerHTML = "";
    if (trades.length === 0) { tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5"><i class="fas fa-rocket fa-3x text-muted mb-3 opacity-25"></i><h5 class="text-muted fw-normal">${translations[currentLang].emptyState}</h5><button class="btn btn-outline-primary btn-sm mt-2" onclick="showSection('main', document.querySelector('.nav-link-custom:nth-child(1)'))">${translations[currentLang].startBtn}</button></td></tr>`; return; }
    [...trades].sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(t => {
        const isWin = t.result > 0; const pnl = isWin ? t.profit : -t.loss; const pnlClass = isWin ? 'text-profit' : (t.result < 0 ? 'text-loss' : ''); const imageIcon = (t.images && t.images.length > 0) ? `<i class="fas fa-camera text-muted ms-1"></i>` : ''; const blurClass = "privacy-blur"; 
        tbody.innerHTML += `<tr><td class="text-muted small">${t.date}</td><td><strong class="text-white">${t.coin}</strong>${imageIcon}</td><td><span class="badge ${t.position === 'Long' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}">${t.position}</span></td><td class="text-end ${pnlClass} font-mono ${blurClass}">${pnl > 0 ? '+' : ''}${pnl}$</td><td class="text-end ${pnlClass} font-mono">${t.result}%</td><td class="text-center"><button class="btn btn-sm btn-link text-muted" onclick="generateShareCard(${t.id})" title="Share"><i class="fas fa-share-nodes"></i></button><button class="btn btn-sm btn-link text-muted" onclick="editTrade(${t.id})"><i class="fas fa-pen"></i></button><button class="btn btn-sm btn-link text-muted" onclick="deleteTrade(${t.id})"><i class="fas fa-trash"></i></button></td></tr>`;
    });
}
function updateStats() {
    const totalTrades = trades.length; const wins = trades.filter(t => t.result > 0).length; const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : 0;
    const totalProfit = trades.reduce((acc, t) => acc + (t.profit || 0), 0); const totalLoss = trades.reduce((acc, t) => acc + (t.loss || 0), 0); const netProfit = totalProfit - totalLoss; const profitFactor = totalLoss ? (totalProfit / totalLoss).toFixed(2) : (totalTrades > 0 ? "∞" : "0");
    document.getElementById("totalTrades").innerText = totalTrades; document.getElementById("winRate").innerText = winRate + "%";
    const netEl = document.getElementById("totalNetProfit"); netEl.innerText = netProfit.toFixed(2) + "$"; netEl.className = "stat-value font-mono privacy-target privacy-blur " + (netProfit >= 0 ? "text-success" : "text-danger");
    document.getElementById("profitFactor").innerText = profitFactor; 
    renderChart(); renderAchievements(totalTrades, netProfit, winRate); renderCalendar();
}
function renderAchievements(total, profit, winRate) {
    const grid = document.getElementById('achievementsGrid'); grid.innerHTML = ""; const t = translations[currentLang];
    const badges = [ { id: 1, name: t.achieve1, desc: t.achieve1Desc, icon: "fa-baby", unlocked: total >= 1 }, { id: 2, name: t.achieve2, desc: t.achieve2Desc, icon: "fa-crosshairs", unlocked: winRate >= 60 && total >= 5 }, { id: 3, name: t.achieve3, desc: t.achieve3Desc, icon: "fa-crown", unlocked: profit >= 1000 }, { id: 4, name: t.achieve4, desc: t.achieve4Desc, icon: "fa-hand-fist", unlocked: total >= 20 } ];
    badges.forEach(b => { grid.innerHTML += `<div class="col-6 col-md-3"><div class="achievement-card ${b.unlocked ? 'unlocked' : ''}" onclick="showAchieveDetail('${b.name}', '${b.desc}', '${b.icon}', ${b.unlocked})"><i class="fas ${b.icon} achievement-icon"></i><h6 class="mb-0 fw-bold">${b.name}</h6></div></div>`; });
}
function showAchieveDetail(name, desc, icon, unlocked) {
    document.getElementById("achieveModalTitle").innerText = name; document.getElementById("achieveModalDesc").innerText = desc;
    const iconEl = document.getElementById("achieveModalIcon"); iconEl.className = `fas ${icon} fa-3x mb-3 ${unlocked ? 'text-warning' : 'text-muted'}`;
    new bootstrap.Modal(document.getElementById('achievementModal')).show(); if(unlocked) triggerConfetti();
}
function renderChart() {
    const ctx = document.getElementById('equityChart').getContext('2d'); const sortedHistory = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date)); let balance = 0, labels = [], dataPoints = []; sortedHistory.forEach((t, index) => { balance += (t.result > 0) ? t.profit : -t.loss; labels.push(`${index + 1}`); dataPoints.push(balance); });
    if (equityChartInstance) equityChartInstance.destroy(); let gradient = ctx.createLinearGradient(0, 0, 0, 400); gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)'); gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
    equityChartInstance = new Chart(ctx, { type: 'line', data: { labels: labels, datasets: [{ label: 'Equity ($)', data: dataPoints, borderColor: '#3b82f6', backgroundColor: gradient, borderWidth: 2, pointRadius: 2, fill: true, tension: 0.4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { grid: { color: 'rgba(255,255,255,0.05)' } } } } });
}
function showToast(msg) { Toastify({ text: msg, duration: 3000, gravity: "bottom", position: "right", style: { background: "var(--primary-accent)" } }).showToast(); }

/* --- CALENDAR LOGIC --- */
function changeMonth(step) {
    calendarDate.setMonth(calendarDate.getMonth() + step);
    renderCalendar();
}

function renderCalendarHeader() {
    const header = document.getElementById("calendarHeader");
    const days = translations[currentLang].weekDays;
    header.innerHTML = "";
    days.forEach(day => {
        header.innerHTML += `<div>${day}</div>`;
    });
}

function renderCalendar() {
    renderCalendarHeader(); // Ensure header is localized
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    // Label
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthNamesRu = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    document.getElementById("calendarMonthLabel").innerText = `${currentLang === 'ru' ? monthNamesRu[month] : monthNames[month]} ${year}`;

    // Logic
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = document.getElementById("calendarGrid");
    grid.innerHTML = "";

    // Adjust for Monday start (ISO)
    let startOffset = firstDay === 0 ? 6 : firstDay - 1;

    // Empty slots
    for(let i=0; i<startOffset; i++) {
        grid.innerHTML += `<div class="calendar-day empty"></div>`;
    }

    // Days
    for(let day=1; day<=daysInMonth; day++) {
        const dateStr = `${year}-${String(month+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Find trades for this day
        const dayTrades = trades.filter(t => t.date === dateStr);
        let dayPnl = 0;
        dayTrades.forEach(t => {
            dayPnl += (t.result > 0 ? t.profit : -t.loss);
        });

        let content = `<span class="day-number">${day}</span>`;
        let classes = "calendar-day";
        
        if (dayTrades.length > 0) {
            if (dayPnl > 0) classes += " win";
            if (dayPnl < 0) classes += " loss";
            
            const pnlFormatted = (dayPnl > 0 ? "+" : "") + dayPnl.toFixed(0) + "$";
            const countText = dayTrades.length + (currentLang==='ru' ? " сд." : " tr.");
            
            content += `
                <div class="day-profit font-mono ${dayPnl >= 0 ? 'text-white' : 'text-white'} privacy-blur">${pnlFormatted}</div>
                <div class="day-count">${countText}</div>
            `;
        }

        grid.innerHTML += `<div class="${classes}" onclick="openDayDetails('${dateStr}')">${content}</div>`;
    }
}

function openDayDetails(dateStr) {
    const dayTrades = trades.filter(t => t.date === dateStr);
    
    // Set Modal Title
    document.getElementById("dayDetailsDate").innerText = dateStr;
    
    // Calc Net
    let net = 0;
    dayTrades.forEach(t => net += (t.result > 0 ? t.profit : -t.loss));
    
    const netEl = document.getElementById("dayDetailsNet");
    netEl.innerText = (net > 0 ? "+" : "") + net.toFixed(2) + "$";
    netEl.className = "font-mono mb-0 privacy-blur " + (net >= 0 ? "text-success" : "text-danger");
    
    document.getElementById("dayDetailsCount").innerText = dayTrades.length + (currentLang === 'ru' ? " Сделок" : " Trades");
    
    // List Trades
    const list = document.getElementById("dayTradesList");
    list.innerHTML = "";
    
    if(dayTrades.length === 0) {
        list.innerHTML = `<div class="text-center text-muted py-3 small">${currentLang==='ru' ? 'В этот день не было сделок' : 'No trades on this day'}</div>`;
    } else {
        dayTrades.forEach(t => {
            const isWin = t.result > 0;
            const pnl = isWin ? t.profit : -t.loss;
            list.innerHTML += `
                <div class="trade-mini-card">
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge ${t.position === 'Long' ? 'bg-success' : 'bg-danger'} bg-opacity-25 text-white" style="font-size:0.6rem">${t.position}</span>
                        <strong class="text-white">${t.coin}</strong>
                    </div>
                    <div class="text-end">
                        <div class="font-mono ${isWin ? 'text-success' : 'text-danger'} privacy-blur">${isWin?'+':''}${pnl}$</div>
                        <small>${t.result}%</small>
                    </div>
                </div>
            `;
        });
    }
    
    new bootstrap.Modal(document.getElementById('dayDetailsModal')).show();
}