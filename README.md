# 💰 Indian Household Expense Tracker (Full Stack)

A full-stack expense tracking platform designed for Indian households.  
It helps you manage **monthly expenses**, **household help salaries**, **advances**, **absences**, **overdue payments**, and **detailed reports** — all in one place.  

Built with **Next.js**, **Supabase**, and **Chakra UI**, it features **Google Sheets sync**, **real-time alerts**, **interactive charts**, and a **Chatling AI assistant** that can answer questions about the web app in natural language.  

---

## 🌐 Live Demo

🔗 [Frontend (Next.js)](https://your-expense-tracker.vercel.app/)  
🔗 [Backend (Supabase)](https://supabase.com)  

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js (React)
- Chakra UI
- Chartjs (charts & graphs)

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


## 📸 Screenshots

### 🏠 Main Dashboard  
Landing page showing expense summary, alerts, and quick stats.  
![Dashboard]<img width="2546" height="1263" alt="dashboard png" src="https://github.com/user-attachments/assets/285fe040-ad9b-49cb-b84b-3f99c3832bba" />


---

### 📊 Category & Subcategory View  
Breakdown of expenses by category and subcategory.  
![Category & Subcategory]<img width="1930" height="933" alt="pie png" src="https://github.com/user-attachments/assets/17bc3bff-36f0-45d6-a6f4-66808ab165dc" />

)

---

### 📅 Absences (Last 6 Months)  
Absence tracking for each household help member over the last six months.  
![Absences 6 Months]<img width="1986" height="1072" alt="absencechart png" src="https://github.com/user-attachments/assets/4f63df3b-c59e-4b22-902e-66f385bb9c15" />


---

### 👥 Household Help Overview  
List of all household help with quick info and actions.  
![Household Help Overview]<img width="2559" height="1230" alt="overview png" src="https://github.com/user-attachments/assets/871eb012-9daa-49cd-ab4c-0797d43ca457" />


---

### 🧍 Individual Person Page  
Detailed view for a single household help member.  
![Individual Person]<img width="1989" height="850" alt="person png" src="https://github.com/user-attachments/assets/92333bf4-83bf-4f50-a172-cfbfb10a242f" />


---

### ➕ Adding Absences  
Form to add and record absences for household help.  
![Add Absence]<img width="1961" height="928" alt="addabsence png" src="https://github.com/user-attachments/assets/4ba0cc31-9f4d-4c93-80dd-e2b53437606a" />


---

### 💰 Salary View  
Monthly salary details and payment tracking for household help.  
![Salary View]<img width="1902" height="1024" alt="salary png" src="https://github.com/user-attachments/assets/58d018f0-986b-4dc5-a050-36d1af46c828" />



### 📝 Add Expenses Form  
Form to add new expenses with category, subcategory, and amount.  
![Add Expenses]<img width="1402" height="778" alt="Screenshot 2025-08-15 172052" src="https://github.com/user-attachments/assets/9434df6d-80e9-40a9-bbce-89c8b70789f8" />


---

### 📆 Monthly Expense Breakdown  
Chart showing monthly expenses per category for a selected year.  
![Monthly Expense Breakdown]<img width="1975" height="798" alt="Screenshot 2025-08-15 172136" src="https://github.com/user-attachments/assets/fff86073-67f0-421d-9be4-73143a802ddc" />


---

### 🚨 Overdue Payments  
List of unpaid household help salaries and utility bills with payment status.  
![Overdue Payments]<img width="2037" height="1118" alt="Screenshot 2025-08-15 172204" src="https://github.com/user-attachments/assets/964d1182-3ddb-4190-bfb8-4aeea32fac6a" />


---

### 🔐 Sign-In Page  
Login with email/password or Google account.  
![Sign In]<img width="1089" height="1085" alt="Screenshot 2025-08-15 172552" src="https://github.com/user-attachments/assets/4216b0a3-5f89-44ca-9d3b-21e57d77d7be" />



