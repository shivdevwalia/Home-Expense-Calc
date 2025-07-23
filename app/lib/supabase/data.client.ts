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

//   // ✅ Step 1: Create the expense and get the ID
//   const { data: expenseData, error: expenseError } = await supabase
//     .from("expenses")
//     .insert({
//       user_id: user.id,
//       subcategory_id,
//       amount,
//       date,
//     })
//     .select("id") // fetch the inserted ID
//     .single();

//   if (expenseError || !expenseData) {
//     console.error("Error creating expense:", expenseError);
//     throw expenseError;
//   }

//   // ✅ Step 2: Check if subcategory belongs to Utilities
//   const { data: subcategoryData, error: subcategoryError } = await supabase
//     .from("subcategories")
//     .select("id, category_id")
//     .eq("id", subcategory_id)
//     .single();

//   if (subcategoryError || !subcategoryData) {
//     console.error("Error fetching subcategory:", subcategoryError);
//     return;
//   }

//   const { data: categoryData, error: categoryError } = await supabase
//     .from("categories")
//     .select("name")
//     .eq("id", subcategoryData.category_id)
//     .single();

//   if (categoryError || !categoryData) {
//     console.error("Error fetching category:", categoryError);
//     return;
//   }

//   // ✅ Step 3: If it's a Utility, create overdue_payment with expense_id
//   if (categoryData.name === "Utilities") {
//     const currentDate = new Date();
//     const month = currentDate.getMonth() + 1;
//     const year = currentDate.getFullYear();

//     const { error: overdueError } = await supabase
//       .from("overdue_payments")
//       .insert({
//         user_id: user.id,
//         subcategory_id,
//         amount,
//         month,
//         year,
//         paid: false,
//         expense_id: expenseData.id, // ✅ Link it here
//       });

//     if (overdueError) {
//       console.error("Error adding overdue payment:", overdueError);
//     }
//   }
// }

export async function createExpenseClient({
  subcategory_id,
  amount,
  date,
}: {
  subcategory_id: string;
  amount: number;
  date: string; // format: YYYY-MM-DD
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("User not found");

  const parsedDate = new Date(date);
  const month = parsedDate.getMonth() + 1;
  const year = parsedDate.getFullYear();

  // ✅ Step 1: UPSERT expense
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .upsert(
      {
        user_id: user.id,
        subcategory_id,
        amount,
        date: parsedDate.toISOString(),
      },
      {
        onConflict: "user_id,subcategory_id,month,year", // 🔧 fix here: make it a string
      }
    )
    .select("id")
    .single();

  if (expenseError || !expenseData) {
    console.error("Error upserting expense:", expenseError);
    throw expenseError;
  }

  // ✅ Step 2: Fetch subcategory to see if it's a Utility
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

  // ✅ Step 3: If it's a Utility, UPSERT overdue payment
  if (categoryData.name === "Utilities") {
    const { error: overdueError } = await supabase
      .from("overdue_payments")
      .upsert(
        {
          user_id: user.id,
          subcategory_id,
          amount,
          month,
          year,
          paid: false,
          expense_id: expenseData.id,
          person_id: null,
        },
        {
          onConflict: "user_id,subcategory_id,person_id,month,year", // 🔧 fix here
        }
      );

    if (overdueError) {
      console.error("Error upserting overdue payment:", overdueError);
    }
  }
}

// export async function deleteExpense(expenseId: string) {
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) throw userError;

//   // 1. Get the expense details first
//   const { data: expense, error: fetchError } = await supabase
//     .from("expenses")
//     .select("subcategory_id")
//     .eq("id", expenseId)
//     .single();

//   if (fetchError || !expense) {
//     console.error("Error fetching expense:", fetchError);
//     throw fetchError;
//   }

//   // 2. Get the subcategory to check if it belongs to Utilities
//   const { data: subcategory, error: subError } = await supabase
//     .from("subcategories")
//     .select("category_id")
//     .eq("id", expense.subcategory_id)
//     .single();

//   if (subError || !subcategory) {
//     console.error("Error fetching subcategory:", subError);
//     throw subError;
//   }

//   const { data: category, error: catError } = await supabase
//     .from("categories")
//     .select("name")
//     .eq("id", subcategory.category_id)
//     .single();

//   if (catError || !category) {
//     console.error("Error fetching category:", catError);
//     throw catError;
//   }

//   // 3. Delete the expense
//   const { error: deleteError } = await supabase
//     .from("expenses")
//     .delete()
//     .eq("id", expenseId);

//   if (deleteError) {
//     console.error("Error deleting expense:", deleteError);
//     throw deleteError;
//   }

//   // 4. If it's under "Utilities", delete unpaid overdue rows
//   if (category.name.toLowerCase().trim() === "utilities") {
//     console.log(
//       "Expense belongs to Utilities. Attempting to delete overdue payments for subcategory:",
//       expense.subcategory_id
//     );

//     const { data: deletedRows, error: overdueError } = await supabase
//       .from("overdue_payments")
//       .delete()
//       .eq("user_id", user.id)
//       .eq("subcategory_id", expense.subcategory_id)
//       .eq("paid", false)
//       .select();

//     if (overdueError) {
//       console.error("Failed to delete overdue payments:", overdueError);
//     } else {
//       console.log("Deleted overdue payment rows:", deletedRows);
//     }
//   } else {
//     console.log("Expense is not under 'Utilities', no overdue rows deleted.");
//   }
// }

export async function deleteExpense(expenseId: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw userError;

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

  const { data: category, error: catError } = await supabase
    .from("categories")
    .select("name")
    .eq("id", subcategory.category_id)
    .single();

  if (catError || !category) {
    console.error("Error fetching category:", catError);
    throw catError;
  }

  // 3. Find the latest expense for this subcategory (for this user)
  const { data: latestExpense, error: latestError } = await supabase
    .from("expenses")
    .select("id, month, year")
    .eq("user_id", user.id)
    .eq("subcategory_id", expense.subcategory_id)
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(1)
    .single();

  if (latestError || !latestExpense) {
    console.error("Error finding latest expense:", latestError);
    throw latestError;
  }

  // 4. Delete only the latest expense
  const { error: deleteError } = await supabase
    .from("expenses")
    .delete()
    .eq("id", latestExpense.id);

  if (deleteError) {
    console.error("Error deleting expense:", deleteError);
    throw deleteError;
  }

  // 5. If it's under "Utilities", delete unpaid overdue rows
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
    .order("date", { ascending: false }) // ✅ ensures latest first
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

//   const categoryTotals = new Map<string, number>();

//   // 1. Fetch regular expenses from 'expenses' table
//   const { data: expenseData, error: expenseError } = await supabase
//     .from("expenses")
//     .select(
//       `
//       date,
//       user_id,
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
//     .lte("date", end)
//     .gt("amount", 0);

//   if (expenseError || !expenseData) {
//     console.error("Error fetching expenses:", expenseError);
//   } else {
//     for (const exp of expenseData) {
//       const subcat = Array.isArray(exp.subcategories)
//         ? exp.subcategories[0]
//         : exp.subcategories;

//       const category = Array.isArray(subcat?.categories)
//         ? subcat.categories[0]
//         : subcat?.categories;

//       const name = category?.name;
//       if (!name) continue;

//       categoryTotals.set(name, (categoryTotals.get(name) || 0) + exp.amount);
//     }
//   }

//   // 2. Fetch 'Household Help' total from active 'person' entries
//   const { data: personData, error: personError } = await supabase
//     .from("person")
//     .select("salary, created_at")
//     .eq("user_id", user.id)
//     .eq("is_active", true); // ✅ Only include active people

//   if (personError) {
//     console.error("Error fetching person data:", personError);
//   } else if (personData?.length) {
//     const thisMonthTotal = personData.reduce(
//       (sum, p) => sum + (p.salary || 0),
//       0
//     );

//     categoryTotals.set(
//       "Household Help",
//       (categoryTotals.get("Household Help") || 0) + thisMonthTotal
//     );
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

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
  const currentYear = now.getFullYear();

  const categoryTotals = new Map<string, number>();

  // 1. Fetch regular expenses for current month
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .select(
      `
      month,
      year,
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
    .eq("month", currentMonth)
    .eq("year", currentYear)
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

  // 2. Fetch 'Household Help' salaries for current month
  const { data: personData, error: personError } = await supabase
    .from("person")
    .select("salary,is_active,month,year")
    .eq("user_id", user.id)
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .eq("is_active", true);

  if (personError) {
    console.error("Error fetching person data:", personError);
  } else if (personData?.length) {
    const thisMonthTotal = personData.reduce(
      (sum, p) => sum + (p.salary || 0),
      0
    );

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

type GroupedResult = Record<
  string,
  { id: string; subcategory: string; amount: number }[]
>;

// export async function getMonthlySubcategoriesGroupedByCategoryClient(): Promise<GroupedResult> {
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) return {};

//   const start = startOfMonth(new Date()).toISOString();
//   const end = endOfMonth(new Date()).toISOString();

//   const grouped: GroupedResult = {};

//   // ---------- 1. EXPENSE TABLE ----------
//   const { data: expenseData, error: expenseError } = await supabase
//     .from("expenses")
//     .select(
//       `
//       user_id,
//       date,
//       id,
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
//     .lte("date", end)
//     .gt("amount", 0);

//   if (expenseError) {
//     console.error("Error in expenses query", expenseError);
//   }

//   if (expenseData) {
//     for (const exp of expenseData) {
//       const sub = Array.isArray(exp.subcategories)
//         ? exp.subcategories[0]
//         : exp.subcategories;

//       const cat = Array.isArray(sub?.categories)
//         ? sub.categories[0]
//         : sub?.categories;

//       const catName = cat?.name;
//       const subName = sub?.name;

//       if (!catName || !subName) continue;

//       if (!grouped[catName]) grouped[catName] = [];

//       const existing = grouped[catName].find((x) => x.subcategory === subName);
//       if (existing) {
//         existing.amount += exp.amount;
//       } else {
//         grouped[catName].push({
//           id: exp.id,
//           subcategory: subName,
//           amount: exp.amount,
//         });
//       }
//     }
//   }

//   // ---------- 2. PERSON TABLE ----------
//   const { data: people, error: peopleError } = await supabase
//     .from("person")
//     .select("id, name, salary, created_at, subcategories:subcategory_id(name)")
//     .eq("user_id", user.id);

//   if (peopleError) {
//     console.error("Error fetching from person table", peopleError);
//   }

//   if (people) {
//     for (const person of people) {
//       const created = new Date(person.created_at);
//       if (created < new Date(start) || created > new Date(end)) continue;

//       const catName = "Household Help";
//       const subName = Array.isArray(person.subcategories)
//         ? person.subcategories[0]?.name || "Unknown"
//         : (person.subcategories as { name?: string })?.name || "Unknown";

//       if (!grouped[catName]) grouped[catName] = [];

//       const existing = grouped[catName].find((x) => x.subcategory === subName);

//       if (existing) {
//         existing.amount += person.salary || 0;
//       } else {
//         grouped[catName].push({
//           id: person.id,
//           subcategory: subName,
//           amount: person.salary || 0,
//         });
//       }
//     }
//   }

//   return grouped;
// }

export async function getMonthlySubcategoriesGroupedByCategoryClient(): Promise<GroupedResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return {};

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const grouped: GroupedResult = {};

  // ---------- 1. EXPENSE TABLE ----------
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .select(
      `
      user_id,
      month,
      year,
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
    .eq("month", currentMonth)
    .eq("year", currentYear)
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
    .select(
      "id, name, salary, is_active, created_at, end_date, subcategories:subcategory_id(name)"
    )
    .eq("user_id", user.id);

  if (peopleError) {
    console.error("Error fetching from person table", peopleError);
  }

  if (people) {
    for (const person of people) {
      const created = new Date(person.created_at);
      const endDate = person.end_date ? new Date(person.end_date) : null;

      // Check if person is active in this month
      const isStillActive =
        (!person.is_active || person.is_active === true) &&
        created <= now &&
        (!endDate || endDate >= now);

      if (!isStillActive) continue;

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

// export async function getMonthlyPersonExpensesGrouped(): Promise<
//   { category: string; subcategory: string; amount: number; id: string }[]
// > {
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) return [];

//   const start = startOfMonth(new Date());
//   const end = endOfMonth(new Date());

//   const { data: people, error: peopleError } = await supabase
//     .from("person")
//     .select(
//       "id, name, salary, created_at, is_active, subcategories:subcategory_id(name)"
//     )
//     .eq("user_id", user.id)
//     .eq("is_active", true); // ✅ Only active

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
//     // Defensive logging

//     // Skip if missing name or malformed
//     if (!person.name || typeof person.name !== "string") continue;

//     const created = new Date(person.created_at);
//     if (created > end) continue; // 🛑 Skip people added after this month

//     const roleName = Array.isArray(person.subcategories)
//       ? person.subcategories[0]?.name || "Unknown"
//       : (person.subcategories as { name?: string })?.name || "Unknown";

//     // Final subcategory label
//     const label = `${roleName} - ${person.name}`.trim();
//     console.log("Generated label:", label);
//     result.push({
//       id: person.id,
//       category: "Household Help",
//       subcategory: label,
//       amount: person.salary || 0,
//     });
//   }

//   return result;
// }

export async function getMonthlyPersonExpensesGrouped(): Promise<
  { category: string; subcategory: string; amount: number; id: string }[]
> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return [];

  const today = new Date();
  const currentMonth = today.getMonth() + 1; // JS months are 0-based
  const currentYear = today.getFullYear();

  const { data: people, error: peopleError } = await supabase
    .from("person")
    .select(
      "id, name, salary, is_active, month, year, subcategories:subcategory_id(name)"
    )
    .eq("user_id", user.id)
    .eq("is_active", true)
    .eq("month", currentMonth)
    .eq("year", currentYear); // 🧠 Filters active people created up to current month

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
    const roleName = Array.isArray(person.subcategories)
      ? person.subcategories[0]?.name || "Unknown"
      : (person.subcategories as { name?: string })?.name || "Unknown";

    const label = `${roleName} - ${person.name}`.trim();

    result.push({
      id: person.id,
      category: "Household Help",
      subcategory: label,
      amount: person.salary || 0,
    });
  }

  return result;
}

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

// export async function addAbsence(
//   personId: string,
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
//     person_id: personId,
//     date: date.toLocaleDateString("en-CA"), // 'YYYY-MM-DD'
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

  // ✅ Fetch person_identity_id for given person
  const { data: person, error: personError } = await supabase
    .from("person")
    .select("id, person_identity_id")
    .eq("id", personId)
    .single();

  if (personError || !person) {
    throw new Error("Person not found");
  }

  return supabase.from("absences").insert({
    user_id: user.id,
    person_id: person.id, // ✅ still required
    person_identity_id: person.person_identity_id, // ✅ new field
    date: date.toLocaleDateString("en-CA"), // 'YYYY-MM-DD'
    deduct,
  });
}

// export async function updateAbsenceClient(
//   id: string,
//   newDate: string,
//   newNote?: string
// ) {
//   const { error } = await supabase
//     .from("absences")
//     .update({ date: newDate, note: newNote || null })
//     .eq("id", id);

//   if (error) throw error;
// }

export async function updateAbsenceClient(
  id: string,
  newDate: string,
  newNote?: string
) {
  // Step 1: Fetch the existing record to get user_id and person_identity_id
  const { data: existing, error: fetchError } = await supabase
    .from("absences")
    .select("user_id, person_identity_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    throw fetchError || new Error("Absence record not found");
  }

  const { user_id, person_identity_id } = existing;

  // Step 2: Check if there's already another absence with same person_identity_id + date
  const { data: conflict, error: conflictError } = await supabase
    .from("absences")
    .select("id")
    .eq("user_id", user_id)
    .eq("person_identity_id", person_identity_id)
    .eq("date", newDate)
    .neq("id", id) // Exclude the current record
    .maybeSingle();

  if (conflictError) throw conflictError;
  if (conflict) throw new Error("Absence already exists for that date");

  // Step 3: Safe to update
  const { error: updateError } = await supabase
    .from("absences")
    .update({
      date: newDate,
      note: newNote || null,
    })
    .eq("id", id);

  if (updateError) throw updateError;
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

// export async function removeAbsence(personId: string, date: Date) {
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
//     .eq("person_id", personId)
//     .eq("date", date.toLocaleDateString("en-CA")); // format: YYYY-MM-DD
// }

export async function removeAbsence(personId: string, date: Date) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Step 1: Get person_identity_id from person_id
  const { data: personData, error: personError } = await supabase
    .from("person")
    .select("person_identity_id")
    .eq("id", personId)
    .single();

  if (personError || !personData) {
    throw new Error("Failed to find person_identity_id");
  }

  const personIdentityId = personData.person_identity_id;

  // Step 2: Delete absence using person_identity_id
  return supabase
    .from("absences")
    .delete()
    .eq("user_id", user.id)
    .eq("person_identity_id", personIdentityId)
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

// export async function getAbsencesForMonth(personId: string): Promise<Date[]> {
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
//     .eq("person_id", personId)
//     .gte("date", start)
//     .lte("date", end);

//   if (error) {
//     console.error("Error fetching absences:", error);
//     return [];
//   }

//   return data.map((d) => new Date(d.date));
// }

export async function getAbsencesForMonth(personId: string): Promise<Date[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Step 1: Get person_identity_id from person_id
  const { data: personData, error: personError } = await supabase
    .from("person")
    .select("person_identity_id")
    .eq("id", personId)
    .single();

  if (personError || !personData) {
    console.error("Error fetching person_identity_id:", personError);
    return [];
  }

  const personIdentityId = personData.person_identity_id;

  // Step 2: Get start and end of current month
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

  // Step 3: Query absences using person_identity_id
  const { data, error } = await supabase
    .from("absences")
    .select("date")
    .eq("user_id", user.id)
    .eq("person_identity_id", personIdentityId)
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
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  const { data, error } = await supabase
    .from("person")
    .select("id, name, salary,is_active,month,year")
    .eq("subcategory_id", subcategory_id)
    .eq("month", thisMonth)
    .eq("year", thisYear)
    .eq("is_active", true)
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

//   const { data: person, error } = await supabase
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
//     .single();

//   if (error) {
//     console.error("Error creating person:", error);
//     return null;
//   }

//   // Add overdue payment for current month

//   const today = new Date();
//   const currentMonth = today.getMonth() + 1;
//   const currentYear = today.getFullYear();

//   const { error: overdueError } = await supabase
//     .from("overdue_payments")
//     .insert([
//       {
//         user_id: userData.user.id,
//         subcategory_id,
//         person_id: person.id,
//         amount: salary,
//         month: currentMonth,
//         year: currentYear,
//         paid: false,
//       },
//     ]);

//   if (overdueError) {
//     console.error("Error adding overdue payment:", {
//       message: overdueError.message,
//       details: overdueError.details,
//       hint: overdueError.hint,
//       code: overdueError.code,
//     });
//   }

//   return person;
// }

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

//   const { data: person, error } = await supabase
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
//     .single();

//   if (error) {
//     console.error("Error creating person:", error);
//     return null;
//   }

//   // Add overdue payment for current month if not already added
//   const today = new Date();
//   const currentMonth = today.getMonth() + 1;
//   const currentYear = today.getFullYear();

//   const { error: overdueError } = await supabase
//     .from("overdue_payments")
//     .upsert(
//       {
//         user_id: userData.user.id,
//         subcategory_id,
//         person_id: person.id,
//         amount: salary,
//         month: currentMonth,
//         year: currentYear,
//         paid: false,
//       },
//       {
//         onConflict: "user_id,subcategory_id,person_id,month,year",
//       }
//     );

//   if (overdueError) {
//     console.error("Error adding overdue payment:", {
//       message: overdueError.message,
//       details: overdueError.details,
//       hint: overdueError.hint,
//       code: overdueError.code,
//     });
//   }

//   return person;
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

  const user_id = userData.user.id;

  // Step 1: Check for existing person_identity_id
  const { data: existing, error: lookupError } = await supabase
    .from("person")
    .select("person_identity_id")
    .eq("user_id", user_id)
    .eq("subcategory_id", subcategory_id)
    .eq("name", name)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.error("Error checking existing identity:", lookupError);
    return null;
  }

  const person_identity_id =
    existing?.person_identity_id ?? crypto.randomUUID();

  // Step 2: Insert new person
  const { data: person, error } = await supabase
    .from("person")
    .insert([
      {
        user_id,
        subcategory_id,
        name,
        salary,
        person_identity_id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating person:", error);
    return null;
  }

  // Step 3: Add overdue payment for current month
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const { error: overdueError } = await supabase
    .from("overdue_payments")
    .upsert(
      {
        user_id,
        subcategory_id,
        person_id: person.id,
        amount: salary,
        month: currentMonth,
        year: currentYear,
        paid: false,
      },
      {
        onConflict: "user_id,subcategory_id,person_id,month,year",
      }
    );

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

//   const user_id = userData.user.id;
//   const today = new Date();
//   const currentMonth = today.getMonth() + 1;
//   const currentYear = today.getFullYear();

//   // Step 1: Check if person with same details already exists
//   const { data: existingPerson, error: fetchError } = await supabase
//     .from("person")
//     .select("*")
//     .eq("user_id", user_id)
//     .eq("subcategory_id", subcategory_id)
//     .eq("name", name)
//     .eq("month", currentMonth)
//     .eq("year", currentYear)
//     .single();

//   if (fetchError && fetchError.code !== "PGRST116") {
//     // Some error other than "no rows found"
//     console.error("Error checking existing person:", fetchError);
//     return null;
//   }

//   let person;

//   if (existingPerson) {
//     if (existingPerson.is_active) {
//       console.warn("Person already exists and is active");
//       return existingPerson; // Or return null with message
//     }

//     // Reactivate
//     const { data: updated, error: updateError } = await supabase
//       .from("person")
//       .update({
//         is_active: true,
//         end_date: null,
//         salary,
//       })
//       .eq("id", existingPerson.id)
//       .select()
//       .single();

//     if (updateError) {
//       console.error("Error reactivating person:", updateError);
//       return null;
//     }

//     person = updated;
//   } else {
//     // Step 2: Insert new
//     const { data: inserted, error: insertError } = await supabase
//       .from("person")
//       .insert([
//         {
//           user_id,
//           subcategory_id,
//           name,
//           salary,
//         },
//       ])
//       .select()
//       .single();

//     if (insertError) {
//       console.error("Error creating person:", insertError);
//       return null;
//     }

//     person = inserted;
//   }

//   // Step 3: Add overdue payment
//   const { error: overdueError } = await supabase
//     .from("overdue_payments")
//     .upsert(
//       {
//         user_id,
//         subcategory_id,
//         person_id: person.id,
//         amount: salary,
//         month: currentMonth,
//         year: currentYear,
//         paid: false,
//       },
//       {
//         onConflict: "user_id,subcategory_id,person_id,month,year",
//       }
//     );

//   if (overdueError) {
//     console.error("Error adding overdue payment:", {
//       message: overdueError.message,
//       details: overdueError.details,
//       hint: overdueError.hint,
//       code: overdueError.code,
//     });
//   }

//   return person;
// }

export async function deletePersonById(id: string): Promise<void> {
  // 1️⃣ Get the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw userError;

  const userId = user.id;

  // 2️⃣ Soft‑delete the person (keep historical data, mark inactive)
  const { error: updateError } = await supabase
    .from("person")
    .update({
      is_active: false,
      end_date: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (updateError) {
    console.error("Failed to deactivate person:", updateError);
    throw updateError;
  }

  // 3️⃣ Delete all overdue payments linked to this person
  //    (you can add `.eq("paid", false)` if you only want unpaid rows)
  const { error: overdueDeleteError } = await supabase
    .from("overdue_payments")
    .delete()
    .eq("user_id", userId)
    .eq("person_id", id);

  if (overdueDeleteError) {
    console.error("Failed to delete overdue payments:", overdueDeleteError);
    throw overdueDeleteError;
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

// export async function getAbsencesPerPersonPerMonth(subcategoryName: string) {
//   // ✅ Get current user ID
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) {
//     console.error("User not found", userError);
//     return null;
//   }

//   const userId = user.id;

//   // ✅ Get subcategory ID by name (global/shared, no user_id filtering)
//   const { data: subcategories, error: subcatError } = await supabase
//     .from("subcategories")
//     .select("id")
//     .eq("name", subcategoryName);

//   if (subcatError || !subcategories || subcategories.length === 0) {
//     console.error("Subcategory not found or error", subcatError);
//     return null;
//   }

//   const subcategoryId = subcategories[0].id;

//   const now = new Date();
//   const thisMonth = now.getMonth() + 1;
//   const thisYear = now.getFullYear();

//   // ✅ Get all persons in that subcategory for this user
//   const { data: persons, error: personsError } = await supabase
//     .from("person")
//     .select("id, name,is_active,month,year")
//     .eq("is_active", true)
//     .eq("month", thisMonth)
//     .eq("year", thisYear)
//     .eq("subcategory_id", subcategoryId)
//     .eq("user_id", userId);

//   if (personsError || !persons || persons.length === 0) {
//     console.error("No persons found for subcategory", personsError);
//     return null;
//   }

//   const personIds = persons.map((p) => p.id);

//   // ✅ Get all absences for these persons in the last 6 months
//   const fromDate = new Date();
//   fromDate.setMonth(fromDate.getMonth() - 5);
//   fromDate.setDate(1);

//   const { data: absences, error: absencesError } = await supabase
//     .from("absences")
//     .select("date, person_id")
//     .in("person_id", personIds)
//     .gte("date", fromDate.toISOString().split("T")[0])
//     .eq("user_id", userId);

//   if (absencesError || !absences) {
//     console.error("Error fetching absences", absencesError);
//     return null;
//   }

//   // ✅ Group by person and month
//   const result: Record<
//     string,
//     {
//       name: string;
//       monthly: Record<string, number>;
//     }
//   > = {};

//   for (const person of persons) {
//     result[person.id] = {
//       name: person.name,
//       monthly: {},
//     };
//   }

//   for (const absence of absences) {
//     const month = absence.date.slice(0, 7); // "2025-07"
//     if (result[absence.person_id]) {
//       result[absence.person_id].monthly[month] =
//         (result[absence.person_id].monthly[month] || 0) + 1;
//     }
//   }

//   return result;
// }

export async function getAbsencesPerPersonPerMonth(subcategoryName: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not found", userError);
    return null;
  }

  const userId = user.id;

  // Get subcategory ID
  const { data: subcategories, error: subcatError } = await supabase
    .from("subcategories")
    .select("id")
    .eq("name", subcategoryName);

  if (subcatError || !subcategories?.length) {
    console.error("Subcategory not found", subcatError);
    return null;
  }

  const subcategoryId = subcategories[0].id;

  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  // Get active persons for current month
  const { data: persons, error: personsError } = await supabase
    .from("person")
    .select("id, name, person_identity_id")
    .eq("is_active", true)
    .eq("month", thisMonth)
    .eq("year", thisYear)
    .eq("subcategory_id", subcategoryId)
    .eq("user_id", userId);

  if (personsError || !persons?.length) {
    console.error("No persons found for subcategory", personsError);
    return null;
  }

  const identityIdToName: Record<string, string> = {};
  const personIdentityIds = persons.map((p) => {
    identityIdToName[p.person_identity_id] = p.name;
    return p.person_identity_id;
  });

  // Fetch absences using person_identity_id
  const fromDate = new Date();
  fromDate.setMonth(fromDate.getMonth() - 5);
  fromDate.setDate(1);

  const { data: absences, error: absencesError } = await supabase
    .from("absences")
    .select("date, person_identity_id")
    .in("person_identity_id", personIdentityIds)
    .gte("date", fromDate.toISOString().split("T")[0])
    .eq("user_id", userId);

  if (absencesError || !absences) {
    console.error("Error fetching absences", absencesError);
    return null;
  }

  // Group by person_identity_id and month
  const result: Record<
    string,
    {
      name: string;
      monthly: Record<string, number>;
    }
  > = {};

  // for (const identityId of personIdentityIds) {
  //   result[identityId] = {
  //     name: identityIdToName[identityId] || "Unknown",
  //     monthly: {},
  //   };
  // }

  const current = new Date();

  for (const identityId of personIdentityIds) {
    const monthly: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const date = new Date(current);
      date.setMonth(current.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      monthly[key] = 0; // initialize to zero absences for all last 6 months
    }

    result[identityId] = {
      name: identityIdToName[identityId] || "Unknown",
      monthly,
    };
  }

  for (const absence of absences) {
    const month = absence.date.slice(0, 7); // e.g., "2025-07"
    if (result[absence.person_identity_id]) {
      result[absence.person_identity_id].monthly[month] =
        (result[absence.person_identity_id].monthly[month] || 0) + 1;
    }
  }

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

function getLast3MonthsRangesIncludingCurrent() {
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

// export async function getAverageMonthlyExpenseClient() {
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) return 0;

//   const startDate = startOfMonth(subMonths(new Date(), 3)).toISOString();

//   const months = getLast3MonthsRangesIncludingCurrent();

//   const { data: expenses, error: expenseError } = await supabase
//     .from("expenses")
//     .select("amount, date")
//     .gte("date", startDate)
//     .eq("user_id", user.id);

//   if (expenseError) {
//     console.error("Error fetching expenses:", expenseError);
//     return 0;
//   }

//   const { data: people1, error: personError1 } = await supabase
//     .from("person")
//     .select("salary, created_at,end_date")
//     .lte("created_at", months[0].endDate)
//     .or(`end_date.gte.${months[0].endDate},end_date.is.null`)
//     .eq("user_id", user.id);

//   console.log("people1", people1);

//   const { data: people2, error: personError2 } = await supabase
//     .from("person")
//     .select("salary, created_at,end_date")
//     .lte("created_at", months[1].endDate)
//     .or(`end_date.gte.${months[1].endDate},end_date.is.null`)
//     .eq("user_id", user.id);

//   console.log("people2", people2);

//   const { data: people3, error: personError3 } = await supabase
//     .from("person")
//     .select("salary, created_at,end_date")
//     .lte("created_at", months[2].endDate)
//     .or(`end_date.gte.${months[2].endDate},end_date.is.null`)
//     .eq("user_id", user.id);

//   console.log("people3", people3);

//   if (personError1) {
//     console.error("Error fetching person salaries:", personError1);
//     return 0;
//   }
//   if (personError2) {
//     console.error("Error fetching person salaries:", personError2);
//     return 0;
//   }
//   if (personError3) {
//     console.error("Error fetching person salaries:", personError3);
//     return 0;
//   }

//   const monthlyTotals = new Map<string, number>();

//   for (const expense of expenses || []) {
//     const month = new Date(expense.date).toISOString().slice(0, 7);
//     monthlyTotals.set(
//       month,
//       (monthlyTotals.get(month) || 0) + (expense.amount || 0)
//     );
//   }

//   for (const person of people1 || []) {
//     const month = new Date(person.created_at).toISOString().slice(0, 7);
//     monthlyTotals.set(
//       month,
//       (monthlyTotals.get(month) || 0) + (person.salary || 0)
//     );
//   }

//   for (const person of people2 || []) {
//     const month = new Date(person.created_at).toISOString().slice(0, 7);
//     monthlyTotals.set(
//       month,
//       (monthlyTotals.get(month) || 0) + (person.salary || 0)
//     );
//   }

//   for (const person of people3 || []) {
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
export async function getAverageMonthlyExpenseClient() {
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
    .select("salary, month, year,is_active")
    .eq("is_active", true)
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

// export async function getAdvancesForPerson(personId: string) {
//   const { data, error } = await supabase
//     .from("advances")
//     .select("id, amount, note, date")
//     .eq("person_id", personId);

//   if (error) throw error;
//   return data;
// }

export async function getAdvancesForPerson(personId: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("User not authenticated");

  // Step 1: Get person_identity_id for this user and personId
  const { data: personData, error: personError } = await supabase
    .from("person")
    .select("person_identity_id")
    .eq("id", personId)
    .eq("user_id", user.id) // 🔐 Enforce ownership
    .single();

  if (personError) throw personError;
  if (!personData?.person_identity_id) return [];

  // Step 2: Fetch advances using person_identity_id + user_id
  const { data: advances, error: advancesError } = await supabase
    .from("advances")
    .select("id, amount, note, date")
    .eq("person_identity_id", personData.person_identity_id)
    .eq("user_id", user.id); // 🔐 Enforce ownership again

  if (advancesError) throw advancesError;
  return advances;
}

export async function deleteAdvanceById(id: string) {
  const { error } = await supabase.from("advances").delete().eq("id", id);
  if (error) throw error;
}

// export async function addAdvanceForPerson(
//   personId: string,
//   amount: number,
//   note: string
// ) {
//   const {
//     data: { user },
//   } = await supabase.auth.getUser(); // Get current user ID

//   if (!user) throw new Error("User not authenticated");

//   const { data, error } = await supabase.from("advances").insert([
//     {
//       person_id: personId,
//       amount,
//       note,
//       user_id: user.id,
//       date: new Date(),
//     },
//   ]);

//   if (error) {
//     console.error("Error adding advance:", error.message);
//     throw error;
//   }

//   return data;
// }

export async function addAdvanceForPerson(
  personId: string,
  amount: number,
  note: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser(); // Get current user ID

  if (!user) throw new Error("User not authenticated");

  // 🔹 Step 1: Fetch person_identity_id for this personId
  const { data: person, error: personError } = await supabase
    .from("person")
    .select("person_identity_id")
    .eq("id", personId)
    .single();

  if (personError || !person?.person_identity_id) {
    console.error("Failed to fetch person_identity_id:", personError?.message);
    throw personError || new Error("person_identity_id not found");
  }

  // 🔹 Step 2: Insert advance with both person_id and person_identity_id
  const { data, error } = await supabase.from("advances").insert([
    {
      person_id: personId,
      person_identity_id: person.person_identity_id,
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

// // getAvailableYearsClient.ts
// export async function getAvailableYearsClient(userId: string) {
//   const { data, error } = await supabase
//     .from("expenses")
//     .select("date")
//     .eq("user_id", userId);

//   if (error) throw error;

//   const years = Array.from(
//     new Set(data.map((d) => new Date(d.date).getFullYear()))
//   ).sort();
//   return years;
// }

// getAvailableYearsClient.ts

export async function getAvailableYearsClient(userId: string) {
  const [expensesResult, personResult] = await Promise.all([
    supabase.from("expenses").select("date").eq("user_id", userId),
    supabase.from("person").select("created_at").eq("user_id", userId),
  ]);

  if (expensesResult.error) throw expensesResult.error;
  if (personResult.error) throw personResult.error;

  const expenseYears = expensesResult.data.map((d) =>
    new Date(d.date).getFullYear()
  );
  const personYears = personResult.data.map((p) =>
    new Date(p.created_at).getFullYear()
  );

  const years = Array.from(new Set([...expenseYears, ...personYears])).sort();
  return years;
}

// export async function getExpensesByYearClient(userId: string, year: number) {
//   const [expensesResult, personResult] = await Promise.all([
//     supabase.from("expenses").select("amount, date").eq("user_id", userId),
//     supabase
//       .from("person")
//       .select("salary, created_at, end_date")
//       .eq("user_id", userId),
//   ]);

//   if (expensesResult.error) throw expensesResult.error;
//   if (personResult.error) throw personResult.error;

//   const monthly = new Array(12).fill(0);

//   // Process regular expenses
//   for (const expense of expensesResult.data) {
//     const d = new Date(expense.date);
//     if (d.getFullYear() === year) {
//       monthly[d.getMonth()] += expense.amount;
//     }
//   }

//   // Process person salaries - match the exact logic from getLastSixMonthsExpenses
//   const currentDate = new Date();
//   const currentYear = currentDate.getFullYear();
//   const currentMonth = currentDate.getMonth();

//   for (let month = 0; month < 12; month++) {
//     // Skip future months - only process months that have actually occurred
//     if (year === currentYear && month > currentMonth) {
//       break;
//     }
//     // Skip entirely if it's a future year
//     if (year > currentYear) {
//       break;
//     }

//     const monthDate = new Date(year, month, 1);
//     const monthEnd = new Date(year, month + 1, 0); // Last day of month

//     // Filter people using the same logic as your 6-month function
//     const activePeople = personResult.data.filter((person) => {
//       const createdAt = new Date(person.created_at);
//       const personEnd = person.end_date ? new Date(person.end_date) : null;

//       // Same filter logic: created_at <= monthEnd AND (no end_date OR end_date >= monthEnd)
//       return createdAt <= monthEnd && (!personEnd || personEnd >= monthEnd);
//     });

//     // Add salary for this month if person is active (same logic as 6-month function)
//     for (const person of activePeople) {
//       const createdAt = new Date(person.created_at);
//       const monthStart = new Date(year, month, 1);
//       const personEnd = person.end_date ? new Date(person.end_date) : null;

//       // Check if person is active during this month (exact same logic)
//       const isActiveThisMonth =
//         createdAt <= monthEnd && (!personEnd || personEnd >= monthStart);

//       if (isActiveThisMonth) {
//         monthly[month] += person.salary;
//       }
//     }
//   }

//   return monthly.map((value, index) => ({
//     label: new Date(0, index).toLocaleString("en-US", { month: "short" }),
//     value,
//   }));
// }

export async function getExpensesByYearClient(userId: string, year: number) {
  const [expensesResult, personResult] = await Promise.all([
    supabase
      .from("expenses")
      .select("amount, month, year")
      .eq("user_id", userId)
      .eq("year", year),
    supabase
      .from("person")
      .select("salary, month, year, is_active")
      .eq("user_id", userId)
      .eq("year", year)
      .eq("is_active", true),
  ]);

  if (expensesResult.error) throw expensesResult.error;
  if (personResult.error) throw personResult.error;

  const monthly = new Array(12).fill(0);

  // 1. Add expenses for selected year
  for (const expense of expensesResult.data) {
    const m = expense.month;
    if (m >= 1 && m <= 12) {
      monthly[m - 1] += expense.amount || 0;
    }
  }

  // 2. Add salaries for selected year
  for (const person of personResult.data) {
    const m = person.month;
    if (m >= 1 && m <= 12) {
      monthly[m - 1] += person.salary || 0;
    }
  }

  return monthly.map((value, index) => ({
    label: new Date(0, index).toLocaleString("en-US", { month: "short" }),
    value: Math.round(value),
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

  const currentMonth = month;
  const currentYear = year;

  // Regular expenses
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .select(
      `
      month,
      year,
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
      month,
      year,
      is_active,
      created_at,
      end_date,
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
    .eq("is_active", true)
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

  const currentMonth = month;
  const currentYear = year;

  const start = startOfMonth(new Date(year, month - 1)).toISOString();
  const end = endOfMonth(new Date(year, month - 1)).toISOString();

  const { data, error } = await supabase
    .from("expenses")
    .select(
      `
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
    .eq("month", currentMonth)
    .eq("year", currentYear)
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
      month,
      year,
      is_active,
      created_at,
      end_date,
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
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .eq("is_active", true)
    .or(`end_date.gte.${end},end_date.is.null`);

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
      ? `${subcategoryName ?? "Unknown"} - ${personName}`
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

// export async function checkAndInsertAlerts() {
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

// export async function checkAndInsertAlerts() {
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
//   const validAlertMessages: string[] = []; // Track all valid alert messages

//   // Check expense condition
//   const expenseAlertMsg =
//     " Your expenses this month are over 15% higher than last month.";
//   if (totalLast > 0 && totalCurrent > totalLast * 1.15) {
//     alertsToInsert.push(expenseAlertMsg);
//     validAlertMessages.push(expenseAlertMsg);
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

//   // Check absence conditions and track valid alerts
//   persons?.forEach((p) => {
//     const absenceAlertMsg = ` ${p.name} has been absent more than 2 days this month.`;
//     if (absencesCount[p.id] > 2) {
//       alertsToInsert.push(absenceAlertMsg);
//       validAlertMessages.push(absenceAlertMsg);
//     }
//   });

//   // Insert new alerts
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

//   // 🔸 DELETE alerts that are no longer valid
//   // Get all existing alerts for this user
//   const { data: existingAlerts } = await supabase
//     .from("alerts")
//     .select("id, message")
//     .eq("user_id", userId)
//     .eq("dismissed", false); // Only check non-dismissed alerts

//   if (existingAlerts && existingAlerts.length > 0) {
//     // Find alerts that should be deleted (exist in DB but not in validAlertMessages)
//     const alertsToDelete = existingAlerts.filter(
//       (alert) => !validAlertMessages.includes(alert.message)
//     );

//     // Delete invalid alerts
//     if (alertsToDelete.length > 0) {
//       const alertIdsToDelete = alertsToDelete.map((alert) => alert.id);
//       await supabase.from("alerts").delete().in("id", alertIdsToDelete);

//       console.log(`Deleted ${alertsToDelete.length} outdated alerts`);
//     }
//   }
// }

export async function checkAndInsertAlerts() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const userId = user.id;
  const now = new Date();

  const thisMonthStart = startOfMonth(now).toISOString();
  const thisMonthEnd = endOfMonth(now).toISOString();

  const lastMonthDate = subMonths(now, 1);
  const lastMonthStart = startOfMonth(lastMonthDate).toISOString();
  const lastMonthEnd = endOfMonth(lastMonthDate).toISOString();

  const alertsToInsert: string[] = [];
  const validAlertMessages: string[] = [];

  // 🔸 1. Get EXPENSES from expenses table
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

  const totalCurrentExpenses =
    currentMonth?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const totalLastExpenses =
    lastMonth?.reduce((sum, e) => sum + e.amount, 0) || 0;

  // 🔸 2. Add salary from person table
  const { data: currentMonthSalaries } = await supabase
    .from("person")
    .select("salary,is_active")
    .eq("is_active", true)
    .eq("user_id", userId)
    .eq("month", now.getMonth() + 1)
    .eq("year", now.getFullYear());

  const { data: lastMonthSalaries } = await supabase
    .from("person")
    .select("salary,is_active")
    .eq("is_active", true)
    .eq("user_id", userId)
    .eq("month", lastMonthDate.getMonth() + 1)
    .eq("year", lastMonthDate.getFullYear());

  const totalCurrentSalaries =
    currentMonthSalaries?.reduce((sum, p) => sum + (p.salary || 0), 0) || 0;
  const totalLastSalaries =
    lastMonthSalaries?.reduce((sum, p) => sum + (p.salary || 0), 0) || 0;

  const totalCurrent = totalCurrentExpenses + totalCurrentSalaries;
  const totalLast = totalLastExpenses + totalLastSalaries;

  // 🔸 3. Expense Alert
  const expenseAlertMsg =
    " Your expenses this month are over 15% higher than last month.";
  if (totalLast > 0 && totalCurrent > totalLast * 1.15) {
    alertsToInsert.push(expenseAlertMsg);
    validAlertMessages.push(expenseAlertMsg);
  }

  // 🔸 4. Absence Alert
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

  persons?.forEach((p) => {
    const absenceAlertMsg = ` ${p.name} has been absent more than 2 days this month.`;
    if (absencesCount[p.id] > 2) {
      alertsToInsert.push(absenceAlertMsg);
      validAlertMessages.push(absenceAlertMsg);
    }
  });

  // 🔸 5. Insert New Alerts (if not already present)
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

  // 🔸 6. Delete Outdated Alerts (not valid anymore)
  const { data: existingAlerts } = await supabase
    .from("alerts")
    .select("id, message")
    .eq("user_id", userId)
    .eq("dismissed", false);

  if (existingAlerts && existingAlerts.length > 0) {
    const alertsToDelete = existingAlerts.filter(
      (alert) => !validAlertMessages.includes(alert.message)
    );

    if (alertsToDelete.length > 0) {
      const alertIdsToDelete = alertsToDelete.map((alert) => alert.id);
      await supabase.from("alerts").delete().in("id", alertIdsToDelete);
      console.log(`Deleted ${alertsToDelete.length} outdated alerts`);
    }
  }
}

export async function getLastSixMonthsExpenses() {
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

export async function getMonthlySubcategoriesGroupedByCategory() {
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

export async function getAverageMonthlyExpense() {
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

export async function getCurrentMonthExpense() {
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

// export async function getHouseHelpRolesForCurrentUser() {
//   const now = new Date();
//   const currentMonth = now.getMonth() + 1; // JS months are 0-based
//   const currentYear = now.getFullYear();

//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) return [];

//   const { data, error } = await supabase
//     .from("person")
//     .select(
//       `
//       month,
//       year,
//       is_active,
//       id,
//       name,
//       subcategories (
//         id,
//         name,
//         categories (
//           name
//         )
//       )
//     `
//     )
//     .eq("month", currentMonth)
//     .eq("year", currentYear)
//     .eq("is_active", true)
//     .eq("user_id", user.id);

//   if (error || !data) {
//     console.error("Error fetching house help persons:", error);
//     return [];
//   }

//   const roles: { id: string; name: string; subcategoryName: string }[] = [];

//   for (const p of data) {
//     const subcat = Array.isArray(p.subcategories)
//       ? p.subcategories[0]
//       : p.subcategories;

//     const cat = Array.isArray(subcat?.categories)
//       ? subcat.categories[0]
//       : subcat?.categories;

//     if (cat?.name !== "Household Help") continue;

//     roles.push({
//       id: p.id,
//       name: p.name,
//       subcategoryName: subcat?.name || "",
//     });
//   }

//   return roles;
// }

export async function getHouseHelpRolesForCurrentUser() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
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
      id,
      name,
      person_identity_id,
      month,
      year,
      is_active,
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

  const roles: {
    id: string;
    name: string;
    subcategoryName: string;
    personIdentityId: string;
  }[] = [];

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
      personIdentityId: p.person_identity_id, // ✅ Include for cross-month tracking
    });
  }

  return roles;
}

// gets years where the person has any data (e.g., salary/absence)
export async function getYearsForPersonIdentity(personIdentityId: string) {
  const { data, error } = await supabase
    .from("person")
    .select("year")
    .eq("person_identity_id", personIdentityId)
    .order("year", { ascending: true });

  if (error) return [];
  const years = [...new Set(data.map((d) => d.year))];
  return years as number[];
}

// gets monthly data for a selected year for the person
export async function getMonthlyDataForPersonIdentity(
  personIdentityId: string,
  year: number
): Promise<{ label: string; value: number }[]> {
  const { data, error } = await supabase
    .from("person")
    .select("month, salary")
    .eq("person_identity_id", personIdentityId)
    .eq("year", year);

  if (error) return [];

  const monthMap = new Map<number, number>();
  for (let i = 1; i <= 12; i++) monthMap.set(i, 0);

  for (const row of data) {
    if (monthMap.has(row.month)) {
      monthMap.set(row.month, monthMap.get(row.month)! + row.salary);
    }
  }

  return Array.from(monthMap.entries()).map(([month, total]) => ({
    label: new Date(2025, month - 1).toLocaleString("default", {
      month: "short",
    }),
    value: total,
  }));
}
