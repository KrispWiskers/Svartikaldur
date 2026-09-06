import './style.css'

type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100

interface RollResult {
  id: string
  die: DieType
  count: number
  rolls: number[]
  total: number
  timestamp: Date
}

const DIE_TYPES: DieType[] = [4, 6, 8, 10, 12, 20, 100]
const MAX_HISTORY = 10
const MIN_COUNT = 1
const MAX_COUNT = 20

let selectedDie: DieType = 20
let count = 1
let history: RollResult[] = []
let isRolling = false

const app = document.querySelector<HTMLDivElement>('#app')!

function rollDie(sides: DieType): number {
  return Math.floor(Math.random() * sides) + 1
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function render(): void {
  app.innerHTML = `
    <div class="shell">
      <header class="header">
        <p class="eyebrow">Tabletop companion</p>
        <h1>Dice Roller</h1>
        <p class="subtitle">Pick a die, set the count, and roll. Keyboard: Space or Enter.</p>
      </header>

      <main class="panel" aria-live="polite">
        <section class="controls" aria-label="Dice controls">
          <div class="field">
            <span class="label" id="die-label">Die type</span>
            <div class="die-grid" role="radiogroup" aria-labelledby="die-label">
              ${DIE_TYPES.map(
                (d) => `
                <button
                  type="button"
                  class="die-btn ${selectedDie === d ? 'active' : ''}"
                  role="radio"
                  aria-checked="${selectedDie === d}"
                  data-die="${d}"
                  aria-label="d${d}"
                >
                  <span class="die-glyph" aria-hidden="true">d${d}</span>
                </button>`
              ).join('')}
            </div>
          </div>

          <div class="field count-field">
            <label class="label" for="count-input">Number of dice</label>
            <div class="count-row">
              <button type="button" class="count-btn" id="count-dec" aria-label="Decrease count" ${count <= MIN_COUNT ? 'disabled' : ''}>−</button>
              <input
                id="count-input"
                class="count-input"
                type="number"
                min="${MIN_COUNT}"
                max="${MAX_COUNT}"
                value="${count}"
                aria-valuemin="${MIN_COUNT}"
                aria-valuemax="${MAX_COUNT}"
                aria-valuenow="${count}"
              />
              <button type="button" class="count-btn" id="count-inc" aria-label="Increase count" ${count >= MAX_COUNT ? 'disabled' : ''}>+</button>
            </div>
          </div>

          <button type="button" class="roll-btn ${isRolling ? 'rolling' : ''}" id="roll-btn" ${isRolling ? 'disabled' : ''}>
            <span class="roll-btn-label">${isRolling ? 'Rolling…' : `Roll ${count}d${selectedDie}`}</span>
          </button>
        </section>

        <section class="results" aria-label="Roll results">
          <div class="results-card ${isRolling ? 'animating' : ''}" id="results-card">
            <div class="results-empty" id="results-empty">
              <div class="empty-die" aria-hidden="true">◇</div>
              <p>Ready when you are</p>
            </div>
            <div class="results-body" id="results-body" hidden>
              <div class="results-meta">
                <span class="pill" id="results-pill"></span>
                <span class="total-label">Total</span>
                <span class="total-value" id="total-value"></span>
              </div>
              <ul class="faces" id="faces" role="list"></ul>
            </div>
          </div>
        </section>

        <section class="history" aria-label="Recent rolls">
          <div class="history-head">
            <h2>Recent rolls</h2>
            <button type="button" class="link-btn" id="clear-history" ${history.length === 0 ? 'disabled' : ''}>Clear</button>
          </div>
          <ol class="history-list" id="history-list">
            ${
              history.length === 0
                ? `<li class="history-empty">No rolls yet</li>`
                : history
                    .map(
                      (h) => `
                <li class="history-item">
                  <div class="history-main">
                    <span class="history-formula">${h.count}d${h.die}</span>
                    <span class="history-rolls">${h.rolls.join(', ')}</span>
                  </div>
                  <div class="history-side">
                    <span class="history-total">${h.total}</span>
                    <time datetime="${h.timestamp.toISOString()}">${formatTime(h.timestamp)}</time>
                  </div>
                </li>`
                    )
                    .join('')
            }
          </ol>
        </section>
      </main>

      <footer class="footer">
        <p>Accessible · dark-friendly · works offline after build</p>
      </footer>
    </div>
  `

  bindEvents()
}

function bindEvents(): void {
  document.querySelectorAll<HTMLButtonElement>('.die-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedDie = Number(btn.dataset.die) as DieType
      render()
    })
  })

  const dec = document.getElementById('count-dec')
  const inc = document.getElementById('count-inc')
  const input = document.getElementById('count-input') as HTMLInputElement | null
  const rollBtn = document.getElementById('roll-btn')
  const clearBtn = document.getElementById('clear-history')

  dec?.addEventListener('click', () => {
    count = Math.max(MIN_COUNT, count - 1)
    render()
  })

  inc?.addEventListener('click', () => {
    count = Math.min(MAX_COUNT, count + 1)
    render()
  })

  input?.addEventListener('change', () => {
    const n = Number(input.value)
    count = Number.isFinite(n) ? Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.round(n))) : MIN_COUNT
    render()
  })

  rollBtn?.addEventListener('click', () => void performRoll())
  clearBtn?.addEventListener('click', () => {
    history = []
    render()
  })
}

async function performRoll(): Promise<void> {
  if (isRolling) return
  isRolling = true
  render()

  const rolls: number[] = []
  for (let i = 0; i < count; i++) rolls.push(rollDie(selectedDie))
  const total = rolls.reduce((a, b) => a + b, 0)

  await new Promise((r) => setTimeout(r, 420))

  const result: RollResult = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    die: selectedDie,
    count,
    rolls,
    total,
    timestamp: new Date(),
  }

  history = [result, ...history].slice(0, MAX_HISTORY)
  isRolling = false
  render()
  showResult(result)
}

function showResult(result: RollResult): void {
  const empty = document.getElementById('results-empty')
  const body = document.getElementById('results-body')
  const pill = document.getElementById('results-pill')
  const totalEl = document.getElementById('total-value')
  const faces = document.getElementById('faces')
  const card = document.getElementById('results-card')

  if (!empty || !body || !pill || !totalEl || !faces || !card) return

  empty.hidden = true
  body.hidden = false
  pill.textContent = `${result.count}d${result.die}`
  totalEl.textContent = String(result.total)
  faces.innerHTML = result.rolls
    .map(
      (n, i) => `
      <li class="face" style="animation-delay: ${i * 40}ms" role="listitem">
        <span class="face-value">${n}</span>
      </li>`
    )
    .join('')

  card.classList.remove('animating')
  void card.offsetWidth
  card.classList.add('pop')
  setTimeout(() => card.classList.remove('pop'), 500)
}

function onKey(e: KeyboardEvent): void {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') {
    if (e.key === 'Enter') {
      e.preventDefault()
      void performRoll()
    }
    return
  }
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault()
    void performRoll()
  }
}

document.addEventListener('keydown', onKey)
render()
