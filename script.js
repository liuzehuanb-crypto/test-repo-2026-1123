const STORAGE_KEY = "training-log-v1";
const list = document.querySelector("#exercise-list");
let exercises = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let remaining = 0;
let interval = null;
let restSeconds = 90;
const timer = document.querySelector("#timer");
const toggle = document.querySelector("#timer-toggle");

// 把动作记录存到浏览器，下次打开页面仍然能看到。
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
}
function showTime() {
  timer.textContent = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
}
function render() {
  list.innerHTML = "";
  document.querySelector("#empty").hidden = exercises.length > 0;
  let completed = 0;
  let total = 0;
  exercises.forEach((exercise, index) => {
    total += exercise.target;
    completed += exercise.done;
    const card = document.createElement("article");
    card.className = "exercise";
    card.innerHTML = `<div class="exercise-head"><div><div class="exercise-name"></div><div class="exercise-meta"><span class="count"></span><span>·</span><span>${exercise.target} 组计划</span></div></div><div class="exercise-actions"><button class="done-btn">${exercise.done >= exercise.target ? "已完成 ✓" : "完成本组 ＋"}</button><button class="remove-btn" aria-label="删除动作">×</button></div></div><div class="sets"></div>`;
    card.querySelector(".exercise-name").textContent = exercise.name;
    card.querySelector(".count").textContent = `已完成 ${exercise.done} 组`;
    for (let i = 0; i < exercise.target; i++) {
      const dot = document.createElement("span");
      dot.className = `set-dot ${i < exercise.done ? "done" : ""}`;
      dot.textContent = i < exercise.done ? "✓" : String(i + 1);
      card.querySelector(".sets").append(dot);
    }
    card.querySelector(".done-btn").onclick = () => {
      if (exercise.done >= exercise.target) return;
      exercise.done++;
      save(); render();
      startRest();
    };
    card.querySelector(".remove-btn").onclick = () => { exercises.splice(index, 1); save(); render(); };
    list.append(card);
  });
  document.querySelector("#progress").textContent = `${completed} / ${total} 组`;
}
function startRest() {
  clearInterval(interval);
  remaining = restSeconds;
  showTime();
  document.querySelector("#timer-dot").classList.add("active");
  toggle.textContent = "暂停休息";
  document.querySelector("#timer-label").textContent = "正在休息 · 深呼吸一下";
  interval = setInterval(() => {
    remaining--;
    showTime();
    if (remaining <= 0) {
      clearInterval(interval); interval = null;
      document.querySelector("#timer-dot").classList.remove("active");
      toggle.textContent = "开始休息";
      document.querySelector("#timer-label").textContent = "休息结束，准备下一组";
      if ("vibrate" in navigator) navigator.vibrate([180, 100, 180]);
    }
  }, 1000);
}
document.querySelector("#add-form").addEventListener("submit", event => {
  event.preventDefault();
  exercises.push({ name: document.querySelector("#exercise").value.trim(), target: Number(document.querySelector("#sets").value), done: 0 });
  save(); render(); event.target.reset(); document.querySelector("#sets").value = 4;
  document.querySelector("#exercise").focus();
});
toggle.onclick = () => {
  if (interval) {
    clearInterval(interval); interval = null; toggle.textContent = "继续休息";
    document.querySelector("#timer-dot").classList.remove("active");
  } else if (remaining > 0) {
    document.querySelector("#timer-dot").classList.add("active"); toggle.textContent = "暂停休息";
    interval = setInterval(() => { remaining--; showTime(); if (remaining <= 0) { clearInterval(interval); interval = null; toggle.textContent = "开始休息"; document.querySelector("#timer-label").textContent = "休息结束，准备下一组"; document.querySelector("#timer-dot").classList.remove("active"); } }, 1000);
  } else startRest();
};
document.querySelector("#timer-reset").onclick = () => { clearInterval(interval); interval = null; remaining = 0; showTime(); toggle.textContent = "开始休息"; document.querySelector("#timer-dot").classList.remove("active"); document.querySelector("#timer-label").textContent = "组间休息时间"; };
document.querySelector("#rest-input").onchange = event => { restSeconds = Math.max(10, Math.min(600, Number(event.target.value) || 90)); event.target.value = restSeconds; };
document.querySelector("#clear-workout").onclick = () => { if (exercises.length && confirm("清空今天的所有训练记录？")) { exercises = []; save(); render(); } };
const now = new Date();
document.querySelector("#date").textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
showTime(); render();
