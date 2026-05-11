import { getStore } from "@netlify/blobs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "0712"
const STORE_NAME = "game-registration"
const RECORDS_KEY = "records.json"

const headers = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers })
}

async function readBody(request) {
  try {
    return await request.json()
  } catch {
    try {
      const text = await request.text()
      return Object.fromEntries(new URLSearchParams(text))
    } catch {
      return {}
    }
  }
}

function getStats(rows) {
  return {
    join: rows.filter((row) => row.choice === "参加").length,
    no: rows.filter((row) => row.choice === "不参加").length,
    maybe: rows.filter((row) => row.choice === "我在想想").length,
  }
}

async function getRows() {
  const store = getStore(STORE_NAME)
  const rows = await store.get(RECORDS_KEY, { type: "json" })
  return Array.isArray(rows) ? rows : []
}

async function saveRows(rows) {
  const store = getStore(STORE_NAME)
  await store.set(RECORDS_KEY, JSON.stringify(rows), {
    contentType: "application/json; charset=utf-8",
  })
}

function nowInChina() {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace(/\//g, "-")
}

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("", { status: 204, headers })
  }

  if (request.method === "GET") {
    return json({ ok: true, message: "Registration API is running." })
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405)
  }

  const data = await readBody(request)
  const action = data.action || ""

  if (action === "list") {
    if (data.password !== ADMIN_PASSWORD) {
      return json({ ok: false, error: "后台密码不正确" }, 401)
    }

    const rows = await getRows()
    return json({ ok: true, stats: getStats(rows), rows })
  }

  if (action === "clear") {
    if (data.password !== ADMIN_PASSWORD) {
      return json({ ok: false, error: "后台密码不正确" }, 401)
    }

    await saveRows([])
    return json({ ok: true, cleared: true, stats: getStats([]), rows: [] })
  }

  const name = String(data.name || "").trim()
  const choice = String(data.choice || "").trim()
  const contact = String(data.contact || "").trim()
  const note = String(data.note || "").trim()

  if (!name) {
    return json({ ok: false, error: "请填写名字" }, 400)
  }

  if (!["参加", "不参加", "我在想想"].includes(choice)) {
    return json({ ok: false, error: "请选择有效选项" }, 400)
  }

  const rows = await getRows()
  rows.push({
    id: crypto.randomUUID(),
    time: nowInChina(),
    name,
    choice,
    contact,
    note,
  })

  await saveRows(rows)
  return json({ ok: true, stats: getStats(rows) })
}
