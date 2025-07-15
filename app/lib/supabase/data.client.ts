// lib/supabase/expenseClient.ts (or wherever you prefer)

import { supabase } from "./client";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

// export async function createExpenseClient({
//   subcategory_id,
//   amount,
//   date,
// }: {
//   subcategory_id: string;
//   amount: number;
//   date: string;
// }) {
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) throw new Error("User not found");

//   const { error } = await supabase.from("expenses").insert({
//     user_id: user.id,
//     subcategory_id,
//     amount,
//     date,
//   });

//   if (error) {
//     console.error("Error creating expense:", error);
//     throw error;
//   }
// }
export async function createExpenseClient({
  subcategory_id,
  amount,
  date,
}: {
  subcategory_id: string;
  amount: number;
  date: string;
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("User not found");

  // ✅ Step 1: Create the expense and get the ID
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      subcategory_id,
      amount,
      date,
    })
    .select("id") // fetch the inserted ID
    .single();

  if (expenseError || !expenseData) {
    console.error("Error creating expense:", expenseError);
    throw expenseError;
  }

  // ✅ Step 2: Check if subcategory belongs to Utilities
  const { data: subcategoryData, error: subcategoryError } = await supabase
    .from("subcategories")
    .select("id, category_id")
    .eq("id", subcategory_id)
    .single();

  if (subcategoryError || !subcategoryData) {
    console.error("Error fetching subcategory:", subcategoryError);
    return;
  }

  const { data: categoryData, error: categoryError } = await supabase
    .from("categories")
    .select("name")
    .eq("id", subcategoryData.category_id)
    .single();

  if (categoryError || !categoryData) {
    console.error("Error fetching category:", categoryError);
    return;
  }

  // ✅ Step 3: If it's a Utility, create overdue_payment with expense_id
  if (categoryData.name === "Utilities") {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const { error: overdueError } = await supabase
      .from("overdue_payments")
      .insert({
        user_id: user.id,
        subcategory_id,
        amount,
        month,
        year,
        paid: false,
        expense_id: expenseData.id, // ✅ Link it here
      });

    if (overdueError) {
      console.error("Error adding overdue payment:", overdueError);
    }
  }
}

// export async function deleteExpense(expenseId: string) {
//   const { error } = await supabase
//     .from("expenses")
//     .delete()
//     .eq("id", expenseId);

//   if (error) throw error;
// }

export async function deleteExpense(expenseId: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw userError;

  console.log("Authenticated user ID:", user.id);

  // 1. Get the expense details first
  const { data: expense, error: fetchError } = await supabase
    .from("expenses")
    .select("subcategory_id")
    .eq("id", expenseId)
    .single();

  if (fetchError || !expense) {
    console.error("Error fetching expense:", fetchError);
    throw fetchError;
  }

  console.log("Fetched expense:", expense);

  // 2. Get the subcategory to check if it belongs to Utilities
  const { data: subcategory, error: subError } = await supabase
    .from("subcategories")
    .select("category_id")
    .eq("id", expense.subcategory_id)
    .single();

  if (subError || !subcategory) {
    console.error("Error fetching subcategory:", subError);
    throw subError;
  }

  console.log("Fetched subcategory:", subcategory);

  const { data: category, error: catError } = await supabase
    .from("categories")
    .select("name")
    .eq("id", subcategory.category_id)
    .single();

  if (catError || !category) {
    console.error("Error fetching category:", catError);
    throw catError;
  }

  console.log("Fetched category:", category);

  // 3. Delete the expense
  const { error: deleteError } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (deleteError) {
    console.error("Error deleting expense:", deleteError);
    throw deleteError;
  }

  console.log("Deleted expense:", expenseId);

  // 4. If it's under "Utilities", delete unpaid overdue rows
  if (category.name.toLowerCase().trim() === "utilities") {
    console.log(
      "Expense belongs to Utilities. Attempting to delete overdue payments for subcategory:",
      expense.subcategory_id
    );

    const { data: deletedRows, error: overdueError } = await supabase
      .from("overdue_payments")
      .delete()
      .eq("user_id", user.id)
      .eq("subcategory_id", expense.subcategory_id)
      .eq("paid", false)
      .select();

    if (overdueError) {
      console.error("Failed to delete overdue payments:", overdueError);
    } else {
      console.log("Deleted overdue payment rows:", deletedRows);
    }
  } else {
    console.log("Expense is not under 'Utilities', no overdue rows deleted.");
  }
}

export async function updateExpenseClient(id: string, newAmount: number) {
  const { error } = await supabase
    .from("expenses")
    .update({ amount: newAmount })
    .eq("id", id);

  if (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
}

export async function getMonthlyExpenseBySubcategoryClient(
  subcategory_id: string
) {
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
    console.error("Error fetching monthly expense:", error);
    return null;
  }

  return data;
}

export async function getUserExpensesGrouped() {
  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();

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

  const { data, error } = await supabase
    .from("expenses")
    .select(
      `
      amount,
      subcategories (
        id,
        category_id,
        categories (
          id,
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
    console.error("Error fetching expenses for category grouping:", error);
    return [];
  }

  const categoryTotals = new Map<string, number>();

  for (const exp of data) {
    // Always treat subcategories as array
    const subcat = Array.isArray(exp.subcategories)
      ? exp.subcategories[0]
      : exp.subcategories;
    // Always treat categories as array
    const categoryName =
      subcat?.categories && Array.isArray(subcat.categories)
        ? subcat.categories[0]?.name
        : undefined;
    if (!categoryName) continue;
    categoryTotals.set(
      categoryName,
      (categoryTotals.get(categoryName) || 0) + exp.amount
    );
  }

  return Array.from(categoryTotals.entries()).map(([label, value]) => ({
    label,
    value,
  }));
}

export async function getCategories() {
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

// export async function getMonthlyExpenseByCategoryClient() {
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
//       amount,
//       subcategories (
//         id,
//         category_id,
//         categories (
//           id,
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
//     console.error("Error in category query", error);
//     return [];
//   }

//   const categoryTotals = new Map<string, number>();

//   for (const exp of data) {
//     const subcat = Array.isArray(exp.subcategories)
//       ? exp.subcategories[0]
//       : exp.subcategories;

//     const category = Array.isArray(subcat?.categories)
//       ? subcat.categories[0]
//       : subcat?.categories;

//     const name = category?.name;

//     if (!name) continue;

//     categoryTotals.set(name, (categoryTotals.get(name) || 0) + exp.amount);
//   }

//   return Array.from(categoryTotals.entries()).map(([category, amount]) => ({
//     category,
//     amount,
//   }));
// }

export async function getMonthlyExpenseByCategoryClient() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return [];

  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();

  const categoryTotals = new Map<string, number>();

  // 1. Fetch regular expenses from 'expenses' table
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .select(
      `
      amount,
      subcategories (
        id,
        category_id,
        categories (
          id,
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
  } else {
    for (const exp of expenseData) {
      const subcat = Array.isArray(exp.subcategories)
        ? exp.subcategories[0]
        : exp.subcategories;

      const category = Array.isArray(subcat?.categories)
        ? subcat.categories[0]
        : subcat?.categories;

      const name = category?.name;
      if (!name) continue;

      categoryTotals.set(name, (categoryTotals.get(name) || 0) + exp.amount);
    }
  }

  // 2. Fetch 'Household Help' total from 'person' table
  const { data: personData, error: personError } = await supabase
    .from("person")
    .select("salary, created_at")
    .eq("user_id", user.id);

  if (personError) {
    console.error("Error fetching person data:", personError);
  } else if (personData?.length) {
    const thisMonthTotal = personData
      .filter((p) => {
        const created = new Date(p.created_at);
        return created >= new Date(start) && created <= new Date(end);
      })
      .reduce((sum, p) => sum + (p.salary || 0), 0);

    categoryTotals.set(
      "Household Help",
      (categoryTotals.get("Household Help") || 0) + thisMonthTotal
    );
  }

  return Array.from(categoryTotals.entries()).map(([category, amount]) => ({
    category,
    amount,
  }));
}

// export async function getMonthlySubcategoriesGroupedByCategoryClient() {
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) return {};

//   const start = startOfMonth(new Date()).toISOString();
//   const end = endOfMonth(new Date()).toISOString();

//   const { data, error } = await supabase
//     .from("expenses")
//     .select(
//       `id,
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
//     console.error("Error in subcategory query", error);
//     return {};
//   }

//   const grouped: Record<
//     string,
//     { id: string; subcategory: string; amount: number }[]
//   > = {};

//   for (const exp of data) {
//     const sub = Array.isArray(exp.subcategories)
//       ? exp.subcategories[0]
//       : exp.subcategories;

//     const cat = Array.isArray(sub?.categories)
//       ? sub.categories[0]
//       : sub?.categories;

//     const catName = cat?.name;
//     const subName = sub?.name;

//     if (!catName || !subName) continue;

//     if (!grouped[catName]) grouped[catName] = [];

//     const existing = grouped[catName].find((x) => x.subcategory === subName);
//     if (existing) {
//       existing.amount += exp.amount;
//     } else {
//       grouped[catName].push({
//         id: exp.id,
//         subcategory: subName,
//         amount: exp.amount,
//       });
//     }
//   }

//   return grouped;
// }

type GroupedResult = Record<
  string,
  { id: string; subcategory: string; amount: number }[]
>;

export async function getMonthlySubcategoriesGroupedByCategoryClient(): Promise<GroupedResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return {};

  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();

  const grouped: GroupedResult = {};

  // ---------- 1. EXPENSE TABLE ----------
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .select(
      `
      id,
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

  if (expenseError) {
    console.error("Error in expenses query", expenseError);
  }

  if (expenseData) {
    for (const exp of expenseData) {
      const sub = Array.isArray(exp.subcategories)
        ? exp.subcategories[0]
        : exp.subcategories;

      const cat = Array.isArray(sub?.categories)
        ? sub.categories[0]
        : sub?.categories;

      const catName = cat?.name;
      const subName = sub?.name;

      if (!catName || !subName) continue;

      if (!grouped[catName]) grouped[catName] = [];

      const existing = grouped[catName].find((x) => x.subcategory === subName);
      if (existing) {
        existing.amount += exp.amount;
      } else {
        grouped[catName].push({
          id: exp.id,
          subcategory: subName,
          amount: exp.amount,
        });
      }
    }
  }

  // ---------- 2. PERSON TABLE ----------
  const { data: people, error: peopleError } = await supabase
    .from("person")
    .select("id, name, salary, created_at, subcategories:subcategory_id(name)")
    .eq("user_id", user.id);

  if (peopleError) {
    console.error("Error fetching from person table", peopleError);
  }

  if (people) {
    for (const person of people) {
      const created = new Date(person.created_at);
      if (created < new Date(start) || created > new Date(end)) continue;

      const catName = "Household Help";
      const subName = Array.isArray(person.subcategories)
        ? person.subcategories[0]?.name || "Unknown"
        : (person.subcategories as { name?: string })?.name || "Unknown";

      if (!grouped[catName]) grouped[catName] = [];

      const existing = grouped[catName].find((x) => x.subcategory === subName);

      if (existing) {
        existing.amount += person.salary || 0;
      } else {
        grouped[catName].push({
          id: person.id,
          subcategory: subName,
          amount: person.salary || 0,
        });
      }
    }
  }

  return grouped;
}

export async function getMonthlyPersonExpensesGrouped(): Promise<
  { category: string; subcategory: string; amount: number; id: string }[]
> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return [];

  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();

  const { data: people, error: peopleError } = await supabase
    .from("person")
    .select("id, name, salary, created_at, subcategories:subcategory_id(name)")
    .eq("user_id", user.id);

  if (peopleError) {
    console.error("Error fetching from person table", peopleError);
    return [];
  }

  const result: {
    category: string;
    subcategory: string;
    amount: number;
    id: string;
  }[] = [];

  for (const person of people || []) {
    const created = new Date(person.created_at);
    if (created < new Date(start) || created > new Date(end)) continue;

    const roleName = Array.isArray(person.subcategories)
      ? person.subcategories[0]?.name || "Unknown"
      : (person.subcategories as { name?: string })?.name || "Unknown";

    const label = `${roleName} - ${person.name}`; // 👈 Unique label

    result.push({
      id: person.id,
      category: "Household Help",
      subcategory: label,
      amount: person.salary || 0,
    });
  }

  return result;
}

// export async function getMonthlyPersonExpensesGrouped(): Promise<
//   { category: string; subcategory: string; amount: number; id: string }[]
// > {
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) return [];

//   const start = startOfMonth(new Date()).toISOString();
//   const end = endOfMonth(new Date()).toISOString();

//   const { data: people, error: peopleError } = await supabase
//     .from("person")
//     .select("id, name, salary, created_at, subcategories:subcategory_id(name)")
//     .eq("user_id", user.id);

//   if (peopleError) {
//     console.error("Error fetching from person table", peopleError);
//     return [];
//   }

//   const result: {
//     category: string;
//     subcategory: string;
//     amount: number;
//     id: string;
//   }[] = [];

//   for (const person of people || []) {
//     const created = new Date(person.created_at);
//     if (created < new Date(start) || created > new Date(end)) continue;

//     const roleName = Array.isArray(person.subcategories)
//       ? person.subcategories[0]?.name || "Unknown"
//       : (person.subcategories as { name?: string })?.name || "Unknown";

//     const label = `${roleName} - ${person.name}`;

//     result.push({
//       id: person.id,
//       category: "Household Help",
//       subcategory: label,
//       amount: person.salary || 0,
//     });
//   }

//   return result;
// }

// export async function getHouseHelpSalary(
//   subcategory_id: string
// ): Promise<number> {
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
//     .eq("user_id", user.id)
//     .eq("subcategory_id", subcategory_id)
//     .gte("date", start)
//     .lte("date", end)
//     .limit(1)
//     .maybeSingle();

//   if (error || !data) return 0;
//   return data.amount;
// }

export async function getHouseHelpSalary(person_id: string): Promise<number> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return 0;

  const { data, error } = await supabase
    .from("person")
    .select("salary")
    .eq("id", person_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return 0;
  return data.salary;
}

// export async function getAbsencesCount(
//   subcategory_id: string
// ): Promise<number> {
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) return 0;

//   const start = startOfMonth(new Date()).toISOString();
//   const end = endOfMonth(new Date()).toISOString();

//   const { count } = await supabase
//     .from("absences")
//     .select("*", { count: "exact", head: true })
//     .eq("user_id", user.id)
//     .eq("subcategory_id", subcategory_id)
//     .gte("date", start)
//     .lte("date", end);

//   return count || 0;
// }

export async function getAbsencesCount(person_id: string): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();

  const { count, error } = await supabase
    .from("absences")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("person_id", person_id)
    .gte("date", start)
    .lte("date", end);

  if (error) {
    console.error("Error fetching absence count:", error);
    return 0;
  }

  return count || 0;
}

// export async function getDeductableAbsencesCount(
//   subcategory_id: string
// ): Promise<number> {
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) return 0;

//   const start = startOfMonth(new Date()).toISOString();
//   const end = endOfMonth(new Date()).toISOString();

//   const { count } = await supabase
//     .from("absences")
//     .select("*", { count: "exact", head: true })
//     .eq("user_id", user.id)
//     .eq("deduct", true)
//     .eq("subcategory_id", subcategory_id)
//     .gte("date", start)
//     .lte("date", end);

//   return count || 0;
// }

export async function getDeductableAbsencesCount(
  person_id: string
): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const start = startOfMonth(new Date()).toISOString();
  const end = endOfMonth(new Date()).toISOString();

  const { count, error } = await supabase
    .from("absences")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("person_id", person_id)
    .eq("deduct", true)
    .gte("date", start)
    .lte("date", end);

  if (error) {
    console.error("Error fetching deductable absences:", error);
    return 0;
  }

  return count || 0;
}

// export async function addAbsence(
//   subcategoryId: string,
//   date: Date,
//   deduct: boolean
// ) {
//   const {
//     data: { user },
//     error,
//   } = await supabase.auth.getUser();

//   if (!user || error) {
//     throw new Error("User not authenticated");
//   }

//   return supabase.from("absences").insert({
//     user_id: user.id,
//     subcategory_id: subcategoryId,
//     date: date.toLocaleDateString("en-CA"),
//     deduct,
//   });
// }

export async function addAbsence(
  personId: string,
  date: Date,
  deduct: boolean
) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    throw new Error("User not authenticated");
  }

  return supabase.from("absences").insert({
    user_id: user.id,
    person_id: personId,
    date: date.toLocaleDateString("en-CA"), // 'YYYY-MM-DD'
    deduct,
  });
}

export async function updateAbsenceClient(
  id: string,
  newDate: string,
  newNote?: string
) {
  const { error } = await supabase
    .from("absences")
    .update({ date: newDate, note: newNote || null })
    .eq("id", id);

  if (error) throw error;
}

// export async function removeAbsence(subcategoryId: string, date: Date) {
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     throw new Error("User not authenticated");
//   }

//   return supabase
//     .from("absences")
//     .delete()
//     .eq("user_id", user.id)
//     .eq("subcategory_id", subcategoryId)
//     .eq("date", date.toLocaleDateString("en-CA"));
// }

export async function removeAbsence(personId: string, date: Date) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  return supabase
    .from("absences")
    .delete()
    .eq("user_id", user.id)
    .eq("person_id", personId)
    .eq("date", date.toLocaleDateString("en-CA")); // format: YYYY-MM-DD
}

// export async function getAbsencesForMonth(
//   subcategoryId: string
// ): Promise<Date[]> {
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) return [];

//   const start = new Date(
//     new Date().getFullYear(),
//     new Date().getMonth(),
//     1
//   ).toISOString();
//   const end = new Date(
//     new Date().getFullYear(),
//     new Date().getMonth() + 1,
//     0
//   ).toISOString();

//   const { data, error } = await supabase
//     .from("absences")
//     .select("date")
//     .eq("user_id", user.id)
//     .eq("subcategory_id", subcategoryId)
//     .gte("date", start)
//     .lte("date", end);

//   if (!data) return [];
//   return data.map((d) => new Date(d.date));
// }

export async function getAbsencesForMonth(personId: string): Promise<Date[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const start = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString();

  const end = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).toISOString();

  const { data, error } = await supabase
    .from("absences")
    .select("date")
    .eq("user_id", user.id)
    .eq("person_id", personId)
    .gte("date", start)
    .lte("date", end);

  if (error) {
    console.error("Error fetching absences:", error);
    return [];
  }

  return data.map((d) => new Date(d.date));
}

// Testing ********************************************************************************************

export async function getPeopleBySubcategoryClient(subcategory_id: string) {
  const { data, error } = await supabase
    .from("person")
    .select("id, name, salary")
    .eq("subcategory_id", subcategory_id)
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

  if (error) {
    console.error("Error fetching people:", error);
    return [];
  }

  return data; // array of { id, name, salary }
}

interface CreatePersonInput {
  name: string;
  subcategory_id: string;
  salary: number;
}

// export async function createPersonClient({
//   name,
//   subcategory_id,
//   salary,
// }: CreatePersonInput) {
//   const { data: userData, error: userError } = await supabase.auth.getUser();
//   if (userError || !userData?.user?.id) {
//     console.error("User not authenticated", userError);
//     return null;
//   }

//   const { data, error } = await supabase
//     .from("person")
//     .insert([
//       {
//         user_id: userData.user.id,
//         subcategory_id,
//         name,
//         salary,
//       },
//     ])
//     .select()
//     .single(); // Return the created row

//   if (error) {
//     console.error("Error creating person:", error);
//     return null;
//   }

//   return data;
// }

export async function createPersonClient({
  name,
  subcategory_id,
  salary,
}: CreatePersonInput) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) {
    console.error("User not authenticated", userError);
    return null;
  }

  const { data: person, error } = await supabase
    .from("person")
    .insert([
      {
        user_id: userData.user.id,
        subcategory_id,
        name,
        salary,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating person:", error);
    return null;
  }

  // Add overdue payment for current month

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const { error: overdueError } = await supabase
    .from("overdue_payments")
    .insert([
      {
        user_id: userData.user.id,
        subcategory_id,
        person_id: person.id,
        amount: salary,
        month: currentMonth,
        year: currentYear,
        paid: false,
      },
    ]);

  if (overdueError) {
    console.error("Error adding overdue payment:", {
      message: overdueError.message,
      details: overdueError.details,
      hint: overdueError.hint,
      code: overdueError.code,
    });
  }

  return person;
}

// export async function deletePersonById(id: string): Promise<void> {
//   const { error } = await supabase.from("person").delete().eq("id", id);

//   if (error) {
//     throw new Error(`Failed to delete person: ${error.message}`);
//   }
// }
export async function deletePersonById(id: string): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw userError;

  // Optional: Fetch for logging or UI purposes
  const { data: person, error: fetchError } = await supabase
    .from("person")
    .select("subcategory_id")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Failed to fetch person before deletion:", fetchError);
    throw fetchError;
  }

  // ✅ Just delete the person; related overdue_payments will auto-delete
  const { error: deleteError } = await supabase
    .from("person")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Failed to delete person:", deleteError);
    throw deleteError;
  }
}

export async function getPersonById(id: string) {
  const { data, error } = await supabase
    .from("person")
    .select("id, name, salary, subcategory_id")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching person by ID:", error);
    return null;
  }

  return data;
}

export async function updatePersonSalary(id: string, salary: number) {
  const { error } = await supabase
    .from("person")
    .update({ salary })
    .eq("id", id);

  if (error) {
    console.error("Error updating person salary:", error);
    throw new Error("Failed to update salary");
  }
}

type MonthlyCount = { month: string; count: number };

type AbsenceResult = {
  person: string;
  monthlyCounts: MonthlyCount[];
};

const SUBCATEGORY_LOOKUP: Record<string, string> = {
  "uuid-for-driver-subcategory": "Driver",
  "uuid-for-maid-subcategory": "Maid",
  // Add more as needed
};

export async function getAbsencesPerPersonPerMonth(subcategoryName: string) {
  // ✅ Get current user ID
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not found", userError);
    return null;
  }

  const userId = user.id;

  // ✅ Get subcategory ID by name (global/shared, no user_id filtering)
  const { data: subcategories, error: subcatError } = await supabase
    .from("subcategories")
    .select("id")
    .eq("name", subcategoryName);

  if (subcatError || !subcategories || subcategories.length === 0) {
    console.error("Subcategory not found or error", subcatError);
    return null;
  }

  const subcategoryId = subcategories[0].id;

  // ✅ Get all persons in that subcategory for this user
  const { data: persons, error: personsError } = await supabase
    .from("person")
    .select("id, name")
    .eq("subcategory_id", subcategoryId)
    .eq("user_id", userId);

  if (personsError || !persons || persons.length === 0) {
    console.error("No persons found for subcategory", personsError);
    return null;
  }

  const personIds = persons.map((p) => p.id);

  // ✅ Get all absences for these persons in the last 6 months
  const fromDate = new Date();
  fromDate.setMonth(fromDate.getMonth() - 5);
  fromDate.setDate(1);

  const { data: absences, error: absencesError } = await supabase
    .from("absences")
    .select("date, person_id")
    .in("person_id", personIds)
    .gte("date", fromDate.toISOString().split("T")[0])
    .eq("user_id", userId);

  if (absencesError || !absences) {
    console.error("Error fetching absences", absencesError);
    return null;
  }

  // ✅ Group by person and month
  const result: Record<
    string,
    {
      name: string;
      monthly: Record<string, number>;
    }
  > = {};

  for (const person of persons) {
    result[person.id] = {
      name: person.name,
      monthly: {},
    };
  }

  for (const absence of absences) {
    const month = absence.date.slice(0, 7); // "2025-07"
    if (result[absence.person_id]) {
      result[absence.person_id].monthly[month] =
        (result[absence.person_id].monthly[month] || 0) + 1;
    }
  }
  console.log("Absences grouped by person and month:", result);
  return result;
}

export async function getAlertsClient() {
  const { data } = await supabase
    .from("alerts")
    .select("id, message")
    .eq("dismissed", false)
    .order("created_at", { ascending: false });
  return data;
}

export async function dismissAlertClient(id: string) {
  await supabase.from("alerts").update({ dismissed: true }).eq("id", id);
}

export async function getAverageMonthlyExpenseClient() {
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

export async function getAdvancesForPerson(personId: string) {
  const { data, error } = await supabase
    .from("advances")
    .select("id, amount, note, date")
    .eq("person_id", personId);

  if (error) throw error;
  return data;
}

export async function deleteAdvanceById(id: string) {
  const { error } = await supabase.from("advances").delete().eq("id", id);
  if (error) throw error;
}

export async function addAdvanceForPerson(
  personId: string,
  amount: number,
  note: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser(); // Get current user ID

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase.from("advances").insert([
    {
      person_id: personId,
      amount,
      note,
      user_id: user.id,
      date: new Date(),
    },
  ]);

  if (error) {
    console.error("Error adding advance:", error.message);
    throw error;
  }

  return data;
}

export async function updateAdvanceById(
  id: string,
  amount: number,
  note: string
) {
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser(); // Get current user ID

  // if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("advances")
    .update({ amount, note })
    .eq("id", id);

  if (error) {
    console.error("Error updating advance:", error.message);
    throw error;
  }
}

// getAvailableYearsClient.ts
export async function getAvailableYearsClient(userId: string) {
  const { data, error } = await supabase
    .from("expenses")
    .select("date")
    .eq("user_id", userId);

  if (error) throw error;

  const years = Array.from(
    new Set(data.map((d) => new Date(d.date).getFullYear()))
  ).sort();
  return years;
}

// getExpensesByYearClient.ts
export async function getExpensesByYearClient(userId: string, year: number) {
  const { data, error } = await supabase
    .from("expenses")
    .select("amount, date")
    .eq("user_id", userId);

  if (error) throw error;

  const monthly = new Array(12).fill(0);
  for (const expense of data) {
    const d = new Date(expense.date);
    if (d.getFullYear() === year) {
      monthly[d.getMonth()] += expense.amount;
    }
  }

  return monthly.map((value, index) => ({
    label: new Date(0, index).toLocaleString("en-US", { month: "short" }),
    value,
  }));
}

export async function getExpenseCategoryForMonthYear(
  month: number,
  year: number
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not found");
    return [];
  }

  const start = startOfMonth(new Date(year, month - 1)).toISOString();
  const end = endOfMonth(new Date(year, month - 1)).toISOString();

  // Regular expenses
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

  // Household Help Salaries
  const { data: personData, error: personError } = await supabase
    .from("person")
    .select(
      `
      salary,
      subcategories (
        categories (
          name
        )
      )
    `
    )
    .eq("user_id", user.id);

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

export async function getSubcategoryBreakdownForMonthYear(
  month: number,
  year: number
): Promise<Record<string, { subcategory: string; amount: number }[]>> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not found");
    return {};
  }

  const start = startOfMonth(new Date(year, month - 1)).toISOString();
  const end = endOfMonth(new Date(year, month - 1)).toISOString();

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

  // 🔹 Group regular expenses
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

      if (!map[catName]) map[catName] = [];

      const existing = map[catName].find((s) => s.subcategory === subcatName);
      if (existing) {
        existing.amount += exp.amount;
      } else {
        map[catName].push({ subcategory: subcatName, amount: exp.amount });
      }
    }
  }

  // 🔹 Include salaries from `person` table (for "Household Help")
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
    console.error("Error fetching household help:", personError);
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

      if (!map[catName]) map[catName] = [];

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

export async function getTotalOverdueAmount() {
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

export async function getOverdueAmountByRange(
  minDays: number,
  maxDays: number
) {
  const now = new Date();
  const { data, error } = await supabase
    .from("overdue_payments")
    .select("amount, month, year")
    .eq("paid", false);

  if (error || !data) {
    console.error("Error fetching overdue range:", error);
    return 0;
  }

  const filtered = data.filter((row) => {
    const dueDate = new Date(row.year, row.month - 1); // JS months = 0-indexed
    const daysOverdue = Math.floor(
      (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysOverdue >= minDays && daysOverdue < maxDays;
  });

  return filtered.reduce((sum, row) => sum + Number(row.amount), 0);
}

type OverdueItem = {
  id: string;
  month: number;
  year: number;
  amount: number;
  paid: boolean;
};

type OverdueGrouped = {
  groupLabel: string; // "Arya - Driver" or "Electricity"
  items: OverdueItem[];
};

export async function getGroupedOverduePayments(): Promise<OverdueGrouped[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw userError;

  const { data, error } = await supabase
    .from("overdue_payments")
    .select(
      `
        id,
        month,
        year,
        amount,
        paid,
        person (
          name
        ),
        subcategories (
          name
        )
      `
    )
    .eq("user_id", user.id)
    .eq("paid", false);

  if (error) throw error;

  const grouped: Record<string, OverdueItem[]> = {};

  for (const row of data) {
    // Handle both array and object for person and subcategories
    const personName = Array.isArray(row.person)
      ? row.person[0]?.name
      : row.person && typeof row.person === "object" && "name" in row.person
      ? (row.person as { name?: string }).name
      : undefined;
    const subcategoryName = Array.isArray(row.subcategories)
      ? row.subcategories[0]?.name
      : row.subcategories &&
        typeof row.subcategories === "object" &&
        "name" in row.subcategories
      ? (row.subcategories as { name?: string }).name
      : undefined;
    const label = personName
      ? `${personName} - ${subcategoryName ?? "Unknown"}`
      : subcategoryName ?? "Unknown Subcategory";

    if (!grouped[label]) grouped[label] = [];

    grouped[label].push({
      id: row.id,
      month: row.month,
      year: row.year,
      amount: row.amount,
      paid: row.paid,
    });
  }

  return Object.entries(grouped).map(([groupLabel, items]) => ({
    groupLabel,
    items,
  }));
}

export async function markOverdueAsPaid(overdueId: string): Promise<void> {
  const { error } = await supabase
    .from("overdue_payments")
    .update({
      paid: true,
      paid_at: new Date().toISOString(),
    })
    .eq("id", overdueId);

  if (error) throw error;
}
