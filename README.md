#  Zen-Editor

A powerful and minimalist Notion style app built with **React**, **Zustand**, **Tiptap**, and **TailwindCSS**, fully working in the browser via **localStorage** and **Gemini API integration**.

---

## Features

-  Notion-style **rich text editor**
-  Global state management with **Zustand**
-  **LocalStorage CRUD**: create, edit, delete notes
-  **Gemini API-powered AI features** (improve, summarize, expand text)
-  Responsive and beautiful UI via **TailwindCSS**
-  Block-level formatting (bold, italic, code, lists, etc.)
-  Fast build using **Vite** and **TypeScript**

---

##  Tech Stack

* React + TypeScript
* Zustand
* Tiptap 
* TailwindCSS
* Radix UI
* Vite
* Node.js + Express (Backend)
* Gemini API (AI features)

---

## Project Setup steps

### 1️⃣ Unzip the Project

- Unzip the downloaded ZIP file.
- Open the main folder in your code editor

### 2️⃣ Setup the Backend

Navigate to the backend folder

```bash
cd backend
```

- Create a `.env` file inside the `backend` folder and add the following line:
- You can create your GEMINI API KEY here -> https://aistudio.google.com/api-keys

```bash
GEMINI_API_KEY=your_gemini_api_key
```

Then install dependencies and start the backend server:

```bash
npm install
nodemon server.js
```

The backend will start running on `http://localhost:3000`.

---

### 3️⃣ Setup the Frontend

Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
# or if you face issues
npm install --force
```

Then start the development server:

```bash
npm run dev
```

Frontend will run at: `http://localhost:5173`