// 時刻表データ（後で変更可能）
const trainSchedule = {
  岡崎: [
    "05:53",
    "06:18",
    "06:43",
    "06:59",
    "07:15",
    "07:31",
    "07:47",
    "08:03",
    "08:19",
    "08:35",
    "08:51",
    "09:07",
    "09:23",
    "09:39",
    "09:55",
    "10:11",
    "10:32",
    "10:49",
    "11:05",
    "11:21",
    "11:37",
    "11:53",
    "12:09",
    "12:25",
    "12:41",
    "12:57",
    "13:13",
    "13:29",
    "13:45",
    "14:01",
    "14:17",
    "14:33",
    "14:49",
    "15:05",
    "15:21",
    "15:37",
    "15:53",
    "16:09",
    "16:25",
    "16:41",
    "16:57",
    "17:13",
    "17:29",
    "17:45",
    "18:01",
    "18:17",
    "18:33",
    "18:49",
    "19:05",
    "19:21",
    "19:37",
    "19:53",
    "20:09",
    "20:25",
    "20:41",
    "20:57",
    "21:14",
    "21:30",
    "21:47",
    "22:06",
    "22:24",
    "22:43",
    "22:56",
    "23:20",
    "23:38",
    "00:03",
    "00:22",
  ],
  高蔵寺: [
    "05:31",
    "05:59",
    "06:13",
    "06:24",
    "06:43",
    "07:00",
    "07:22",
    "07:27",
    "07:38",
    "07:43",
    "07:54",
    "07:59",
    "08:10",
    "08:15",
    "08:26",
    "08:31",
    "08:42",
    "08:47",
    "08:58",
    "09:03",
    "09:14",
    // "09:26",
    "09:30",
    "09:46",
    "10:02",
    "10:19",
    "10:40",
    "10:56",
    "11:12",
    "11:28",
    "11:44",
    "12:00",
    "12:16",
    "12:32",
    "12:48",
    "13:04",
    "13:20",
    "13:36",
    "13:52",
    "14:08",
    "14:24",
    "14:40",
    "14:56",
    "15:12",
    "15:28",
    "15:44",
    "16:01",
    "16:17",
    "16:33",
    "16:49",
    "17:04",
    "17:20",
    "17:36",
    "17:52",
    "18:08",
    "18:24",
    "18:40",
    "18:56",
    "19:12",
    "19:28",
    "19:44",
    "20:00",
    "20:17",
    "20:33",
    "20:49",
    "21:05",
    "21:21",
    "21:37",
    "21:54",
    "22:13",
    "22:30",
    "22:49",
    "23:14",
    "23:59",
  ],
};

let currentDirection = "岡崎";
let selectedTargetTime = null;
let notifyBeforeMinutes = 10; // 通知の○分前（デフォルト）

// --- 方面切り替え ---
document.querySelectorAll(".direction-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".direction-btn").forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
    currentDirection = this.dataset.direction;
    updateTargetTrainOptions();
    updateTimeTable();
    updateCountdowns();
  });
});

// --- 目標電車選択 ---
document.getElementById("targetTrain").addEventListener("change", function () {
  selectedTargetTime = this.value;
  const targetCard = document.getElementById("targetTrainCard");
  targetCard.style.display = selectedTargetTime ? "block" : "none";
  updateCountdowns();
});

// --- 設定モーダル関連 ---
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");
const notifyBeforeInput = document.getElementById("notifyBefore");

settingsBtn.addEventListener("click", () => {
  settingsModal.classList.add("show");
  notifyBeforeInput.value = notifyBeforeMinutes;
});
closeSettings.addEventListener("click", () => settingsModal.classList.remove("show"));
settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) settingsModal.classList.remove("show");
});

// --- 通知時間変更 ---
notifyBeforeInput.addEventListener("change", () => {
  notifyBeforeMinutes = parseInt(notifyBeforeInput.value) || 5;
  updateCountdowns();
});

// --- プルダウンオプション更新 ---
function updateTargetTrainOptions() {
  const select = document.getElementById("targetTrain");
  const times = trainSchedule[currentDirection];
  select.innerHTML = '<option value="">自動で次の電車を表示</option>';
  times.forEach((time) => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time + " 発";
    select.appendChild(option);
  });
}

// --- 時刻表表示更新 ---
function updateTimeTable() {
  const timeTableList = document.getElementById("timeTableList");
  const times = trainSchedule[currentDirection];
  timeTableList.innerHTML = times.map((time) => `<div class="time-item">${time}</div>`).join("");
}

// --- カウントダウン更新（秒対応版） ---
function updateCountdowns() {
  const now = new Date();
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const times = trainSchedule[currentDirection];
  const notifyBefore = notifyBeforeMinutes * 60;

  // 次の電車を探す
  let nextTime = null;
  let nextSecDiff = Infinity;
  times.forEach((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const departureSeconds = hours * 3600 + minutes * 60;
    let diff = departureSeconds - currentSeconds;
    if (diff < 0) diff += 24 * 3600;
    if (diff < nextSecDiff) {
      nextSecDiff = diff;
      nextTime = time;
    }
  });

  if (nextTime) updateCountdownDisplay("next", nextTime, nextSecDiff, notifyBefore);

  if (selectedTargetTime) {
    const [hours, minutes] = selectedTargetTime.split(":").map(Number);
    const departureSeconds = hours * 3600 + minutes * 60;
    let diff = departureSeconds - currentSeconds;
    if (diff < 0) diff += 24 * 3600;
    updateCountdownDisplay("target", selectedTargetTime, diff, notifyBefore);
  }
}

// --- カウントダウン表示更新（秒表示＋音なし） ---
function updateCountdownDisplay(type, time, secDiff, notifyBefore) {
  const trainTimeEl = document.getElementById(`${type}TrainTime`);
  const countdownEl = document.getElementById(`${type}Countdown`);
  const catAnimationEl = document.getElementById(`${type}CatAnimation`);
  const alertEl = document.getElementById(`${type}Alert`);

  trainTimeEl.textContent = `${time} 発`;

  const hours = Math.floor(secDiff / 3600);
  const minutes = Math.floor((secDiff % 3600) / 60);
  const seconds = secDiff % 60;

  if (hours > 0) {
    countdownEl.textContent = `あと ${hours}時間${minutes}分${seconds}秒`;
  } else if (minutes > 0) {
    countdownEl.textContent = `あと ${minutes}分${seconds}秒`;
  } else {
    countdownEl.textContent = `あと ${seconds}秒`;
  }

  if (secDiff <= notifyBefore && secDiff > 0) {
    catAnimationEl.style.display = "block";
    alertEl.style.display = "block";
  } else {
    catAnimationEl.style.display = "none";
    alertEl.style.display = "none";
  }
}

// --- 音は鳴らさないので空関数 ---
function playNotificationSound() {}

// --- 初期化 ---
updateTargetTrainOptions();
updateTimeTable();
updateCountdowns();

// --- 1秒ごとに更新 ---
setInterval(updateCountdowns, 1000);
