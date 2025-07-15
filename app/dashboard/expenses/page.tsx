"use client";

import React, { useEffect, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import Topbar from "@/app/components/Topbar";
import Sidebar from "@/app/components/Sidebar";
import ExpenseForm from "@/app/components/ExpenseForm";

import {
  getAllSubcategories,
  getCategories,
  getMonthlySubcategoriesGroupedByCategoryClient,
  getMonthlyExpenseByCategoryClient,
  getMonthlyPersonExpensesGrouped,
} from "@/app/lib/supabase/data.client";
import UserExpenses from "@/app/components/UserExpenses";

export interface Category {
  id: string;
  name: string;
}

export interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

export interface CategoryExpense {
  category: string;
  amount: number;
}

export interface SubcategoryMap {
  [category: string]: { id: string; subcategory: string; amount: number }[];
}

export default function ExpensePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>(
    []
  );
  const [expenseSubMap, setExpenseSubMap] = useState<SubcategoryMap>({});
  const [personSubMap, setPersonSubMap] = useState<SubcategoryMap>({});

  useEffect(() => {
    async function fetchInitialData() {
      const [cats, subs, catExp, expSubMap, personSubcategoryMap] =
        await Promise.all([
          getCategories(),
          getAllSubcategories(),
          getMonthlyExpenseByCategoryClient(),
          getMonthlySubcategoriesGroupedByCategoryClient(), // from `expenses` table
          getMonthlyPersonExpensesGrouped(), // from `person` table
        ]);

      setCategories(cats || []);
      setSubcategories(subs || []);
      setCategoryExpenses(catExp || []);
      setExpenseSubMap(expSubMap || {});
      // Transform array to SubcategoryMap if needed
      if (Array.isArray(personSubcategoryMap)) {
        const map: SubcategoryMap = {};
        personSubcategoryMap.forEach(
          (item: {
            category: string;
            subcategory: string;
            amount: number;
            id: string;
          }) => {
            if (!map[item.category]) {
              map[item.category] = [];
            }
            map[item.category].push({
              id: item.id,
              subcategory: item.subcategory,
              amount: item.amount,
            });
          }
        );
        setPersonSubMap(map);
      } else {
        setPersonSubMap(personSubcategoryMap || {});
      }
    }

    fetchInitialData();
  }, []);

  const normalizedCategoryExpenses = categoryExpenses.map((item: any) => ({
    category: item.category ?? item.label,
    amount: item.amount ?? item.value,
  }));

  return (
    <Box bg="gray.100" minH="100vh">
      <Topbar />
      <Flex>
        <Sidebar />
        <Box flex={1} p={8}>
          <ExpenseForm categories={categories} subcategories={subcategories} />
          <UserExpenses
            categoryExpenses={normalizedCategoryExpenses}
            expenseSubcategoryMap={expenseSubMap}
            personSubcategoryMap={personSubMap}
          />
        </Box>
      </Flex>
    </Box>
  );
}
