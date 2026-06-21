# PROMPTS & INSTRUCTIONS

Tập hợp các prompt / chỉ dẫn đã dùng để khởi tạo, phát triển và vận hành dự án `Kidmath` từ đầu tới thời điểm hiện tại.

Ngày tổng hợp: 2026-06-21

---

## Mục tiêu chung

- Tạo một ứng dụng học toán nhỏ cho trẻ em (React + Vite)
- Hỗ trợ màn hình luyện tập/thi, lưu lịch sử, dashboard tổng hợp cho nhiều tài khoản
- Tùy chỉnh UI, thêm chế độ Lớp 3 với các chủ đề (bảng nhân/chia, bài toán lời văn tiếng Việt)
- Thêm hiệu ứng thưởng (âm thanh, confetti)
- Lưu trữ trung tâm qua `localStorage` với wrapper `loadDB()` / `saveDB()`

---

## Các prompt / chỉ dẫn chính (theo thứ tự thực hiện)

1. Khởi tạo project

  - "Create a Vite + React project with a single main file `src/App.jsx`. Include dependencies `canvas-confetti` and `recharts`. Keep the app small and single-file architecture initially."

2. Personalize UI and basic flows

  - "Add authentication UI (local users), grade selector, semester selector, settings, basic quiz flow and history view. Store users and histories in `localStorage` under key `kidmath`."

3. Grade 3 practice mode

  - "Add explicit Grade 3 practice mode with a topic selector. Provide topic list for semesters 1 and 2 including full multiplication/division tables (2–9) and several story/problem types (arithmetic, money, measurement, time, shapes). Implement question generators for each topic."

4. Feedback and rewards

  - "Add celebratory confetti (`canvas-confetti`) and short correct/incorrect sounds (WebAudio API) for immediate feedback."

5. Vietnamese word problems

  - "Create Vietnamese word-problem generators for Grade 3: arithmetic combos, measurement, money, time. Questions should return prompt, answer, and metadata."

6. Centralized persistence

  - "Consolidate all persistence access into `loadDB()` and `saveDB()` wrapper functions using `localStorage` key `kidmath`. Migrate existing `load()`/`save()` calls to use the wrappers."

7. Dashboard and analytics

  - "Build a centralized `Dashboard` component that reads all accounts from `loadDB()` and computes per-account metrics (stars, streak, average accuracy, recent sessions). Add date filtering, comparison charts and color-coded quality classification (Xuất sắc, Tốt, Cần cố gắng, Yếu). Use `recharts` for charts."

8. Fixes and refactors

  - "Fix typos (e.g. `loadDBDB()` -> `loadDB()`), ensure all read/write use `loadDB()`/`saveDB()`, and keep `src/App.jsx` as the single-file app implementation."

9. Build & release

  - "Run production build with `npm run build`. Create an annotated Git tag (automatic patch v1.0.0 if none), push tag to `origin` and generate a distributable zip from `dist/` for Netlify deployment."

10. App icon replacement

  - "Replace app icons by converting provided HEIC image to PNG at 512×512 and 192×192, place in `icons/icon-512.png` and `icons/icon-192.png`, rebuild, and commit changes."

---

## Các lệnh CLI đã dùng (tóm tắt)

```bash
# build
npm run build

# create annotated tag and push
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# package distributable
zip -r kidmath-v1.0.0-dist.zip dist

# replace icons (macOS `sips` used in session)
sips -s format png icons/IMG_1717.heic --out icons/icon-512.png
sips -z 512 512 icons/icon-512.png --out icons/icon-512.png
sips -s format png icons/IMG_1717.heic --out icons/icon-192.png
sips -z 192 192 icons/icon-192.png --out icons/icon-192.png

# git commit and push
git add icons/icon-192.png icons/icon-512.png
git commit -m "Replace app icons with provided image"
git push
```

---

## File/Component chính

- `src/App.jsx` — toàn bộ logic UI, quiz generators, persistence wrapper, dashboard, và các component con.
- `icons/` — chứa `icon-192.png`, `icon-512.png`, và file HEIC nguồn khi có.
- `manifest.webmanifest` — khai báo icon PWA.
- `package.json` — chứa dependencies: `react`, `react-dom`, `vite`, `canvas-confetti`, `recharts`.

---

## Ghi chú vận hành / tiếp theo

- Nếu muốn tạo một GitHub Release với nội dung changelog tự động, cần gọi GitHub API (yêu cầu token) hoặc sử dụng giao diện web.
- Để deploy tự động lên Netlify có thể: kết nối repo lên Netlify hoặc dùng `netlify-cli` (`netlify deploy --prod`) với token.
- Đề xuất tối ưu: code-split với dynamic imports nếu cần giảm kích thước chunk JS lớn hơn 500KB.

---

File này được tạo tự động bởi trợ lý phát triển trong workspace.