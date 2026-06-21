import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import confetti from 'canvas-confetti'
import { BarChart, Bar, CartesianGrid, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import './styles.css'

const RANGES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
const TYPES = ['Trắc nghiệm', 'Điền số', 'Tìm số thiếu', 'So sánh', 'Dãy số', 'Trả lời nhanh']
const themes = {
  boy: { name: 'Bé trai', mascot: '🤖', bg: 'Không gian Robot' },
  girl: { name: 'Bé gái', mascot: '🦄', bg: 'Công chúa Kỳ lân' },
  neutral: { name: 'Trung tính', mascot: '🌈', bg: 'Cầu vồng Động vật' },
}

const grade3TopicList = {
  1: [
    { id: 'mul2', label: 'Bảng nhân 2' },
    { id: 'div2', label: 'Bảng chia 2' },
    { id: 'mul3', label: 'Bảng nhân 3' },
    { id: 'div3', label: 'Bảng chia 3' },
    { id: 'mul4', label: 'Bảng nhân 4' },
    { id: 'div4', label: 'Bảng chia 4' },
    { id: 'mul5', label: 'Bảng nhân 5' },
    { id: 'div5', label: 'Bảng chia 5' },
    { id: 'storyArith', label: 'Bài toán có lời văn số học' },
    { id: 'storyMoney', label: 'Bài toán có lời văn tiền tệ' },
  ],
  2: [
    { id: 'mul6', label: 'Bảng nhân 6' },
    { id: 'div6', label: 'Bảng chia 6' },
    { id: 'mul7', label: 'Bảng nhân 7' },
    { id: 'div7', label: 'Bảng chia 7' },
    { id: 'mul8', label: 'Bảng nhân 8' },
    { id: 'div8', label: 'Bảng chia 8' },
    { id: 'mul9', label: 'Bảng nhân 9' },
    { id: 'div9', label: 'Bảng chia 9' },
    { id: 'storyMeasure', label: 'Bài toán có lời văn đo lường' },
    { id: 'storyTime', label: 'Bài toán có lời văn thời gian' },
    { id: 'planeShapes', label: 'Hình phẳng' },
    { id: 'solidShapes', label: 'Hình khối' },
  ],
}

const DB_KEY = 'kidmath'
const loadDB = () => JSON.parse(localStorage.getItem(DB_KEY) || '{"users":{},"current":null,"grade":"kindergarten","semester":"1"}')
const saveDB = data => localStorage.setItem(DB_KEY, JSON.stringify(data))

function rnd(n) {
  return Math.floor(Math.random() * n)
}

function choice(array) {
  return array[rnd(array.length)]
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function playCorrectSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.frequency.value = 800
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    gain1.gain.setValueAtTime(0.2, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.15)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.frequency.value = 1200
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
    osc2.start(ctx.currentTime + 0.15)
    osc2.stop(ctx.currentTime + 0.35)
  } catch (e) {
    // ignore audio errors on unsupported browsers
  }
}

function playWrongSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.frequency.value = 400
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    gain1.gain.setValueAtTime(0.2, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.3)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.frequency.value = 300
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45)
    osc2.start(ctx.currentTime + 0.15)
    osc2.stop(ctx.currentTime + 0.45)
  } catch (e) {
    // ignore audio errors on unsupported browsers
  }
}

function makeQuestion(range, op = 'mix', type = 'mix') {
  const t = type === 'mix' ? choice(TYPES) : type
  const o = op === 'mix' ? choice(['+', '-']) : op
  let a = rnd(range + 1)
  let b = rnd(range + 1)
  if (o === '+') {
    while (a + b > range) {
      a = rnd(range + 1)
      b = rnd(range + 1)
    }
  } else {
    if (b > a) [a, b] = [b, a]
  }
  let answer = o === '+' ? a + b : a - b
  let prompt = `${a} ${o} ${b} = ?`
  let options = [answer]
  while (options.length < 4) {
    const x = Math.max(0, answer + rnd(11) - 5)
    if (x <= range && !options.includes(x)) options.push(x)
  }
  options = options.sort(() => Math.random() - 0.5)

  if (t === 'Điền số') {
    prompt = `Điền đáp án: ${a} ${o} ${b} = ?`
  }
  if (t === 'Tìm số thiếu') {
    if (o === '+') {
      prompt = `? + ${b} = ${answer}`
      answer = a
    } else {
      prompt = `${a} - ? = ${answer}`
      answer = b
    }
    options = [answer]
    while (options.length < 4) {
      const x = rnd(range + 1)
      if (!options.includes(x)) options.push(x)
    }
    options = options.sort(() => Math.random() - 0.5)
  }
  if (t === 'So sánh') {
    const c = rnd(range + 1)
    const left = answer
    const right = c
    prompt = `${a} ${o} ${b} ? ${c}`
    answer = left > right ? '>' : left < right ? '<' : '='
    options = ['>', '<', '=']
  }
  if (t === 'Dãy số') {
    const start = rnd(5)
    const step = rnd(4) + 1
    const seq = [start, start + step, start + 2 * step, start + 3 * step]
    answer = start + 4 * step
    prompt = `Dãy số: ${seq.join(', ')}, ?`
    options = [answer]
    while (options.length < 4) {
      const x = answer + rnd(9) - 4
      if (x >= 0 && !options.includes(x)) options.push(x)
    }
    options = options.sort(() => Math.random() - 0.5)
  }

  return {
    id: crypto.randomUUID(),
    type: t,
    prompt,
    answer,
    options,
    userAnswer: null,
    correct: null,
  }
}

function makeGrade3Question(semester = '1', topicId = 'random') {
  const topics = grade3TopicList[semester] || []
  const topic = topicId === 'random' ? choice(topics).id : topicId
  const selectedTopic = topics.find(t => t.id === topic) ? topic : topics[0]?.id || 'mul100'

  const makeMul = max => {
    let a = rnd(9) + 2
    let b = rnd(9) + 2
    while (a * b > max) {
      a = rnd(9) + 2
      b = rnd(9) + 2
    }
    const answer = a * b
    const options = [answer]
    while (options.length < 4) {
      const x = Math.max(1, answer + rnd(15) - 7)
      if (!options.includes(x)) options.push(x)
    }
    return {
      id: crypto.randomUUID(),
      type: 'Trắc nghiệm',
      prompt: `${a} × ${b} = ?`,
      answer,
      options: options.sort(() => Math.random() - 0.5),
      userAnswer: null,
      correct: null,
    }
  }

  const makeDiv = max => {
    const b = rnd(9) + 2
    const q = rnd(9) + 2
    const a = b * q
    return {
      id: crypto.randomUUID(),
      type: 'Trắc nghiệm',
      prompt: `${a} : ${b} = ?`,
      answer: q,
      options: [q, q + 1, Math.max(1, q - 1), q + 2].sort(() => Math.random() - 0.5),
      userAnswer: null,
      correct: null,
    }
  }

  const makeMulTable = factor => {
    const b = rnd(9) + 1
    const answer = factor * b
    const options = [answer]
    while (options.length < 4) {
      const x = Math.max(1, answer + rnd(12) - 5)
      if (!options.includes(x)) options.push(x)
    }
    return {
      id: crypto.randomUUID(),
      type: 'Trắc nghiệm',
      prompt: `${factor} × ${b} = ?`,
      answer,
      options: options.sort(() => Math.random() - 0.5),
      userAnswer: null,
      correct: null,
    }
  }

  const makeDivTable = divisor => {
    const q = rnd(9) + 1
    const a = divisor * q
    const options = [q]
    while (options.length < 4) {
      const x = Math.max(1, q + rnd(5) - 2)
      if (!options.includes(x)) options.push(x)
    }
    return {
      id: crypto.randomUUID(),
      type: 'Trắc nghiệm',
      prompt: `${a} : ${divisor} = ?`,
      answer: q,
      options: options.sort(() => Math.random() - 0.5),
      userAnswer: null,
      correct: null,
    }
  }

  const makeStoryArith = () => {
    const names = ['An', 'Hoa', 'Minh', 'Lan']
    const things = ['quả táo', 'cái bánh', 'quyển sách', 'chiếc bút']
    const name = choice(names)
    const thing = choice(things)
    const op = choice(['+', '-', '×', '÷'])
    let a = rnd(8) + 2
    let b = rnd(8) + 1
    let answer
    let prompt

    if (op === '+') {
      answer = a + b
      prompt = `${name} có ${a} ${thing} và được tặng thêm ${b} ${thing}. Hỏi ${name} có bao nhiêu ${thing} tất cả?`
    } else if (op === '-') {
      if (a < b) [a, b] = [b, a]
      answer = a - b
      prompt = `${name} có ${a} ${thing}. ${name} cho bạn ${b} ${thing}. Hỏi ${name} còn lại bao nhiêu ${thing}?`
    } else if (op === '×') {
      const c = rnd(4) + 2
      answer = a * c
      prompt = `Mỗi hộp có ${a} ${thing}. Hỏi ${c} hộp có bao nhiêu ${thing}?`
      b = c
    } else {
      answer = a
      const product = a * b
      prompt = `${name} có ${product} ${thing} chia đều cho ${b} bạn. Hỏi mỗi bạn được bao nhiêu ${thing}?`
    }

    const options = [answer]
    while (options.length < 4) {
      const x = Math.max(1, answer + rnd(11) - 5)
      if (!options.includes(x)) options.push(x)
    }
    return {
      id: crypto.randomUUID(),
      type: 'Lời văn',
      prompt,
      answer,
      options: options.sort(() => Math.random() - 0.5),
      userAnswer: null,
      correct: null,
    }
  }

  const makeStoryMeasure = () => {
    const w = rnd(8) + 2
    const h = rnd(5) + 2
    const perimeter = 2 * (w + h)
    const area = w * h
    const mode = choice(['perimeter', 'area'])
    if (mode === 'perimeter') {
      return {
        id: crypto.randomUUID(),
        type: 'Lời văn',
        prompt: `Một mảnh vườn hình chữ nhật có chiều dài ${w} m và chiều rộng ${h} m. Hỏi chu vi mảnh vườn là bao nhiêu mét?`,
        answer: perimeter,
        options: [perimeter, perimeter + 2, Math.max(1, perimeter - 2), perimeter + 4].sort(() => Math.random() - 0.5),
        userAnswer: null,
        correct: null,
      }
    }
    return {
      id: crypto.randomUUID(),
      type: 'Lời văn',
      prompt: `Một mảnh vườn hình chữ nhật có chiều dài ${w} m và chiều rộng ${h} m. Hỏi diện tích mảnh vườn là bao nhiêu mét vuông?`,
      answer: area,
      options: [area, area + 2, Math.max(1, area - 2), area + 4].sort(() => Math.random() - 0.5),
      userAnswer: null,
      correct: null,
    }
  }

  const makeStoryMoney = () => {
    const names = ['Bình', 'Thu', 'Hùng', 'My']
    const item = choice(['cái kẹo', 'quyển vở', 'cái bút', 'cái bánh'])
    const price = (rnd(9) + 1) * 200
    const count = rnd(5) + 2
    const mode = choice(['buy', 'spend'])
    if (mode === 'buy') {
      const total = price * count
      return {
        id: crypto.randomUUID(),
        type: 'Lời văn',
        prompt: `${names[0]} mua ${count} ${item}, mỗi ${item} giá ${price} đồng. Hỏi ${names[0]} phải trả bao nhiêu tiền?`,
        answer: total,
        options: [total, total + 200, Math.max(0, total - 200), total + 400].sort(() => Math.random() - 0.5),
        userAnswer: null,
        correct: null,
      }
    }
    const total = price * count
    const spend = price * (count - 1)
    return {
      id: crypto.randomUUID(),
      type: 'Lời văn',
      prompt: `${names[1]} có ${total} đồng và đã mua ${count - 1} ${item}, mỗi ${item} giá ${price} đồng. Hỏi ${names[1]} còn lại bao nhiêu đồng?`,
      answer: total - spend,
      options: [total - spend, total - spend + 200, Math.max(0, total - spend - 200), total - spend + 400].sort(() => Math.random() - 0.5),
      userAnswer: null,
      correct: null,
    }
  }

  const makeStoryTime = () => {
    const start = rnd(8) + 7
    const duration = rnd(3) + 1
    return {
      id: crypto.randomUUID(),
      type: 'Lời văn',
      prompt: `Một buổi học bắt đầu lúc ${start} giờ và kéo dài ${duration} giờ. Hỏi buổi học kết thúc lúc mấy giờ?`,
      answer: start + duration,
      options: [start + duration, start + duration + 1, Math.max(0, start + duration - 1), start + duration + 2].sort(() => Math.random() - 0.5),
      userAnswer: null,
      correct: null,
    }
  }

  const makePlaneShape = () => {
    const shape = choice(['tam giác', 'vuông', 'hình chữ nhật', 'hình tròn'])
    if (shape === 'hình tròn') {
      const options = [0, 1, 2, 3]
      return {
        id: crypto.randomUUID(),
        type: 'Trắc nghiệm',
        prompt: 'Hình tròn có bao nhiêu đỉnh?',
        answer: 0,
        options,
        userAnswer: null,
        correct: null,
      }
    }
    if (shape === 'tam giác') {
      return {
        id: crypto.randomUUID(),
        type: 'Trắc nghiệm',
        prompt: 'Hình tam giác có bao nhiêu cạnh?',
        answer: 3,
        options: [3, 4, 5, 6],
        userAnswer: null,
        correct: null,
      }
    }
    if (shape === 'vuông') {
      return {
        id: crypto.randomUUID(),
        type: 'Trắc nghiệm',
        prompt: 'Hình vuông có bao nhiêu cạnh?',
        answer: 4,
        options: [3, 4, 5, 6],
        userAnswer: null,
        correct: null,
      }
    }
    const w = rnd(10) + 2
    const h = rnd(8) + 2
    const perimeter = 2 * (w + h)
    const area = w * h
    return {
      id: crypto.randomUUID(),
      type: 'Trắc nghiệm',
      prompt: `Hình chữ nhật có chiều dài ${w} cm và chiều rộng ${h} cm. Chu vi là ?`,
      answer: perimeter,
      options: [perimeter, perimeter + 2, Math.max(1, perimeter - 2), perimeter + 4].sort(() => Math.random() - 0.5),
      userAnswer: null,
      correct: null,
    }
  }

  const makeSolidShape = () => {
    const shape = choice(['lập phương', 'hình hộp chữ nhật', 'hình trụ'])
    if (shape === 'lập phương') {
      return {
        id: crypto.randomUUID(),
        type: 'Trắc nghiệm',
        prompt: 'Hình lập phương có bao nhiêu mặt?',
        answer: 6,
        options: [4, 6, 8, 12],
        userAnswer: null,
        correct: null,
      }
    }
    if (shape === 'hình hộp chữ nhật') {
      return {
        id: crypto.randomUUID(),
        type: 'Trắc nghiệm',
        prompt: 'Hình hộp chữ nhật có bao nhiêu đỉnh?',
        answer: 8,
        options: [6, 8, 10, 12],
        userAnswer: null,
        correct: null,
      }
    }
    return {
      id: crypto.randomUUID(),
      type: 'Trắc nghiệm',
      prompt: 'Hình trụ có bao nhiêu đáy?',
      answer: 2,
      options: [1, 2, 3, 4],
      userAnswer: null,
      correct: null,
    }
  }

  const makeBigNumber = max => {
    let a = rnd(max) + 1
    let b = rnd(max) + 1
    if (rnd(2) === 0) {
      const answer = a + b
      return {
        id: crypto.randomUUID(),
        type: 'Trắc nghiệm',
        prompt: `${a} + ${b} = ?`,
        answer,
        options: [answer, answer + 10, Math.max(0, answer - 10), answer + 5].sort(() => Math.random() - 0.5),
        userAnswer: null,
        correct: null,
      }
    }
    if (a < b) [a, b] = [b, a]
    const answer = a - b
    return {
      id: crypto.randomUUID(),
      type: 'Trắc nghiệm',
      prompt: `${a} - ${b} = ?`,
      answer,
      options: [answer, answer + 10, Math.max(0, answer - 5), answer + 3].sort(() => Math.random() - 0.5),
      userAnswer: null,
      correct: null,
    }
  }

  const makeStatistics = () => {
    const a = rnd(10) + 5
    const b = a + rnd(5) + 1
    const c = b + rnd(5) + 1
    const answers = [a, b, c]
    const correct = c
    return {
      id: crypto.randomUUID(),
      type: 'Trắc nghiệm',
      prompt: `Trong hai số ${a}, ${b}, ${c}, số nào lớn nhất?`,
      answer: correct,
      options: [a, b, c, Math.max(1, a - 1)].sort(() => Math.random() - 0.5),
      userAnswer: null,
      correct: null,
    }
  }

  switch (selectedTopic) {
    case 'mul2':
      return makeMulTable(2)
    case 'div2':
      return makeDivTable(2)
    case 'mul3':
      return makeMulTable(3)
    case 'div3':
      return makeDivTable(3)
    case 'mul4':
      return makeMulTable(4)
    case 'div4':
      return makeDivTable(4)
    case 'mul5':
      return makeMulTable(5)
    case 'div5':
      return makeDivTable(5)
    case 'mul6':
      return makeMulTable(6)
    case 'div6':
      return makeDivTable(6)
    case 'mul7':
      return makeMulTable(7)
    case 'div7':
      return makeDivTable(7)
    case 'mul8':
      return makeMulTable(8)
    case 'div8':
      return makeDivTable(8)
    case 'mul9':
      return makeMulTable(9)
    case 'div9':
      return makeDivTable(9)
    case 'storyArith':
      return makeStoryArith()
    case 'storyMoney':
      return makeStoryMoney()
    case 'storyMeasure':
      return makeStoryMeasure()
    case 'storyTime':
      return makeStoryTime()
    case 'planeShapes':
      return makePlaneShape()
    case 'solidShapes':
      return makeSolidShape()
    case 'numbers10000':
      return makeBigNumber(10000)
    case 'perimeterArea':
      return makePlaneShape()
    case 'numbers100000':
      return makeBigNumber(100000)
    case 'statistics':
      return makeStatistics()
    default:
      return makeMul(100)
  }
}

function Auth({ onLogin }) {
  const [u, setU] = useState('keo')
  const [p, setP] = useState('123456')
  const [msg, setMsg] = useState('')

  function reg() {
    const data = loadDB()
    if (!u || !p) return setMsg('Nhập username/password nhé')
    if (!data.users[u]) {
      data.users[u] = { password: p, history: [], stars: 0, streak: 0, lastStudy: null, theme: 'neutral' }
    }
    data.current = u
    saveDB(data)
    onLogin(u)
  }

  function login() {
    const data = loadDB()
    if (data.users[u]?.password === p) {
      data.current = u
      saveDB(data)
      onLogin(u)
    } else {
      setMsg('Chưa đúng, anh có thể bấm Đăng ký mới')
    }
  }

  return (
    <div className="app">
      <div className="card">
        <h1 className="title">Kid Math 🧮</h1>
        <p className="sub">
          © 2026 ChienVH
          <br />Ứng dụng dành tặng các tình yêu Đậu - Kẹo của bố học tập thật tốt!!!
        </p>
        <input className="input" value={u} onChange={e => setU(e.target.value)} placeholder="Username" />
        <br />
        <br />
        <input className="input" value={p} onChange={e => setP(e.target.value)} placeholder="Password" type="password" />
        <p className="bad">{msg}</p>
        <div className="row">
          <button className="btn" onClick={login}>Đăng nhập</button>
          <button className="btn secondary" onClick={reg}>Đăng ký mới</button>
        </div>
      </div>
    </div>
  )
}

function GradeSelector({ onSelect }) {
  return (
    <div className="card">
      <h2>Chọn lớp học</h2>
      <div className="row">
        <button className="btn" onClick={() => onSelect('kindergarten')}>🎈 Lớp Mầm</button>
        <button className="btn secondary" onClick={() => onSelect('grade3')}>📚 Lớp 3</button>
      </div>
    </div>
  )
}

function SemesterSelector({ onSelect }) {
  return (
    <div className="card">
      <h2>Chọn kì học</h2>
      <div className="row">
        <button className="btn" onClick={() => onSelect('1')}>📖 Kì 1 (Tập 1)</button>
        <button className="btn secondary" onClick={() => onSelect('2')}>📕 Kì 2 (Tập 2)</button>
      </div>
    </div>
  )
}

function Settings({ user, setUser }) {
  const data = loadDB()
  const profile = data.users[user]

  function setTheme(theme) {
    profile.theme = theme
    saveDB(data)
    setUser(user + ' ')
    setTimeout(() => setUser(user.trim()), 0)
  }

  return (
    <div className="card">
      <h2>Cài đặt</h2>
      <div className="row">
        {Object.entries(themes).map(([key, value]) => (
          <button className="btn ghost" onClick={() => setTheme(key)} key={key}>
            {value.mascot} {value.name}
          </button>
        ))}
      </div>
      <p>Âm thanh: có thể bật/tắt trong phiên bản Native; PWA đang dùng âm thanh trình duyệt đơn giản.</p>
      <p className="footer">© 2026 ChienVH — Ứng dụng dành tặng các tình yêu Đậu - Kẹo của bố học tập thật tốt!!!</p>
    </div>
  )
}

function Quiz({ user, mode, grade = 'kindergarten', semester = '1', onDone }) {
  const [range, setRange] = useState(10)
  const [op, setOp] = useState('mix')
  const [examCount, setExamCount] = useState(10)
  const [topicId, setTopicId] = useState('random')
  const [q, setQ] = useState(null)
  const [answers, setAnswers] = useState([])
  const [started, setStarted] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [feedback, setFeedback] = useState('')

  const topics = grade === 'grade3' ? grade3TopicList[semester] || [] : []

  function makeQ() {
    if (grade === 'grade3') {
      return makeGrade3Question(semester, topicId)
    }
    return makeQuestion(range, op)
  }

  function start() {
    setAnswers([])
    setQ(makeQ())
    setStarted(true)
    setStartTime(Date.now())
    setFeedback('')
  }

  function finish(arr) {
    const correct = arr.filter(x => x.correct).length
    const pct = Math.round((correct * 100) / arr.length)
    const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0
    const data = loadDB()
    const profile = data.users[user]
    const date = today()
    profile.streak = profile.lastStudy === date ? profile.streak : profile.lastStudy && (new Date(date) - new Date(profile.lastStudy)) / 86400000 === 1 ? profile.streak + 1 : 1
    profile.lastStudy = date
    profile.stars = (profile.stars || 0) + stars
    profile.history.unshift({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      mode,
      grade,
      semester,
      topicId,
      topicLabel: topics.find(t => t.id === topicId)?.label || 'Ngẫu nhiên',
      range,
      score: correct,
      total: arr.length,
      accuracy: pct,
      durationSec: Math.round((Date.now() - startTime) / 1000),
      stars,
      questions: arr,
    })
    saveDB(data)
    confetti({ particleCount: 160, spread: 100 })
    onDone()
  }

  function next(answer) {
    if (!q) return
    const ok = String(answer) === String(q.answer)
    const rec = { ...q, userAnswer: answer, correct: ok }
    const nextAnswers = [...answers, rec]
    setAnswers(nextAnswers)
    if (ok) playCorrectSound()
    else playWrongSound()

    if (mode === 'practice') {
      setFeedback(ok ? '✅ Đúng rồi!' : `❌ Chưa đúng. Đáp án: ${q.answer}`)
      if (ok) confetti({ particleCount: 60, spread: 70 })
      setTimeout(() => {
        setQ(makeQ())
        setFeedback('')
      }, 800)
    } else {
      if (nextAnswers.length >= examCount) {
        finish(nextAnswers)
      } else {
        setQ(makeQ())
      }
    }
  }

  const gradeLabel = grade === 'grade3' ? `Lớp 3 - Kì ${semester}` : 'Lớp Mầm'
  const currentTopicLabel = topics.find(t => t.id === topicId)?.label || 'Ngẫu nhiên'

  return (
    <div className="card">
      <h2>{gradeLabel} - {mode === 'practice' ? 'Mode luyện tập' : 'Mode thi'}</h2>
      {!started ? (
        <>
          {grade === 'kindergarten' && (
            <>
              <div className="row">
                <label>
                  Phạm vi{' '}
                  <select className="select" value={range} onChange={e => setRange(+e.target.value)}>
                    {RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
                <label>
                  Phép toán{' '}
                  <select className="select" value={op} onChange={e => setOp(e.target.value)}>
                    <option value="mix">Tự chọn</option>
                    <option value="+">Cộng</option>
                    <option value="-">Trừ</option>
                  </select>
                </label>
              </div>
            </>
          )}

          {grade === 'grade3' && (
            <div className="card secondary">
              <h3>Chọn chủ đề lớp 3</h3>
              <div className="row wrap">
                <select className="select full" value={topicId} onChange={e => setTopicId(e.target.value)}>
                  <option value="random">Ngẫu nhiên</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <p>Chủ đề hiện tại: <strong>{currentTopicLabel}</strong></p>
            </div>
          )}

          <div className="row">
            <label>
              Số câu{' '}
              <select className="select" value={examCount} onChange={e => setExamCount(+e.target.value)}>
                {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
          <div className="row">
            <button className="btn" onClick={start}>Bắt đầu</button>
            <button className="btn secondary" onClick={onDone}>Quay lại</button>
          </div>
        </>
      ) : (
        <>
          <p className="prompt">{q.prompt}</p>
          <div className="row wrap">
            {q.options.map(option => (
              <button key={option} className="btn option" onClick={() => next(option)}>
                {option}
              </button>
            ))}
          </div>
          <p className="feedback">{feedback}</p>
          <p>Đã làm: {answers.length}/{examCount}</p>
          {mode === 'exam' && (
            <button className="btn ghost" onClick={() => finish(answers)}>Nộp bài</button>
          )}
        </>
      )}
    </div>
  )
}

function History({ user }) {
  const data = loadDB()
  const history = data.users[user]?.history || []
  const graphData = history.slice().reverse().map((entry, index) => ({ name: index + 1, accuracy: entry.accuracy }))

  return (
    <div className="card">
      <h2>Lịch sử học tập</h2>
      {history.length > 0 ? (
        <>
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={graphData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {history.map(entry => (
            <details className="history" key={entry.id}>
              <summary>
                <b>{new Date(entry.date).toLocaleString('vi-VN')}</b> — {entry.grade === 'grade3' ? `Lớp 3-Kì${entry.semester}` : 'Lớp Mầm'} — {entry.mode} — {entry.score}/{entry.total} — {entry.accuracy}% — ⭐{entry.stars}
                {entry.grade === 'grade3' && entry.topicLabel ? ` — ${entry.topicLabel}` : ''}
              </summary>
              {entry.questions.map((question, index) => (
                <p key={question.id} className={question.correct ? 'ok' : 'bad'}>
                  {index + 1}. {question.prompt} Bé chọn: {question.userAnswer}. Đáp án: {question.answer}
                </p>
              ))}
            </details>
          ))}
        </>
      ) : (
        <p>Chưa có lịch sử học tập</p>
      )}
    </div>
  )
}

function Dashboard({ currentUser, onBack }) {
  const data = loadDB()
  const users = Object.entries(data.users)
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [gradeView, setGradeView] = useState('all')

  const parseDate = dateString => dateString ? new Date(dateString) : null
  const fromDate = parseDate(filterFrom)
  const toDate = parseDate(filterTo)

  const filterEntry = entry => {
    const entryDate = new Date(entry.date)
    if (fromDate && entryDate < fromDate) return false
    if (toDate && entryDate > new Date(toDate.getTime() + 86400000 - 1)) return false
    if (gradeView === 'grade3' && entry.grade !== 'grade3') return false
    if (gradeView === 'kindergarten' && entry.grade !== 'kindergarten') return false
    return true
  }

  const qualityLabel = avgAccuracy => {
    if (avgAccuracy >= 90) return { label: 'Xuất sắc', color: '#0f766e' }
    if (avgAccuracy >= 75) return { label: 'Tốt', color: '#2563eb' }
    if (avgAccuracy >= 50) return { label: 'Cần cố gắng', color: '#d97706' }
    return { label: 'Yếu', color: '#b91c1c' }
  }

  const comparisonData = users.map(([username, profile]) => {
    const history = profile.history || []
    const filtered = history.filter(filterEntry)
    const avgAccuracy = filtered.length ? Math.round(filtered.reduce((sum, item) => sum + item.accuracy, 0) / filtered.length) : 0
    return {
      name: username,
      avgAccuracy,
      totalTests: filtered.length,
    }
  })

  return (
    <div className="card">
      <h2>Dashboard tất cả tài khoản</h2>
      <div className="card secondary">
        <h3>Tùy chọn lọc</h3>
        <div className="row wrap">
          <label>
            Từ ngày{' '}
            <input type="date" className="select" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
          </label>
          <label>
            Đến ngày{' '}
            <input type="date" className="select" value={filterTo} onChange={e => setFilterTo(e.target.value)} />
          </label>
          <label>
            Lớp{' '}
            <select className="select" value={gradeView} onChange={e => setGradeView(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="grade3">Lớp 3</option>
              <option value="kindergarten">Lớp Mầm</option>
            </select>
          </label>
        </div>
      </div>
      {users.length === 0 ? (
        <p>Chưa có tài khoản nào.</p>
      ) : (
        <>
          <div className="card secondary">
            <h3>Biểu đồ so sánh</h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgAccuracy" fill="#7c3aed" name="ĐTB chính xác" />
                  <Bar dataKey="totalTests" fill="#f59e0b" name="Số bài" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {users.map(([username, profile]) => {
            const history = profile.history || []
            const filteredHistory = history.filter(filterEntry)
            const avgAccuracy = history.length ? Math.round(history.reduce((sum, item) => sum + item.accuracy, 0) / history.length) : 0
            const latest = history[0]
            const quality = qualityLabel(avgAccuracy)
            return (
              <div className="card secondary" key={username}>
                <h3>{username}</h3>
                <div className="row wrap">
                  <span className="pill">⭐ {profile.stars || 0} sao</span>
                  <span className="pill">🔥 {profile.streak || 0} ngày</span>
                  <span className="pill">Bài thi: {history.length}</span>
                  <span className="pill">ĐTB chính xác: {avgAccuracy}%</span>
                  <span className="pill" style={{ background: quality.color, color: '#fff' }}>{quality.label}</span>
                </div>
                {latest ? (
                  <p>Buổi học gần nhất: {new Date(latest.date).toLocaleString('vi-VN')} — {latest.score}/{latest.total} — {latest.accuracy}%</p>
                ) : (
                  <p>Chưa có lịch sử làm bài.</p>
                )}
                <p>Hiển thị {filteredHistory.length}/{history.length} kết quả sau lọc.</p>
                {filteredHistory.length > 0 && (
                  <div className="history">
                    {filteredHistory.slice(0, 3).map(item => (
                      <p key={item.id} className={item.accuracy >= 50 ? 'ok' : 'bad'}>
                        {new Date(item.date).toLocaleDateString('vi-VN')} — {item.grade === 'grade3' ? `Lớp 3-Kì${item.semester}` : 'Lớp Mầm'} — {item.score}/{item.total} — {item.accuracy}%
                      </p>
                    ))}
                    {filteredHistory.length > 3 && <p>... còn {filteredHistory.length - 3} kết quả khác</p>}
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}
      <div className="row">
        <button className="btn" onClick={onBack}>Quay lại</button>
      </div>
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState('home')
  const [user, setUser] = useState(loadDB().current)
  const [grade, setGrade] = useState('kindergarten')
  const [semester, setSemester] = useState('1')

  useEffect(() => {
    navigator.serviceWorker?.register('/sw.js')
  }, [])

  if (!user) {
    return <Auth onLogin={setUser} />
  }

  const data = loadDB()
  const profile = data.users[user.trim()] || data.users[loadDB().current]
  const theme = themes[profile.theme || 'neutral']
  const gradeLabel = grade === 'grade3' ? `Lớp 3-Kì${semester}` : 'Lớp Mầm'

  return (
    <div className="app">
      <div className="card">
        <div className="row between">
          <div>
            <h1 className="title">Kid Math {theme.mascot}</h1>
            <p className="sub">Xin chào {user.trim()} — {theme.bg} — {gradeLabel}</p>
          </div>
          <div className="mascot">{theme.mascot}</div>
        </div>
        <div className="row">
          <span className="pill">⭐ {profile.stars || 0} sao</span>
          <span className="pill">🔥 {profile.streak || 0} ngày liên tiếp</span>
        </div>
        <br />
        <div className="row wrap">
          <button className="btn" onClick={() => setScreen('practice')}>Luyện tập</button>
          <button className="btn secondary" onClick={() => setScreen('exam')}>Thi</button>
          <button className="btn ghost" onClick={() => setScreen('history')}>Lịch sử</button>
          <button className="btn ghost" onClick={() => setScreen('dashboard')}>Dashboard</button>
          <button className="btn ghost" onClick={() => setScreen('selectGrade')}>Lớp học</button>
          <button className="btn ghost" onClick={() => setScreen('settings')}>Cài đặt</button>
          <button className="btn ghost" onClick={() => { const d = loadDB(); d.current = null; saveDB(d); setUser(null) }}>Đăng xuất</button>
        </div>
      </div>

      {grade === 'grade3' && screen === 'home' && (
        <div className="card secondary">
          <h2>Chủ đề lớp 3</h2>
          <p>Chọn kì học để xem chủ đề hoặc vào Luyện tập/Thi để bắt đầu theo chủ đề.</p>
          <div className="row wrap">
            {(grade3TopicList[semester] || []).map(topic => (
              <span className="pill" key={topic.id}>{topic.label}</span>
            ))}
          </div>
        </div>
      )}

      {screen === 'selectGrade' && (
        <GradeSelector onSelect={g => {
          setGrade(g)
          if (g === 'grade3') {
            setScreen('selectSemester')
          } else {
            setScreen('home')
          }
        }} />
      )}

      {screen === 'selectSemester' && (
        <SemesterSelector onSelect={s => {
          setSemester(s)
          setScreen('home')
        }} />
      )}

      {screen === 'practice' && (
        <Quiz user={user.trim()} mode="practice" grade={grade} semester={semester} onDone={() => setScreen('home')} />
      )}

      {screen === 'exam' && (
        <Quiz user={user.trim()} mode="exam" grade={grade} semester={semester} onDone={() => setScreen('history')} />
      )}

      {screen === 'history' && <History user={user.trim()} />}
      {screen === 'dashboard' && <Dashboard currentUser={user.trim()} onBack={() => setScreen('home')} />}
      {screen === 'settings' && <Settings user={user.trim()} setUser={setUser} />}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
