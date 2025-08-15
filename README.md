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
## 📸 Screenshots

### 🏠 Main Dashboard  
Landing page showing expense summary, alerts, and quick stats.  
![Dashboard](https://github.com/user-attachments/assets/452b27b4-c9e6-4403-a899-0ce6a28dc8b7.png)

---

### 📊 Category & Subcategory View  
Breakdown of expenses by category and subcategory.  
![Category & Subcategory](https://github.com/user-attachments/assets/c5eccd07-9e41-4d49-a7e4-d0c0d5380527.png)

---

### 📅 Absences (Last 6 Months)  
Absence tracking for each household help member over the last six months.  
![Absences 6 Months](https://github.com/user-attachments/assets/c0cd8109-fda9-46c1-a9f6-79dd1aecb7bb.png)

---

### 👥 Household Help Overview  
List of all household help with quick info and actions.  
![Household Help Overview](https://github.com/user-attachments/assets/cb4418b9-4df6-469b-b720-077ff498e5f8.png)

---

### 🧍 Individual Person Page  
Detailed view for a single household help member.  
![Individual Person](https://github.com/user-attachments/assets/ca3cef49-2512-4e06-ba91-763d0658b2f3.png)

---

### ➕ Adding Absences  
Form to add and record absences for household help.  
![Add Absence](https://github.com/user-attachments/assets/1b44c64e-b588-4fea-af82-e61ea9d190af.png)


