# 🚀 GlowLogic Solution - Modern Auth Web App + Database + Netlify Deployment

Complete step-by-step guide to run and deploy a modern web application with **Login & Registration UI**, **Node.js Express REST API**, **Database Storage (Bcrypt & JWT)**, and **Netlify Serverless Deployment**.

---

## 📁 Project Structure

```
login-database-netlify-app/
├── index.html            # Main Login & Register Page (Glassmorphic UI)
├── dashboard.html        # Authenticated User Dashboard
├── styles.css            # Dark Mode Design System with HSL tokens & Glow Effects
├── app.js                # Frontend Form Validation, Password Strength & API fetch
├── server.js             # Express API Server (Register, Login, Me endpoints)
├── db.js                 # Database Connection Module (JSON/SQLite storage)
├── functions/
│   └── api.js            # Netlify Serverless Function Handler (serverless-http)
├── netlify.toml          # Netlify Deployment Configuration & API redirects
├── package.json          # Node.js project manifest & dependencies
└── README.md             # Project Guide (Tamil + English)
```

---

## 🛠️ Step 1: Local Development Setup (Run on Local Computer)

### 1. Install Node Dependencies
Open your terminal in this folder and run:
```bash
npm install
```

### 2. Start the Local Backend & Frontend Server
Run the local server command:
```bash
npm start
```
You will see output like this:
```text
🚀 Server running locally on http://localhost:3000
📊 Connected to Database
```

### 3. Open in Browser
Open your browser and navigate to:
[http://localhost:3000](http://localhost:3000)

- Try creating a new account under **Create Account**.
- The backend will hash the password with `bcryptjs` and save the user in the database.
- You will be automatically redirected to the **Authenticated Dashboard** (`dashboard.html`).

---

## ⚡ Step 2: Deploying to Netlify (Netlify Upload)

Netlify enables single-click deployment for both your **Frontend HTML/CSS/JS** and **Backend Serverless API**.

### Option A: Deployment via Netlify Drag & Drop / GitHub (Easiest)

1. Create a free account at [Netlify.com](https://www.netlify.com/).
2. Push your project code to a GitHub repository or use Netlify CLI.
3. In Netlify Dashboard, click **Add new site** -> **Import an existing project**.
4. Select your repository.
5. Netlify will automatically detect `netlify.toml`:
   - **Publish directory**: `.`
   - **Functions directory**: `functions`
6. Click **Deploy Site**!

### Option B: Deployment using Netlify CLI

1. Install Netlify CLI globally (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```
2. Authorize Netlify:
   ```bash
   netlify login
   ```
3. Deploy to production:
   ```bash
   netlify deploy --prod
   ```

---

## 🗄️ Step 3: Cloud Database Connection for Netlify (Supabase / Neon / MongoDB)

For serverless deployments on Netlify, connect a cloud database:

### Using Supabase / PostgreSQL:
1. Create a free PostgreSQL database at [Supabase.com](https://supabase.com/).
2. Get your `DATABASE_URL` string.
3. In Netlify Dashboard, go to **Site Settings** -> **Environment Variables**.
4. Add `DATABASE_URL` and `JWT_SECRET`.

---

## 🔒 Security Features Implemented

1. **Password Hashing**: Passwords are never stored in plain text. `bcryptjs` is used to generate salted password hashes.
2. **JWT Authorization**: Session tokens are signed using `jsonwebtoken` and verified on protected endpoints (`/api/me`).
3. **Client Validation**: Real-time password strength check, email regex format checks, password confirmation.
4. **Serverless Compatibility**: Handled via `serverless-http` to run seamlessly on Netlify Functions without separate server hosting.
