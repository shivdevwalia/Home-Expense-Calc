//responsive

"use client";

import { useState } from "react";
import { border, Box, Flex, Text } from "@chakra-ui/react";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
} from "chart.js";
import { getAbsencesPerPersonPerMonth } from "../lib/supabase/data.client";

ChartJS.register(
  ArcElement,
  Tooltip,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend
);

const COLORS = [
  "#4299E1",
  "#48BB78",
  "#F56565",
  "#ED8936",
  "#9F7AEA",
  "#0BC5EA",
  "#F6E05E",
  "#ED64A6",
  "#38B2AC",
  "#A0AEC0",
];

type CategoryPieChartProps = {
  data: {
    category: string;
    amount: number;
  }[];
  subcategoryMap: {
    [category: string]: {
      subcategory: string;
      amount: number;
    }[];
  };
};

export default function CategoryPieChart({
  data,
  subcategoryMap,
}: CategoryPieChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [absenceData, setAbsenceData] = useState<
    { person: string; monthlyCounts: { month: string; count: number }[] }[]
  >([]);

  const total = data.reduce((sum, d) => sum + d.amount, 0);

  const chartData = {
    labels: data.map((d) => d.category),
    datasets: [
      {
        data: data.map((d) => d.amount),
        backgroundColor: COLORS.slice(0, data.length),
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "80%",
    onClick: (_: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const label = data[index]?.category;
        setSelectedCategory(selectedCategory === label ? null : label);
        setSelectedSubcategory(null);
        setAbsenceData([]);
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const percent = ((value / total) * 100).toFixed(1);
            return `${context.label}: ₹${value.toLocaleString()} (${percent}%)`;
          },
        },
      },
    },
  };

  const subcategoryData = selectedCategory
    ? subcategoryMap[selectedCategory] || []
    : [];

  const subcategoryTotal = subcategoryData.reduce(
    (sum, d) => sum + d.amount,
    0
  );

  const subcategoryChartData = {
    labels: subcategoryData.map((d) => d.subcategory),
    datasets: [
      {
        data: subcategoryData.map((d) => d.amount),
        backgroundColor: COLORS.slice(0, subcategoryData.length),
        borderWidth: 0,
      },
    ],
  };

  // 1. Collect all unique months across all people
  const allMonthsSet = new Set<string>();
  absenceData.forEach((person) => {
    person.monthlyCounts.forEach((entry) => {
      allMonthsSet.add(entry.month);
    });
  });
  const allMonths = Array.from(allMonthsSet).sort(); // e.g., ["2025-02", "2025-03", ..., "2025-07"]

  // 2. Build aligned datasets with 0 for missing months
  const datasets = absenceData.map((personData, index) => {
    const monthToCount: Record<string, number> = {};
    personData.monthlyCounts.forEach(({ month, count }) => {
      monthToCount[month] = count;
    });

    const counts = allMonths.map((month) => monthToCount[month] || 0);

    return {
      label: personData.person,
      data: counts,
      borderColor: COLORS[index % COLORS.length],
      backgroundColor: COLORS[index % COLORS.length],
      fill: false,
      tension: 0.3,
      borderWidth: 1,
    };
  });

  // 3. Format labels like "Jul 2025"
  const labels = allMonths.map((month) =>
    new Date(`${month}-01`).toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    })
  );

  // 4. Final chart data
  const lineChartData = {
    labels,
    datasets,
  };

  return (
    <Box mt={8}>
      <Flex
        gap={6}
        align="flex-start"
        minH="400px"
        flexWrap="wrap"
        direction={{ base: "column", lg: "row" }}
      >
        {/* Main Category Pie */}
        <Box
          bg="white"
          borderRadius="lg"
          boxShadow="md"
          p={{ base: 4, md: 6 }}
          w={{ base: "100%", lg: "450px" }}
          flexShrink={0}
        >
          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" mb={4}>
            This Month's Expenses by Category
          </Text>
          <Box position="relative" display="flex" justifyContent="center">
            <Box
              w={{ base: "280px", md: "300px" }}
              h={{ base: "250px", md: "270px" }}
            >
              <Doughnut data={chartData} options={options} />
            </Box>
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-65%, -50%)"
              textAlign="center"
              pointerEvents="none"
            >
              <Text fontSize="sm" color="gray.500">
                Total
              </Text>
              <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold">
                ₹{total.toLocaleString()}
              </Text>
            </Box>
          </Box>

          <Flex mt={4} wrap="wrap" gap={4}>
            {data.map((item, index) => (
              <Flex
                key={item.category}
                align="center"
                gap={2}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === item.category ? null : item.category
                  )
                }
                cursor="pointer"
                p={2}
                borderRadius="md"
                bg={
                  selectedCategory === item.category ? "blue.50" : "transparent"
                }
                border={
                  selectedCategory === item.category
                    ? "1px solid"
                    : "1px solid transparent"
                }
                borderColor={
                  selectedCategory === item.category
                    ? "blue.200"
                    : "transparent"
                }
                transition="all 0.2s"
                _hover={{ bg: "gray.50" }}
              >
                <Box w="12px" h="12px" bg={COLORS[index]} borderRadius="full" />
                <Text fontSize="sm" fontWeight="medium">
                  {item.category}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Box>

        {/* Subcategory Chart */}
        {selectedCategory && subcategoryData.length > 0 && (
          <Box
            bg="white"
            borderRadius="lg"
            boxShadow="md"
            p={{ base: 4, md: 6 }}
            w={{ base: "100%", lg: "450px" }}
            flexShrink={0}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                {selectedCategory} Breakdown
              </Text>
              <Box
                as="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                  setAbsenceData([]);
                }}
                p={1}
                borderRadius="full"
                _hover={{ bg: "gray.100" }}
                cursor="pointer"
              >
                <Text fontSize="lg" color="gray.500">
                  ✕
                </Text>
              </Box>
            </Flex>

            <Box position="relative" display="flex" justifyContent="center">
              <Box
                w={{ base: "280px", md: "300px" }}
                h={{ base: "245px", md: "265px" }}
              >
                <Doughnut
                  data={subcategoryChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    cutout: "75%",
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context: any) => {
                            const value = context.parsed;
                            const percent = (
                              (value / subcategoryTotal) *
                              100
                            ).toFixed(1);
                            return `${
                              context.label
                            }: ₹${value.toLocaleString()} (${percent}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              </Box>
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-65%, -50%)"
                textAlign="center"
                pointerEvents="none"
              >
                <Text fontSize="sm" color="gray.500">
                  Subtotal
                </Text>
                <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold">
                  ₹{subcategoryTotal.toLocaleString()}
                </Text>
              </Box>
            </Box>

            <Flex mt={4} wrap="wrap" gap={4}>
              {subcategoryData.map((item, index) => (
                <Flex
                  key={item.subcategory}
                  align="center"
                  gap={2}
                  onClick={async () => {
                    if (selectedCategory === "Household Help") {
                      const raw = await getAbsencesPerPersonPerMonth(
                        item.subcategory
                      );
                      if (raw) {
                        const formatted = Object.values(raw).map((p) => ({
                          person: p.name,
                          monthlyCounts: Object.entries(p.monthly).map(
                            ([month, count]) => ({
                              month,
                              count,
                            })
                          ),
                        }));
                        setSelectedSubcategory(item.subcategory);
                        setAbsenceData(formatted);
                      }
                    } else {
                      setSelectedSubcategory(null);
                      setAbsenceData([]);
                    }
                  }}
                  cursor="pointer"
                  p={2}
                  borderRadius="md"
                  _hover={{ bg: "gray.100" }}
                  bg={
                    selectedSubcategory === item.subcategory
                      ? "blue.50"
                      : "transparent"
                  }
                >
                  <Box
                    w="12px"
                    h="12px"
                    bg={COLORS[index]}
                    borderRadius="full"
                  />
                  <Text fontSize="sm" fontWeight="medium">
                    {item.subcategory}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Box>
        )}
      </Flex>

      {/* Line Chart Outside Below Both Charts */}
      {selectedSubcategory && absenceData.length > 0 && (
        <Box
          mt={10}
          bg="white"
          borderRadius="lg"
          boxShadow="md"
          p={{ base: 4, md: 6 }}
          position="relative"
          w="100%"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold">
              Absences Over Last 6 Months – {selectedSubcategory}
            </Text>
            <Box
              as="button"
              onClick={() => {
                setSelectedSubcategory(null);
                setAbsenceData([]);
              }}
              p={1}
              borderRadius="full"
              _hover={{ bg: "gray.100" }}
              cursor="pointer"
            >
              <Text fontSize="lg" color="gray.500">
                ✕
              </Text>
            </Box>
          </Flex>
          <Box w="100%" h={{ base: "300px", md: "400px" }} overflowX="auto">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: {
                        size: 12,
                      },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        return `${context.dataset.label}: ${context.parsed.y}`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                      stepSize: 1,
                    },
                  },
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 0,
                    },
                  },
                },
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
