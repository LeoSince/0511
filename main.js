const GAME_URL = "https://revelation.framer.ai/"
const API_URL = "/api/registration"

const $ = (id) => document.getElementById(id)

function show(id) {
  for (const section of document.querySelectorAll("section")) {
    section.classList.add("hidden")
  }
  $(id).classList.remove("hidden")
}

function setMessage(id, text, type = "error") {
  const el = $(id)
  el.textContent = text
  el.classList.remove("hidden", "success")
  if (type === "success") el.classList.add("success")
}

async function post(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  })
  const out = await res.json()
  if (!res.ok || !out.ok) throw new Error(out.error || "提交失败")
  return out
}

document.querySelectorAll("[data-choice]").forEach((button) => {
  button.addEventListener("click", async () => {
    const choice = button.dataset.choice
    const name = $("name").value.trim()

    if (!name) {
      setMessage("homeMessage", "请先输入您的名字，可填写拼音缩写。")
      return
    }

    if (choice === "我在想想") {
      $("contactName").value = name
      show("contact")
      return
    }

    button.disabled = true
    button.textContent = "提交中..."

    try {
      await post({ name, choice, contact: "", note: "首页选择" })

      if (choice === "参加") {
        location.href = GAME_URL
      } else {
        show("thanks")
      }
    } catch (error) {
      setMessage("homeMessage", error.message || "提交失败，请稍后再试。")
    } finally {
      button.disabled = false
      button.textContent = choice
    }
  })
})

$("submitContact").addEventListener("click", async () => {
  const name = $("contactName").value.trim()
  const contact = $("contact").value.trim()

  if (!name) {
    setMessage("contactMessage", "请填写您的名字。")
    return
  }

  if (!contact) {
    setMessage("contactMessage", "请填写联系方式。")
    return
  }

  $("submitContact").disabled = true
  $("submitContact").textContent = "提交中..."

  try {
    await post({ name, choice: "我在想想", contact, note: "联系方式页提交" })
    show("done")
  } catch (error) {
    setMessage("contactMessage", error.message || "提交失败，请稍后再试。")
  } finally {
    $("submitContact").disabled = false
    $("submitContact").textContent = "提交联系方式"
  }
})

$("backHome1").addEventListener("click", () => show("home"))
$("backHome2").addEventListener("click", () => show("home"))
$("backHome3").addEventListener("click", () => show("home"))
