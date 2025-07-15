// components/ExpenseChart.tsx
"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { getAverageMonthlyExpenseClient } from "../lib/supabase/data.client";
import { useEffect, useState } from "react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ExpenseChart({
  expenses,
}: {
  expenses: { label: string; value: number }[];
}) {
  const chartData = {
    labels: expenses.map((e) => e.label),
    datasets: [
      {
        label: "Expenses",
        data: expenses.map((e) => e.value),
        backgroundColor: "rgb(0, 112, 243)",
        borderRadius: 5,
        barThickness: 40,
      },
    ],
  };
const [avgExpense, setAvgExpense] = useState(0);
  useEffect(() => {

    async function fetchData() {

      const avgExpense = await  getAverageMonthlyExpenseClient();
      setAvgExpense(avgExpense);
    }

    fetchData();
  }, []);

  

  return (
    <Box bg="white" mt={8} p={6} borderRadius="md" boxShadow="md">
      <Flex justify={"space-between"}>
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Last 6 Months Expenses
        </Text>
        <Text fontSize="sm" fontWeight="semibold" color={"black"} mb={4}>
          Monthly Average Expense: ₹{avgExpense.toLocaleString()}
        </Text>
      </Flex>
      <Bar data={chartData} options={{ responsive: true }} />
    </Box>
  );
}
