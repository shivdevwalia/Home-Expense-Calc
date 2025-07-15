import { startOfMonth, subMonths, endOfMonth } from "date-fns";
import { createClient } from "./supabase/server";

// export async function getAverageMonthlyExpense() {
//   const supabase = await createClient();

//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) return 0;
//   5;
//   const threeMonthsAgo = startOfMonth(subMonths(new Date(), 3)).toISOString();

//   const { data, error } = await supabase
//     .from("expenses")
//     .select("amount, date")
//     .gte("date", threeMonthsAgo)
//     .eq("user_id", user.id);

//   if (error || !data) {
//     console.error("Error fetching expenses:", error);
//     return 0;
//   }

//   // Group by month
//   const monthlyTotals = new Map<string, number>();

//   for (const expense of data) {
//     const month = new Date(expense.date).toISOString().slice(0, 7); // "2025-07"
//     monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + expense.amount);
//   }
//   const monthsWithData = monthlyTotals.size;
//   if (monthsWithData === 0) return 0;

//   const totalSpent = Array.from(monthlyTotals.values()).reduce(
//     (acc, val) => acc + val,
//     0
//   );
//   const avg = totalSpent / monthsWithData;

//   return Math.round(avg);
// }

export async function getAverageMonthlyExpense() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return 0;

  const startDate = startOfMonth(subMonths(new Date(), 3)).toISOString();

  // Fetch normal expenses
  const { data: expenses, error: expenseError } = await supabase
    .from("expenses")
    .select("amount, date")
    .gte("date", startDate)
    .eq("user_id", user.id);

  if (expenseError) {
    console.error("Error fetching expenses:", expenseError);
    return 0;
  }

  // Fetch Household Help (person table) entries created in the last 3 months
  const { data: people, error: personError } = await supabase
    .from("person")
    .select("salary, created_at")
    .gte("created_at", startDate)
    .eq("user_id", user.id);

  if (personError) {
    console.error("Error fetching person salaries:", personError);
    return 0;
  }

  // Group both types by month
  const monthlyTotals = new Map<string, number>();

  // Group expenses
  for (const expense of expenses || []) {
    const month = new Date(expense.date).toISOString().slice(0, 7);
    monthlyTotals.set(
      month,
      (monthlyTotals.get(month) || 0) + (expense.amount || 0)
    );
  }

  // Group person salaries
  for (const person of people || []) {
    const month = new Date(person.created_at).toISOString().slice(0, 7);
    monthlyTotals.set(
      month,
      (monthlyTotals.get(month) || 0) + (person.salary || 0)
    );
  }

  const monthsWithData = monthlyTotals.size;
  if (monthsWithData === 0) return 0;

  const total = Array.from(monthlyTotals.values()).reduce(
    (acc, val) => acc + val,
    0
  );
  return Math.round(total / monthsWithData);
}

// export async function getCurrentMonthExpense() {
//   const supabase = await createClient();

//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) return 0;

//   const start = startOfMonth(new Date()).toISOString();
//   const end = endOfMonth(new Date()).toISOString();

//   const { data, error } = await supabase
//     .from("expenses")
//     .select("amount")
//     .gte("date", start)
//     .lte("date", end)
//     .eq("user_id", user.id);

//   if (error || !data) {
//     console.error("Error fetching current month expenses:", error);
//     return 0;
//   }

//   const total = data.reduce((sum, row) => sum + row.amount, 0);
//   return Math.round(total);
// }

export async function getCurrentMonthExpense() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return 0;

  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();

  // 1. Fetch normal expenses
  const { data: expenses, error: expenseError } = await supabase
    .from("expenses")
    .select("amount")
    .gte("date", start)
    .lte("date", end)
    .eq("user_id", user.id);

  if (expenseError) {
    console.error("Error fetching expenses:", expenseError);
    return 0;
  }

  const normalTotal =
    expenses?.reduce((sum, row) => sum + (row.amount || 0), 0) || 0;

  // 2. Fetch Household Help (person table)
  const { data: people, error: personError } = await supabase
    .from("person")
    .select("salary, created_at")
    .eq("user_id", user.id)
    .gte("created_at", start)
    .lte("created_at", end);

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

//   const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5)).toISOString();

//   const { data, error } = await supabase
//     .from("expenses")
//     .select("amount, date")
//     .gte("date", sixMonthsAgo)
//     .eq("user_id", user.id);

//   if (error || !data) return [];

//   // Group by month
//   const grouped = new Map<string, number>();

//   for (const exp of data) {
//     const date = new Date(exp.date);
//     const label = date.toLocaleString("en-US", { month: "short" }); // Jan, Feb...
//     grouped.set(label, (grouped.get(label) || 0) + exp.amount);
//   }

//   return Array.from(grouped.entries()).map(([label, value]) => ({
//     label,
//     value,
//   }));
// }

export async function getLastSixMonthsExpenses() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return [];

  const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5)).toISOString();

  // 1. Fetch normal expenses
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .select("amount, date")
    .gte("date", sixMonthsAgo)
    .eq("user_id", user.id);

  if (expenseError) {
    console.error("Expense error", expenseError);
    return [];
  }

  // 2. Fetch people (household help) data
  const { data: peopleData, error: peopleError } = await supabase
    .from("person")
    .select("salary, created_at");

  if (peopleError) {
    console.error("People error", peopleError);
    return [];
  }

  // 3. Combine both and group by month
  const grouped = new Map<string, number>();

  for (const exp of expenseData || []) {
    const date = new Date(exp.date);
    const label = date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    }); // e.g. Jul 2025
    grouped.set(label, (grouped.get(label) || 0) + exp.amount);
  }

  for (const person of peopleData || []) {
    const date = new Date(person.created_at);
    const label = date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
    grouped.set(label, (grouped.get(label) || 0) + person.salary);
  }

  return Array.from(grouped.entries())
    .sort((a, b) => Date.parse(`01 ${a[0]}`) - Date.parse(`01 ${b[0]}`)) // optional: sort months
    .map(([label, value]) => ({ label, value }));
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

// export async function getMonthlyExpenseByCategory() {
//   const supabase = await createClient();

//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) {
//     console.error("User not found");
//     return [];
//   }

//   const start = startOfMonth(new Date()).toISOString();
//   const end = endOfMonth(new Date()).toISOString();

//   const { data, error } = await supabase
//     .from("expenses")
//     .select(
//       `
//       amount,
//       subcategories (
//         id,
//         categories (
//           name
//         )
//       )
//     `
//     )
//     .eq("user_id", user.id)
//     .gte("date", start)
//     .lte("date", end)
//     .gt("amount", 0);

//   if (error || !data) {
//     console.error("Error fetching expenses:", error);
//     return [];
//   }

//   const categoryTotals = new Map<string, number>();

//   for (const exp of data) {
//     const subcategories = Array.isArray(exp.subcategories)
//       ? exp.subcategories
//       : [exp.subcategories];

//     for (const subcat of subcategories) {
//       const categories = Array.isArray(subcat?.categories)
//         ? subcat.categories
//         : [subcat.categories];

//       for (const cat of categories) {
//         const categoryName = cat?.name;
//         if (!categoryName || typeof exp.amount !== "number") continue;

//         categoryTotals.set(
//           categoryName,
//           (categoryTotals.get(categoryName) || 0) + exp.amount
//         );
//       }
//     }
//   }

//   return Array.from(categoryTotals.entries()).map(([category, amount]) => ({
//     category,
//     amount,
//   }));
// }

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

  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();

  // 1. Fetch regular expenses
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .select(
      `
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
    .gte("date", start)
    .lte("date", end)
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
  const { data: personData, error: personError } = await supabase.from("person")
    .select(`
      salary,
      subcategories (
        categories (
          name
        )
      )
    `);

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

// export async function getMonthlySubcategoriesGroupedByCategory() {
//   const supabase = await createClient();

//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) {
//     console.error("User not found");
//     return {};
//   }

//   const start = startOfMonth(new Date()).toISOString();
//   const end = endOfMonth(new Date()).toISOString();

//   const { data, error } = await supabase
//     .from("expenses")
//     .select(
//       `
//       amount,
//       subcategories (
//         name,
//         categories (
//           name
//         )
//       )
//     `
//     )
//     .eq("user_id", user.id)
//     .gte("date", start)
//     .lte("date", end)
//     .gt("amount", 0);

//   if (error || !data) {
//     console.error("Error fetching subcategories:", error);
//     return {};
//   }

//   const map: Record<string, { subcategory: string; amount: number }[]> = {};

//   for (const exp of data) {
//     const subcats = Array.isArray(exp.subcategories)
//       ? exp.subcategories
//       : [exp.subcategories];

//     for (const subcat of subcats) {
//       const subcatName = subcat?.name;

//       const categories = Array.isArray(subcat?.categories)
//         ? subcat.categories
//         : [subcat.categories];

//       const catName = categories?.[0]?.name;

//       if (!subcatName || !catName || typeof exp.amount !== "number") continue;

//       if (!map[catName]) {
//         map[catName] = [];
//       }

//       const existing = map[catName].find((s) => s.subcategory === subcatName);
//       if (existing) {
//         existing.amount += exp.amount;
//       } else {
//         map[catName].push({ subcategory: subcatName, amount: exp.amount });
//       }
//     }
//   }

//   return map;
// }

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

  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();

  const { data, error } = await supabase
    .from("expenses")
    .select(
      `
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
    .gte("date", start)
    .lte("date", end)
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
    .gte("created_at", start)
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

// export async function getHouseHelpRolesForCurrentUser() {
//   const supabase = await createClient();

//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) return [];

//   const start = startOfMonth(new Date()).toISOString();
//   const end = endOfMonth(new Date()).toISOString();

//   const { data, error } = await supabase
//     .from("expenses")
//     .select(
//       `
//       subcategories (
//         id,
//         name,
//         categories (
//           name
//         )
//       )
//     `
//     )
//     .eq("user_id", user.id)
//     .gte("date", start)
//     .lte("date", end)
//     .gt("amount", 0);

//   if (error || !data) {
//     console.error("Error fetching house help roles:", error);
//     return [];
//   }

//   const seen = new Set();
//   const roles: { id: string; name: string }[] = [];

//   for (const exp of data) {
//     const subcat = Array.isArray(exp.subcategories)
//       ? exp.subcategories[0]
//       : exp.subcategories;

//     const cat = Array.isArray(subcat?.categories)
//       ? subcat.categories[0]
//       : subcat?.categories;

//     if (cat?.name !== "Household Help") continue;

//     if (!seen.has(subcat.id)) {
//       seen.add(subcat.id);
//       roles.push({ id: subcat.id, name: subcat.name });
//     }
//   }

//   return roles;
// }

export async function getHouseHelpRolesForCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return [];

  const { data, error } = await supabase
    .from("person")
    .select(
      `
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

// export async function checkAndInsertAlerts() {
//   const supabase = await createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) return;

//   const userId = user.id;

//   const now = new Date();
//   const thisMonthStart = startOfMonth(now).toISOString();
//   const thisMonthEnd = endOfMonth(now).toISOString();

//   const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString();
//   const lastMonthEnd = endOfMonth(subMonths(now, 1)).toISOString();

//   // 🔸 Expenses
//   const { data: currentMonth } = await supabase
//     .from("expenses")
//     .select("amount")
//     .eq("user_id", userId)
//     .gte("date", thisMonthStart)
//     .lte("date", thisMonthEnd);

//   const { data: lastMonth } = await supabase
//     .from("expenses")
//     .select("amount")
//     .eq("user_id", userId)
//     .gte("date", lastMonthStart)
//     .lte("date", lastMonthEnd);

//   const totalCurrent = currentMonth?.reduce((sum, e) => sum + e.amount, 0) || 0;
//   const totalLast = lastMonth?.reduce((sum, e) => sum + e.amount, 0) || 0;

//   const alertsToInsert: string[] = [];

//   if (totalLast > 0 && totalCurrent > totalLast * 1.15) {
//     alertsToInsert.push(
//       " Your expenses this month are over 15% higher than last month."
//     );
//   }

//   // 🔸 Absences
//   const { data: absences } = await supabase
//     .from("absences")
//     .select("person_id, date")
//     .eq("user_id", userId)
//     .gte("date", thisMonthStart)
//     .lte("date", thisMonthEnd);

//   const absencesCount: Record<string, number> = {};
//   absences?.forEach((a) => {
//     absencesCount[a.person_id] = (absencesCount[a.person_id] || 0) + 1;
//   });

//   const { data: persons } = await supabase
//     .from("person")
//     .select("id, name")
//     .eq("user_id", userId);

//   persons?.forEach((p) => {
//     if (absencesCount[p.id] > 2) {
//       alertsToInsert.push(
//         ` ${p.name} has been absent more than 2 days this month.`
//       );
//     }
//   });

//   for (const msg of alertsToInsert) {
//     const { count } = await supabase
//       .from("alerts")
//       .select("*", { count: "exact", head: true })
//       .eq("user_id", userId)
//       .eq("message", msg);

//     if (count === 0) {
//       await supabase.from("alerts").insert({
//         user_id: userId,
//         message: msg,
//         dismissed: false,
//       });
//     }
//   }
// }

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

  const totalCurrent = currentMonth?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const totalLast = lastMonth?.reduce((sum, e) => sum + e.amount, 0) || 0;

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
    .select("id, name")
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
