// Effect v4 course: shared behaviour for lessons and reference pages.
//
// Quiz markup (options are shuffled on load; mark the right one with data-correct):
//   <div class="quiz">
//     <p class="q">Question?</p>
//     <ol>
//       <li><button class="option" data-correct>Answer</button><span data-why>Why it's right.</span></li>
//       <li><button class="option">Distractor</button><span data-why>Why it's wrong.</span></li>
//     </ol>
//     <p class="feedback" aria-live="polite"></p>
//   </div>
//
// Command with copy button:  <div class="cmd"><pre><code>node lessons/…</code></pre></div>

(function () {
  "use strict"

  // ---------- Quizzes ----------
  const quizzes = Array.from(document.querySelectorAll(".quiz"))
  let firstTryRight = 0
  let answered = 0

  const scoreEl = (() => {
    if (quizzes.length === 0) return null
    let el = document.querySelector(".quiz-score")
    if (!el) {
      el = document.createElement("p")
      el.className = "quiz-score"
      quizzes[quizzes.length - 1].after(el)
    }
    return el
  })()

  const renderScore = () => {
    if (!scoreEl) return
    scoreEl.textContent =
      answered < quizzes.length
        ? `Answered ${answered} of ${quizzes.length}. First-try score so far: ${firstTryRight}.`
        : `First-try score: ${firstTryRight} / ${quizzes.length}. Questions you missed are worth asking your teacher about.`
  }

  for (const quiz of quizzes) {
    const list = quiz.querySelector("ol")
    const feedback = quiz.querySelector(".feedback")
    const items = Array.from(list.children)
    // Fisher–Yates shuffle so the answer position carries no signal
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[items[i], items[j]] = [items[j], items[i]]
    }
    items.forEach((li) => list.appendChild(li))

    let attempts = 0
    let done = false
    list.addEventListener("click", (event) => {
      const button = event.target.closest("button.option")
      if (!button || done || button.disabled) return
      attempts++
      const why = button.parentElement.querySelector("[data-why]")
      const explanation = why ? " " + why.textContent : ""
      if (button.hasAttribute("data-correct")) {
        done = true
        button.classList.add("right")
        list.querySelectorAll("button.option").forEach((b) => (b.disabled = true))
        feedback.className = "feedback right"
        feedback.textContent = "Correct." + explanation
        answered++
        if (attempts === 1) firstTryRight++
        renderScore()
      } else {
        button.classList.add("wrong")
        button.disabled = true
        feedback.className = "feedback wrong"
        feedback.textContent = "Not quite." + explanation + " Try again."
      }
    })
  }
  renderScore()

  // ---------- Copy buttons ----------
  for (const cmd of document.querySelectorAll(".cmd")) {
    const button = document.createElement("button")
    button.type = "button"
    button.textContent = "Copy"
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(cmd.querySelector("pre").innerText.trim())
        button.textContent = "Copied"
      } catch {
        button.textContent = "Select & copy"
      }
      setTimeout(() => (button.textContent = "Copy"), 1500)
    })
    cmd.appendChild(button)
  }

  // ---------- Print: open recall answers ----------
  window.addEventListener("beforeprint", () => {
    document.querySelectorAll(".recall details").forEach((d) => (d.open = true))
  })

  // ---------- Syntax highlighting (optional; plain code if offline) ----------
  const blocks = document.querySelectorAll("pre code")
  if (blocks.length > 0) {
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
    script.onload = () => {
      blocks.forEach((block) => {
        if (!block.className.includes("language-")) block.classList.add("language-typescript")
        window.hljs.highlightElement(block)
      })
    }
    document.head.appendChild(script)
  }
})()
