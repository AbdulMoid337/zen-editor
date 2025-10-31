# 🧠 Zen-Editor

A powerful and minimalist Notepad app built with **React**, **Zustand**, **Tiptap**, and **TailwindCSS**, fully working in the browser via **localStorage**.  

## ✨ Features

- 📝 Notion-style **rich text editor**
- ⚙️ Global state management with **Zustand**
- 💾 **LocalStorage CRUD**: create, edit, delete notes
- 🎨 Responsive and beautiful UI via **TailwindCSS**
- 🧱 Block-level formatting (bold, italic, code, lists, etc.)
- ⚡️ Fast build using **Vite** and **TypeScript**

---

## 🚀 Quick Start

```bash
git clone https://github.com/humoyun-dev/notepad
cd notepad
npm install
npm run dev
````

App will run at: `http://localhost:5173`

---

## 🛠 Tech Stack

* React + TypeScript
* Zustand
* Tiptap (ProseMirror-based rich text editor)
* TailwindCSS
* Lucide React Icons
* Vite

---

## 📦 Notes Format

Each note is stored like this in `localStorage`:

```json
{
  "id": "uuid",
  "title": "Note title",
  "content": "<p>rich text HTML...</p>"
}
```

