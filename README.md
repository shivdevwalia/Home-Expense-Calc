# 💰 Indian Household Expense Tracker (Full Stack)

A full-stack expense tracking platform designed for Indian households.  
It helps you manage **monthly expenses**, **household help salaries**, **advances**, **absences**, **overdue payments**, and **detailed reports** — all in one place.  

Built with **Next.js**, **Supabase**, and **Chakra UI**, it features **Google Sheets sync**, **real-time alerts**, **interactive charts**, and a **Chatling AI assistant** that can answer questions about your expenses in natural language.  

---

## 🌐 Live Demo

🔗 [Frontend (Next.js)](https://your-expense-tracker.vercel.app/)  
🔗 [Backend (Supabase)](https://supabase.com)  

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js (React)
- Chakra UI
- Recharts (charts & graphs)

**Backend:**
- Supabase (PostgreSQL + Auth + RLS)
- Supabase Functions & Scheduled Edge Functions

**Integrations:**
- Google Sheets API (data sync)
- Chatling AI Assistant (personalized Q&A)

---

## ✅ Features

### 👥 Authentication & Access
- Email/password sign-up & login via Supabase Auth
- Row Level Security to isolate each user’s data

### 📊 Expense Tracking
- Track expenses by **category** and **subcategory**
- Categories include **Household Help**, **Utilities**, etc.
- Salaries for household help are recorded as expenses

### 📅 Absences & Salary Deduction
- Record absences per person
- Option to **deduct salary for absences** (auto-adjusts monthly salary)
- View absence history for the last 6 months (line chart with month-year format)
- Alerts if someone has more than **2 absences** in a month

### 💵 Advances Handling
- Record salary advances for workers
- Auto-adjust monthly salary after deductions
- Integrated into **HelpNavbar**

### 📦 Overdue Payments
- Track overdue payments for:
  - **Household Help** → `Name - Role`
  - **Utilities** → Subcategory name (e.g., Electricity)
- Automatically add overdue payment entries when:
  - A new household help is added  
  - A new utility expense is added  
- Monthly scheduled function to carry forward unpaid dues
- Overdue section includes:
  - **Summary cards** → Total, 0–30 days, 30–60 days overdue
  - Grouped & collapsible lists
  - Paid/unpaid toggle with dynamic updates
  - Separate section for paid overdue payments

### 📈 Reports & Charts
- Monthly expense view by year
- Category-wise and subcategory-wise breakdown for any month/year
- Interactive charts:
  - Click bar chart month → category pie chart → subcategory pie chart
- Powered by Supabase functions with `auth.user` context

### 🚨 Alerts
- Show at top of dashboard when:
  - Current month’s expenses exceed **15%** of last month’s  
  - A person has **more than 2 absences** this month  

### 🧭 HelpNavbar
- Dropdown to select role/subcategory (e.g., Maid, Driver)
- Lists people under selected role in a styled format
- Manages salary, absences, and advances in one place

### 🤖 Chatling AI Assistant
- Connected to synced Google Sheets data
- Users can ask:
  - “How much did I spend on electricity last month?”
  - “Who has the most absences this year?”
- Returns **personalized insights** instantly

---


