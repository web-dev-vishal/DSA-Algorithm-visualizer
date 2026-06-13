# 🚀 Render Deployment Guide — DSA Algorithm Visualizer

This guide outlines the step-by-step instructions to deploy the entire visualizer stack (Frontend, Backend, and Redis) on **Render** utilizing the pre-configured [render.yaml](file:///c:/Users/vishal%20sanam/Downloads/DSA-Algorithm-visualizer/render.yaml) Blueprint.

---

## 📋 Prerequisites

Before deploying, make sure you have:
1. A **GitHub** account containing your repository of the visualizer.
2. A **Render** account (linked to GitHub).
3. A **MongoDB Atlas** database connection string (Render does not provide free MongoDB hosting out-of-the-box, so a free tier MongoDB Atlas cluster is highly recommended).
4. A **Groq API Key** from [console.groq.com](https://console.groq.com) for real-time algorithm analysis.

---

## 🔑 Step 1: Generate PASETO Authentication Keys

The backend requires secure Ed25519 public/private keys to sign and verify session tokens. Follow these steps to generate them locally:

1. Open your terminal in the backend folder and run:
   ```bash
   node generate-env.js
   ```
2. This will generate a fresh `.env` file containing unique, generated cryptographic keys.
3. Open the newly created `backend/.env` file and look for the following values:
   - `PASETO_PRIVATE_KEY`
   - `PASETO_PUBLIC_KEY`
   - `REFRESH_TOKEN_PRIVATE_KEY`
   - `REFRESH_TOKEN_PUBLIC_KEY`
4. Save these key strings; you will paste them into Render during the Blueprint setup step.

---

## ⚡ Step 2: 1-Click Blueprint Deployment on Render

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top-right corner and select **Blueprint**.
3. Connect your GitHub repository containing this codebase.
4. Render will automatically read the [render.yaml](file:///c:/Users/vishal%20sanam/Downloads/DSA-Algorithm-visualizer/render.yaml) file and list the resources to create:
   - **`dsa-visualizer-backend`**: Docker-based web service.
   - **`dsa-visualizer-frontend`**: Static web application.
   - **`dsa-visualizer-redis`**: Private cache instance.
5. Render will prompt you for the required environment variable values. Fill in:
   - **`MONGODB_URI`**: Paste your MongoDB Atlas connection URL (e.g. `mongodb+srv://<username>:<password>@cluster.mongodb.net/dsa_db?retryWrites=true&w=majority`).
   - **`GROQ_API_KEY`**: Your Groq platform completions key.
   - **`CLIENT_URL`**: Leave blank initially, or put a placeholder. Once the frontend static site is deployed, copy its URL and update this value in the backend's environment variables dashboard.
   - **`PASETO_PRIVATE_KEY`**: Paste the generated value from your local `backend/.env` file (including quotes and newlines `\n`).
   - **`PASETO_PUBLIC_KEY`**: Paste the generated value.
   - **`REFRESH_TOKEN_PRIVATE_KEY`**: Paste the generated value.
   - **`REFRESH_TOKEN_PUBLIC_KEY`**: Paste the generated value.
6. Click **Apply** to start the deployment.

---

## 🔄 Step 3: Link Client URLs

Once Render completes the build pipelines:
1. Copy the URL of your **`dsa-visualizer-frontend`** static site (e.g. `https://dsa-visualizer-frontend.onrender.com`).
2. Go to the dashboard settings of **`dsa-visualizer-backend`** -> **Environment**.
3. Set the `CLIENT_URL` variable to your frontend URL:
   - `CLIENT_URL` = `https://dsa-visualizer-frontend.onrender.com`
4. Save changes. Render will automatically redeploy the backend with the new configuration.

---

## 🩺 Verification & Troubleshooting

- **Server Health Check**: Verify the backend is up by visiting `https://dsa-visualizer-backend.onrender.com/health` (it should return `{"status":"UP"}`).
- **Logs**: If you encounter issues, review logs in the **Logs** tab of each service on Render.
