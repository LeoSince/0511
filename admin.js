const API_URL = "/api/registration"
const $ = (id) => document.getElementById(id)
let adminPassword = ""

function setMessage(id, text, type = "error") {
  const el = $(id)
  el.textContent = text
  el.classList.remove("hidden", "success")
  if (type === "success") el.classList.add("success")
}

function hideMessage(id) {
  $(id).classList.add("hidden")
}

async function post(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  })
  const out = await res.json()
  if (!res.ok || !out.ok) throw new Error(out.error || "操作失败")
  return out
}

function renderList(title, rows, options = {}) {
  const showChoice = options.showChoice || false
  const showContact = options.showContact || false

  return `
    <div class="list">
      <div class="list-head">
        <h3>${title}</h3>
        <span class="badge">${rows.length} 人</span>
      </div>
      ${
        rows.length === 0
          ? `<p class="subtitle">暂无数据</p>`
          : `<div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>名字</th>
                    ${showChoice ? "<th>选择</th>" : ""}
                    ${showContact ? "<th>联系方式</th>" : ""}
                  </tr>
                </thead>
                <tbody>
                  ${rows
                    .map(
                      (row) => `
                        <tr>
                          <td class="muted">${escapeHtml(row.time || "")}</td>
                          <td>${escapeHtml(row.name || "未填写")}</td>
                          ${showChoice ? `<td>${escapeHtml(row.choice || "")}</td>` : ""}
                          ${showContact ? `<td>${escapeHtml(row.contact || "未填写")}</td>` : ""}
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>`
      }
    </div>
  `
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function render(data) {
  const rows = data.rows || []
  $("joinCount").textContent = data.stats?.join ?? 0
  $("noCount").textContent = data.stats?.no ?? 0
  $("maybeCount").textContent = data.stats?.maybe ?? 0

  $("lists").innerHTML =
    renderList("全部记录（含具体时间）", rows, { showChoice: true, showContact: true }) +
    renderList("参加名单", rows.filter((row) => row.choice === "参加")) +
    renderList("不参加名单", rows.filter((row) => row.choice === "不参加")) +
    renderList("我在想想名单", rows.filter((row) => row.choice === "我在想想"), { showContact: true })
}

async function loadAdmin() {
  hideMessage("adminMessage")
  const data = await post({ action: "list", password: adminPassword })
  render(data)
}

$("loginButton").addEventListener("click", async () => {
  adminPassword = $("password").value.trim()

  if (!adminPassword) {
    setMessage("loginMessage", "请输入后台密码。")
    return
  }

  $("loginButton").disabled = true
  $("loginButton").textContent = "进入中..."

  try {
    const data = await post({ action: "list", password: adminPassword })
    render(data)
    $("login").classList.add("hidden")
    $("admin").classList.remove("hidden")
  } catch (error) {
    setMessage("loginMessage", error.message || "密码不正确。")
  } finally {
    $("loginButton").disabled = false
    $("loginButton").textContent = "进入后台"
  }
})

$("refreshButton").addEventListener("click", async () => {
  try {
    await loadAdmin()
  } catch (error) {
    setMessage("adminMessage", error.message || "刷新失败。")
  }
})

$("clearButton").addEventListener("click", async () => {
  const ok = confirm("确定要清空所有报名记录吗？这个操作不能撤回。")
  if (!ok) return

  try {
    const data = await post({ action: "clear", password: adminPassword })
    render(data)
    setMessage("adminMessage", "记录已清空。", "success")
  } catch (error) {
    setMessage("adminMessage", error.message || "清空失败。")
  }
})
