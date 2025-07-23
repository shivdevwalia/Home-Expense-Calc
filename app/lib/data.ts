import { startOfMonth, subMonths, endOfMonth } from "date-fns";
import { createClient } from "./supabase/server";

// export async function getAverageMonthlyExpense() {
//   const supabase = await createClient();

//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) return 0;

//   const startDate = startOfMonth(subMonths(new Date(), 3)).toISOString();

//   // Fetch normal expenses
//   const { data: expenses, error: expenseError } = await supabase
//     .from("expenses")
//     .select("amount, date")
//     .gte("date", startDate)
//     .eq("user_id", user.id);

//   if (expenseError) {
//     console.error("Error fetching expenses:", expenseError);
//     return 0;
//   }

//   // Fetch Household Help (person table) entries created in the last 3 months
//   const { data: people, error: personError } = await supabase
//     .from("person")
//     .select("salary, created_at")
//     .gte("created_at", startDate)
//     .eq("user_id", user.id);

//   if (personError) {
//     console.error("Error fetching person salaries:", personError);
//     return 0;
//   }

//   // Group both types by month
//   const monthlyTotals = new Map<string, number>();

//   // Group expenses
//   for (const expense of expenses || []) {
//     const month = new Date(expense.date).toISOString().slice(0, 7);
//     monthlyTotals.set(
//       month,
//       (monthlyTotals.get(month) || 0) + (expense.amount || 0)
//     );
//   }

//   // Group person salaries
//   for (const person of people || []) {
//     const month = new Date(person.created_at).toISOString().slice(0, 7);
//     monthlyTotals.set(
//       month,
//       (monthlyTotals.get(month) || 0) + (person.salary || 0)
//     );
//   }

//   const monthsWithData = monthlyTotals.size;
//   if (monthsWithData === 0) return 0;

//   const total = Array.from(monthlyTotals.values()).reduce(
//     (acc, val) => acc + val,
//     0
//   );
//   return Math.round(total / monthsWithData);
// }

// export async function getAverageMonthlyExpense(): Promise<number> {
//   const supabase = await createClient();

//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) return 0;

//   const today = new Date();
//   const threeMonthsAgo = startOfMonth(subMonths(today, 2)); // current + 2 back

//   /* ---------- 1. Pull data ---------- */

//   // Normal expenses for the window
//   const { data: expenses, error: expenseError } = await supabase
//     .from("expenses")
//     .select("amount, date")
//     .gte("date", threeMonthsAgo.toISOString())
//     .eq("user_id", user.id);

//   if (expenseError) {
//     console.error("Error fetching expenses:", expenseError);
//     return 0;
//   }

//   // All people (need end_date to see when they left)
//   const { data: people, error: personError } = await supabase
//     .from("person")
//     .select("salary, created_at, end_date")
//     .eq("user_id", user.id);

//   if (personError) {
//     console.error("Error fetching person salaries:", personError);
//     return 0;
//   }

//   /* ---------- 2. Build a map YYYY‑MM → total ---------- */

//   const monthlyTotals = new Map<string, number>();

//   // (a) Add normal expenses month‑by‑month
//   for (const exp of expenses || []) {
//     const key = new Date(exp.date).toISOString().slice(0, 7); // "YYYY-MM"
//     monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + (exp.amount || 0));
//   }

//   // (b) Add salaries for months in which the person was active
//   for (let i = 0; i < 3; i++) {
//     const monthStart = startOfMonth(subMonths(today, 2 - i));
//     const monthEnd = endOfMonth(monthStart);
//     const key = monthStart.toISOString().slice(0, 7);

//     for (const person of people || []) {
//       const createdAt = new Date(person.created_at);
//       const exitDate = person.end_date
//         ? new Date(person.end_date)
//         : new Date("9999-12-31");

//       const wasActive = createdAt <= monthEnd && exitDate >= monthStart; // active any day that month

//       if (wasActive) {
//         monthlyTotals.set(
//           key,
//           (monthlyTotals.get(key) || 0) + (person.salary || 0)
//         );
//       }
//     }
//   }

//   /* ---------- 3. Average over months that actually have data ---------- */

//   const totalsWithData = Array.from(monthlyTotals.values()).filter(
//     (val) => val > 0
//   );
//   if (totalsWithData.length === 0) return 0;

//   const totalSum = totalsWithData.reduce((acc, v) => acc + v, 0);
//   return Math.round(totalSum / totalsWithData.length);
// }

// export async function getAverageMonthlyExpense() {
//   const supabase = await createClient();
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) return 0;

//   const today = new Date();

//   // Prepare a map to hold totals per month (yyyy-mm => total)
//   const monthlyTotals = new Map<string, number>();

//   // Fetch all normal expenses for the last 3 months
//   const startDate = startOfMonth(subMonths(today, 2)).toISOString();
//   const { data: expenses, error: expenseError } = await supabase
//     .from("expenses")
//     .select("amount, date")
//     .eq("user_id", user.id)
//     .gte("date", startDate);

//   if (expenseError) {
//     console.error("Error fetching expenses:", expenseError);
//     return 0;
//   }

//   for (const exp of expenses || []) {
//     const date = new Date(exp.date);
//     const month = date.getMonth() + 1;
//     const year = date.getFullYear();
//     const key = `${year}-${String(month).padStart(2, "0")}`;

//     monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + (exp.amount || 0));
//   }

//   // Fetch all person salaries for the last 3 months
//   const salaryMonths = [...Array(3)].map((_, i) => {
//     const d = subMonths(today, 2 - i);
//     return { month: d.getMonth() + 1, year: d.getFullYear() };
//   });

//   const { data: people, error: peopleError } = await supabase
//     .from("person")
//     .select("salary, month, year")
//     .eq("user_id", user.id)
//     .in(
//       "month",
//       salaryMonths.map((m) => m.month)
//     )
//     .in(
//       "year",
//       salaryMonths.map((m) => m.year)
//     );

//   if (peopleError) {
//     console.error("Error fetching person data:", peopleError);
//     return 0;
//   }

//   for (let { month, year, salary } of people || []) {
//     const key = `${year}-${String(month).padStart(2, "0")}`;
//     monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + (salary || 0));
//   }

//   // Final step: calculate average
//   const values = Array.from(monthlyTotals.values());
//   const total = values.reduce((sum, val) => sum + val, 0);
//   const average = values.length ? total / values.length : 0;

//   return Math.round(average);
// }

// export async function getAverageMonthlyExpense() {
//   const supabase = await createClient();
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) return 0;

//   const today = new Date();

//   // Get last 3 months as array of { month, year }
//   const last3Months = [...Array(3)].map((_, i) => {
//     const d = subMonths(today, 2 - i);
//     return { month: d.getMonth() + 1, year: d.getFullYear() };
//   });

//   // Build a Set of keys like '2025-07'
//   const monthKeys = last3Months.map(({ month, year }) => `${year}-${String(month).padStart(2, '0')}`);

//   const monthlyTotals = new Map<string, number>();

//   // Fetch expenses grouped by month and year
//   const { data: expenses, error: expenseError } = await supabase
//     .from("expenses")
//     .select("amount, month, year")
//     .eq("user_id", user.id)
//     .in("month", last3Months.map((m) => m.month))
//     .in("year", last3Months.map((m) => m.year));

//   if (expenseError) {
//     console.error("Error fetching expenses:", expenseError);
//     return 0;
//   }

//   for (const exp of expenses || []) {
//     const key = `${exp.year}-${String(exp.month).padStart(2, '0')}`;
//     monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + (exp.amount || 0));
//   }

//   // Fetch person salaries for these months
//   const { data: people, error: peopleError } = await supabase
//     .from("person")
//     .select("salary, month, year")
//     .eq("user_id", user.id)
//     .in("month", last3Months.map((m) => m.month))
//     .in("year", last3Months.map((m) => m.year));

//   if (peopleError) {
//     console.error("Error fetching person data:", peopleError);
//     return 0;
//   }

//   for (const p of people || []) {
//     const key = `${p.year}-${String(p.month).padStart(2, '0')}`;
//     monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + (p.salary || 0));
//   }

//   // Calculate average
//   const values = last3Months.map(({ month, year }) => {
//     const key = `${year}-${String(month).padStart(2, '0')}`;
//     return monthlyTotals.get(key) || 0;
//   });

//   const total = values.reduce((sum, val) => sum + val, 0);
//   const average = total / values.length;

//   return Math.round(average);
// }

export async function getAverageMonthlyExpense() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return 0;

  const today = new Date();
  // Get the target 3 months (current month and 2 previous months)
  const targetMonths = [...Array(3)].map((_, i) => {
    const date = subMonths(today, 2 - i);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return { month, year, key: `${year}-${String(month).padStart(2, "0")}` };
  });

  // Prepare a map to hold totals per month (yyyy-mm => total)
  const monthlyTotals = new Map<string, number>();

  // Fetch expenses for the target months only
  const { data: expenses, error: expenseError } = await supabase
    .from("expenses")
    .select("amount, month, year")
    .eq("user_id", user.id)
    .in(
      "month",
      targetMonths.map((m) => m.month)
    )
    .in(
      "year",
      targetMonths.map((m) => m.year)
    );

  if (expenseError) {
    console.error("Error fetching expenses:", expenseError);
    return 0;
  }

  // Process expenses by month/year labels
  for (const exp of expenses || []) {
    const key = `${exp.year}-${String(exp.month).padStart(2, "0")}`;
    // Only include if it's one of our target months
    if (targetMonths.some((tm) => tm.key === key)) {
      monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + (exp.amount || 0));
    }
  }

  // Fetch person salaries for the target months only (regardless of is_active)
  const { data: people, error: peopleError } = await supabase
    .from("person")
    .select("salary, month, year")
    .eq("user_id", user.id)
    .in(
      "month",
      targetMonths.map((m) => m.month)
    )
    .in(
      "year",
      targetMonths.map((m) => m.year)
    );

  if (peopleError) {
    console.error("Error fetching person data:", peopleError);
    return 0;
  }

  // Process person salaries by month/year labels
  for (const person of people || []) {
    const key = `${person.year}-${String(person.month).padStart(2, "0")}`;
    // Only include if it's one of our target months
    if (targetMonths.some((tm) => tm.key === key)) {
      monthlyTotals.set(
        key,
        (monthlyTotals.get(key) || 0) + (person.salary || 0)
      );
    }
  }

  // Calculate average only from months that have data (don't include months with 0 data)
  const values = Array.from(monthlyTotals.values());
  const total = values.reduce((sum, val) => sum + val, 0);
  console.log("total", total);
  console.log("valueslength", values.length);
  const average = values.length ? total / values.length : 0;
  console.log("average", average);

  return Math.floor(average);
}

export async function getCurrentMonthExpense() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return 0;

  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();

  // 1. Fetch normal expenses
  const { data: expenses, error: expenseError } = await supabase
    .from("expenses")
    .select("amount,user_id,date,month,year")

    .eq("month", thisMonth)
    .eq("year", thisYear)
    .eq("user_id", user.id);

  if (expenseError) {
    console.error("Error fetching expenses:", expenseError);
    return 0;
  }

  const normalTotal =
    expenses?.reduce((sum, row) => sum + (row.amount || 0), 0) || 0;

  // 2. Fetch Household Help salaries (active + created this month)
  const { data: people, error: personError } = await supabase
    .from("person")
    .select("salary, created_at, is_active,month,year")
    .eq("user_id", user.id)
    .eq("month", thisMonth)
    .eq("year", thisYear)
    .eq("is_active", true);

  if (personError) {
    console.error("Error fetching person salaries:", personError);
    return Math.round(normalTotal);
  }

  const householdTotal =
    people?.reduce((sum, row) => sum + (row.salary || 0), 0) || 0;

  return Math.round(normalTotal + householdTotal);
}

// export async function getLastSixMonthsExpenses() {
//   const supabase = await createClient();
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) return [];

//   const today = new Date();
//   const grouped = new Map<string, number>();

//   // Prepare last 6 months
//   const monthLabels = [...Array(6)].map((_, i) => {
//     const date = subMonths(today, 5 - i);
//     const label = date.toLocaleString("en-US", {
//       month: "short",
//       year: "numeric",
//     });
//     return { date, label };
//   });

//   // 1. Get ALL normal expenses (no date filter since they're recurring)
//   const { data: expenseData, error: expenseError } = await supabase
//     .from("expenses")
//     .select("amount, date")
//     .eq("user_id", user.id);

//   if (expenseError) {
//     console.error("Expense error", expenseError);
//     return [];
//   }

//   // For each month, add expenses that were created on or before that month
//   for (const { date, label } of monthLabels) {
//     const monthEnd = endOfMonth(date);

//     // Add recurring expenses that existed by this month
//     for (const exp of expenseData || []) {
//       const expenseDate = new Date(exp.date);
//       // Include expense if it was created on or before this month
//       if (
//         expenseDate.getMonth() === date.getMonth() &&
//         expenseDate.getFullYear() === date.getFullYear()
//       ) {
//         grouped.set(label, (grouped.get(label) || 0) + (exp.amount || 0));
//       }
//     }
//   }

//   // 2. Add salaries for each month the person is active
//   for (const { date, label } of monthLabels) {
//     const monthEnd = endOfMonth(date);

//     const { data: peopleData, error: peopleError } = await supabase
//       .from("person")
//       .select("salary, created_at, end_date")
//       .lte("created_at", monthEnd.toISOString())
//       .or(`end_date.gte.${monthEnd.toISOString()},end_date.is.null`)
//       .eq("user_id", user.id);

//     if (peopleError) {
//       console.error("People error", peopleError);
//       continue;
//     }

//     // Add salary for this month if person is active
//     for (const person of peopleData || []) {
//       const createdAt = new Date(person.created_at);
//       const monthStart = startOfMonth(date);
//       const personEnd = person.end_date ? new Date(person.end_date) : null;

//       // Check if person is active during this month
//       const isActiveThisMonth =
//         createdAt <= monthEnd && (!personEnd || personEnd >= monthStart);

//       if (isActiveThisMonth) {
//         grouped.set(label, (grouped.get(label) || 0) + (person.salary || 0));
//       }
//     }
//   }

//   return Array.from(grouped.entries())
//     .sort((a, b) => Date.parse(`01 ${a[0]}`) - Date.parse(`01 ${b[0]}`))
//     .map(([label, value]) => ({ label, value: Math.round(value) }));
// }

export async function getLastSixMonthsExpenses() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return [];

  const today = new Date();
  const monthYearList = [...Array(6)].map((_, i) => {
    const date = subMonths(today, 5 - i);
    const label = date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
    return {
      label,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  });

  const results = [];

  for (const { label, month, year } of monthYearList) {
    let total = 0;

    // 1. Get expenses for this month
    const { data: expenseData, error: expenseError } = await supabase
      .from("expenses")
      .select("amount,month,year")
      .eq("user_id", user.id)
      .eq("month", month)
      .eq("year", year);

    if (expenseError) {
      console.error("Expense error", expenseError);
    } else {
      for (const exp of expenseData || []) {
        total += exp.amount || 0;
      }
    }

    // 2. Get salaries for this month
    const { data: peopleData, error: peopleError } = await supabase
      .from("person")
      .select("salary,month,year,is_active")
      .eq("user_id", user.id)
      .eq("month", month)
      .eq("is_active", true)
      .eq("year", year);

    if (peopleError) {
      console.error("Person error", peopleError);
    } else {
      for (const person of peopleData || []) {
        total += person.salary || 0;
      }
    }

    results.push({ label, value: Math.round(total) });
  }

  return results;
}

export async function getCategories() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("No user found");
    return [];
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id, name")

    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data;
}
export async function getAllSubcategories() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("No user found");
    return [];
  }

  const { data, error } = await supabase
    .from("subcategories")
    .select("id, name, category_id") // include category_id for linking

    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }

  return data;
}

export async function createExpense({
  subcategory_id,
  amount,
  date,
}: {
  subcategory_id: string;
  amount: number;
  date: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("User not found");

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    subcategory_id,
    amount,
    date,
  });

  if (error) {
    console.error("Error creating expense:", error);
    throw error;
  }
}

export async function updateExpense(id: string, newAmount: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("expenses")
    .update({ amount: newAmount })
    .eq("id", id);

  if (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
}

export async function getMonthlyExpenseBySubcategory(subcategory_id: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not found");
    return null;
  }

  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();

  const { data, error } = await supabase
    .from("expenses")
    .select("id, amount")
    .eq("user_id", user.id)
    .eq("subcategory_id", subcategory_id)
    .gte("date", start)
    .lte("date", end)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error checking for existing expense:", error);
    return null;
  }

  return data;
}

export async function getUserExpensesGrouped() {
  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("expenses")
    .select(
      `
      id,
      amount,
      subcategories (
        id,
        name,
        category_id,
        categories (
          id,
          name
        )
      )
    `
    )
    .gte("date", start)
    .lte("date", end)
    .gt("amount", 0);

  if (error) {
    console.error("Error fetching user expenses:", error);
    return [];
  }

  return data;
}

export async function getMonthlyExpenseByCategory() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not found");
    return [];
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JS months are 0-based
  const currentYear = now.getFullYear();

  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();

  // 1. Fetch regular expenses
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .select(
      `
      month,
      year,
      date,
      user_id,
      amount,
      subcategories (
        id,
        categories (
          name
        )
      )
    `
    )
    .eq("user_id", user.id)

    .eq("month", currentMonth)
    .eq("year", currentYear)
    .gt("amount", 0);

  if (expenseError || !expenseData) {
    console.error("Error fetching expenses:", expenseError);
    return [];
  }

  const categoryTotals = new Map<string, number>();

  // 2. Aggregate regular expenses
  for (const exp of expenseData) {
    const subcategories = Array.isArray(exp.subcategories)
      ? exp.subcategories
      : [exp.subcategories];

    for (const subcat of subcategories) {
      const categories = Array.isArray(subcat?.categories)
        ? subcat.categories
        : [subcat.categories];

      for (const cat of categories) {
        const categoryName = cat?.name;
        if (!categoryName || typeof exp.amount !== "number") continue;

        categoryTotals.set(
          categoryName,
          (categoryTotals.get(categoryName) || 0) + exp.amount
        );
      }
    }
  }

  // 3. Fetch household help salaries from `person` table
  const { data: personData, error: personError } = await supabase
    .from("person")
    .select(
      `
      month,
      year,
      is_active,
      salary,
      subcategories (
        categories (
          name
        )
      )
    `
    )
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .eq("is_active", true);

  if (personError) {
    console.error("Error fetching person data:", personError);
  } else if (personData) {
    for (const person of personData) {
      let categoryName: string | undefined;

      const subcatArray = Array.isArray(person.subcategories)
        ? person.subcategories
        : [person.subcategories];

      const firstSubcat = subcatArray[0];

      if (firstSubcat) {
        const categories = Array.isArray(firstSubcat.categories)
          ? firstSubcat.categories
          : [firstSubcat.categories];

        categoryName = categories[0]?.name;
      }

      if (
        categoryName?.trim().toLowerCase() === "household help" &&
        typeof person.salary === "number"
      ) {
        categoryTotals.set(
          categoryName,
          (categoryTotals.get(categoryName) || 0) + person.salary
        );
      }
    }
  }

  return Array.from(categoryTotals.entries()).map(([category, amount]) => ({
    category,
    amount,
  }));
}

export async function getMonthlySubcategoriesGroupedByCategory() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not found");
    return {};
  }

  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();
  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();

  const { data, error } = await supabase
    .from("expenses")
    .select(
      `
      date,
      month,
      year,
      amount,
      subcategories (
        name,
        categories (
          name
        )
      )
    `
    )
    .eq("user_id", user.id)
    .eq("month", thisMonth)
    .eq("year", thisYear)
    .gt("amount", 0);

  if (error || !data) {
    console.error("Error fetching subcategories:", error);
    return {};
  }

  const map: Record<string, { subcategory: string; amount: number }[]> = {};

  // 👉 Group normal expenses
  for (const exp of data) {
    const subcats = Array.isArray(exp.subcategories)
      ? exp.subcategories
      : [exp.subcategories];

    for (const subcat of subcats) {
      const subcatName = subcat?.name;

      const categories = Array.isArray(subcat?.categories)
        ? subcat.categories
        : [subcat.categories];

      const catName = categories?.[0]?.name;

      if (!subcatName || !catName || typeof exp.amount !== "number") continue;

      if (!map[catName]) {
        map[catName] = [];
      }

      const existing = map[catName].find((s) => s.subcategory === subcatName);
      if (existing) {
        existing.amount += exp.amount;
      } else {
        map[catName].push({ subcategory: subcatName, amount: exp.amount });
      }
    }
  }

  // 👉 Add Household Help from `person` table
  const { data: personData, error: personError } = await supabase
    .from("person")
    .select(
      `
      is_active,
      month,
      year,
      salary,
      subcategories (
        name,
        categories (
          name
        )
      )
    `
    )
    .eq("user_id", user.id)
    .eq("is_active", true)
    .eq("month", thisMonth)
    .eq("year", thisYear)
    .lte("created_at", end);

  if (personError) {
    console.error("Error fetching household people:", personError);
  }

  if (personData) {
    for (const person of personData) {
      const subcatArray = Array.isArray(person.subcategories)
        ? person.subcategories
        : [person.subcategories];

      const firstSubcat = subcatArray[0];
      if (!firstSubcat) continue;

      const subcatName = firstSubcat.name;
      const catArray = Array.isArray(firstSubcat.categories)
        ? firstSubcat.categories
        : [firstSubcat.categories];

      const catName = catArray[0]?.name;

      if (!subcatName || !catName) continue;

      if (!map[catName]) {
        map[catName] = [];
      }

      const existing = map[catName].find((s) => s.subcategory === subcatName);
      if (existing) {
        existing.amount += person.salary;
      } else {
        map[catName].push({ subcategory: subcatName, amount: person.salary });
      }
    }
  }

  return map;
}

export async function getHouseHelpRolesForCurrentUser() {
  const supabase = await createClient();

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JS months are 0-based
  const currentYear = now.getFullYear();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return [];

  const { data, error } = await supabase
    .from("person")
    .select(
      `
      month,
      year,
      is_active,
      id,
      name,
      subcategories (
        id,
        name,
        categories (
          name
        )
      )
    `
    )
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .eq("is_active", true)
    .eq("user_id", user.id);

  if (error || !data) {
    console.error("Error fetching house help persons:", error);
    return [];
  }

  const roles: { id: string; name: string; subcategoryName: string }[] = [];

  for (const p of data) {
    const subcat = Array.isArray(p.subcategories)
      ? p.subcategories[0]
      : p.subcategories;

    const cat = Array.isArray(subcat?.categories)
      ? subcat.categories[0]
      : subcat?.categories;

    if (cat?.name !== "Household Help") continue;

    roles.push({
      id: p.id,
      name: p.name,
      subcategoryName: subcat?.name || "",
    });
  }

  return roles;
}

async function getLast3MonthsRangesIncludingCurrent() {
  const supabase = await createClient();
  const result = [];

  for (let i = 2; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);

    result.push({
      month: monthDate.toISOString().slice(0, 7), // "YYYY-MM"
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
  }

  return result;
}

export async function checkAndInsertAlerts() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const userId = user.id;

  const now = new Date();
  const thisMonthStart = startOfMonth(now).toISOString();
  const thisMonthEnd = endOfMonth(now).toISOString();

  const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString();
  const lastMonthEnd = endOfMonth(subMonths(now, 1)).toISOString();

  // 🔸 Expenses
  const { data: currentMonth } = await supabase
    .from("expenses")
    .select("amount")
    .eq("user_id", userId)
    .gte("date", thisMonthStart)
    .lte("date", thisMonthEnd);

  const { data: lastMonth } = await supabase
    .from("expenses")
    .select("amount")
    .eq("user_id", userId)
    .gte("date", lastMonthStart)
    .lte("date", lastMonthEnd);

  const months = await getLast3MonthsRangesIncludingCurrent();

  const { data: people1, error: personError1 } = await supabase
    .from("person")
    .select("salary, created_at,end_date")
    .lte("created_at", months[1].endDate)
    .or(`end_date.gte.${months[1].endDate},end_date.is.null`)
    .eq("user_id", user.id);

  const { data: people2, error: personError2 } = await supabase
    .from("person")
    .select("salary, created_at,end_date")
    .lte("created_at", months[2].endDate)
    .or(`end_date.gte.${months[2].endDate},end_date.is.null`)
    .eq("user_id", user.id);

  const totalCurrentPerson =
    people2?.reduce((sum, e) => sum + e.salary, 0) || 0;
  const totalCurrentExpense =
    currentMonth?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const totalCurrent = totalCurrentExpense + totalCurrentPerson;

  const totalLastPerson = people1?.reduce((sum, e) => sum + e.salary, 0) || 0;
  const totalLastExpense =
    lastMonth?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const totalLast = totalLastExpense + totalLastPerson;
  const alertsToInsert: string[] = [];

  if (totalLast > 0 && totalCurrent > totalLast * 1.15) {
    alertsToInsert.push(
      " Your expenses this month are over 15% higher than last month."
    );
  }

  // 🔸 Absences
  const { data: absences } = await supabase
    .from("absences")
    .select("person_id, date")
    .eq("user_id", userId)
    .gte("date", thisMonthStart)
    .lte("date", thisMonthEnd);

  const absencesCount: Record<string, number> = {};
  absences?.forEach((a) => {
    absencesCount[a.person_id] = (absencesCount[a.person_id] || 0) + 1;
  });

  const { data: persons } = await supabase
    .from("person")
    .select("id, name,is_active")
    .eq("is_active", true)
    .eq("user_id", userId);

  const personNames = new Set(persons?.map((p) => p.name) || []);

  persons?.forEach((p) => {
    if (absencesCount[p.id] > 2) {
      alertsToInsert.push(
        ` ${p.name} has been absent more than 2 days this month.`
      );
    }
  });

  // 🔸 Insert new alerts if they don't exist
  for (const msg of alertsToInsert) {
    const { count } = await supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("message", msg);

    if (count === 0) {
      await supabase.from("alerts").insert({
        user_id: userId,
        message: msg,
        dismissed: false,
      });
    }
  }

  // 🔸 Clean up alerts for deleted people
  const { data: existingAlerts } = await supabase
    .from("alerts")
    .select("id, message")
    .eq("user_id", userId);

  for (const alert of existingAlerts || []) {
    if (alert.message.includes("has been absent more than 2 days")) {
      const name = alert.message.split(" has been absent")[0].trim();
      if (!personNames.has(name)) {
        await supabase.from("alerts").delete().eq("id", alert.id);
      }
    }
  }
}

export async function getTotalOverdueAmount() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("overdue_payments")
    .select("amount")
    .eq("paid", false);

  if (error) {
    console.error("Error fetching total overdue:", error);
    return 0;
  }

  return data.reduce((sum, row) => sum + Number(row.amount), 0);
}
