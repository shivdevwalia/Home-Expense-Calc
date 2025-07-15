

// "use client";

// import {
//   Box,
//   Flex,
//   Heading,
//   Select,
//   Spinner,
//   Text,
//   useToast,
// } from "@chakra-ui/react";
// import {
//   Chart as ChartJS,
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
//   ArcElement,
// } from "chart.js";
// import { Bar, Doughnut, Pie } from "react-chartjs-2";
// import { useEffect, useState } from "react";
// import {
//   getAvailableYearsClient,
//   getExpensesByYearClient,
//   getExpenseCategoryForMonthYear,
// } from "@/app/lib/supabase/data.client";
// import { supabase } from "@/app/lib/supabase/client";

// ChartJS.register(
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
//   ArcElement
// );

// type MonthlyPoint = { label: string; value: number };
// type CategoryData = { category: string; amount: number };

// export default function Reports() {
//   const toast = useToast();
//   const [years, setYears] = useState<number[]>([]);
//   const [selectedYear, setSelectedYear] = useState<number | null>(null);
//   const [monthly, setMonthly] = useState<MonthlyPoint[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
//   const [categoryData, setCategoryData] = useState<CategoryData[] | null>(null);
//   const [loadingPie, setLoadingPie] = useState(false);

//   const fetchYears = async (userId: string) => {
//     const yrs = await getAvailableYearsClient(userId);
//     setYears(yrs);
//     if (yrs.length) setSelectedYear(yrs[yrs.length - 1]);
//   };

//   const fetchMonthly = async (userId: string, year: number) => {
//     setLoading(true);
//     const data = await getExpensesByYearClient(userId, year);
//     setMonthly(data);
//     setLoading(false);
//   };

//   useEffect(() => {
//     (async () => {
//       const {
//         data: { user },
//         error,
//       } = await supabase.auth.getUser();
//       if (error || !user) {
//         toast({ title: "Auth error", status: "error" });
//         return;
//       }
//       await fetchYears(user.id);
//     })();
//   }, []);

//   useEffect(() => {
//     (async () => {
//       if (!selectedYear) return;
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) return;
//       await fetchMonthly(user.id, selectedYear);
//     })();
//   }, [selectedYear]);

//   const chartData = {
//     labels: monthly.map((m) => m.label),
//     datasets: [
//       {
//         label: `Expenses – ${selectedYear ?? ""}`,
//         data: monthly.map((m) => m.value),
//         backgroundColor: "rgb(0,112,243)",
//         borderRadius: 4,
//         barThickness: 30,
//       },
//     ],
//   };

//   const handleBarClick = async (event: any, elements: any[]) => {
//     if (!elements.length || !selectedYear) return;
//     const index = elements[0].index;
//     const monthLabel = chartData.labels[index];
//     const monthMap: Record<string, number> = {
//       Jan: 1,
//       Feb: 2,
//       Mar: 3,
//       Apr: 4,
//       May: 5,
//       Jun: 6,
//       Jul: 7,
//       Aug: 8,
//       Sep: 9,
//       Oct: 10,
//       Nov: 11,
//       Dec: 12,
//     };
//     const monthNum = monthMap[monthLabel.slice(0, 3)] || index + 1;

//     setSelectedMonth(monthNum);
//     setLoadingPie(true);
//     const categoryResult = await getExpenseCategoryForMonthYear(
//       monthNum,
//       selectedYear
//     );
//     setCategoryData(categoryResult);
//     setLoadingPie(false);
//   };

//   const pieData = {
//     labels: categoryData?.map((c) => c.category) || [],
//     datasets: [
//       {
//         label: "Category Breakdown",
//         data: categoryData?.map((c) => c.amount) || [],
//         backgroundColor: [
//           "#0070f3",
//           "#facc15",
//           "#ef4444",
//           "#10b981",
//           "#8b5cf6",
//           "#f97316",
//         ],
//         borderWidth: 1,
//       },
//     ],
//   };

//   return (
//     <Box>
//       <Box bg="white" p={6} borderRadius="md" boxShadow="md">
//         <Flex
//           justify="space-between"
//           align="center"
//           flexWrap="wrap"
//           gap={4}
//           mb={4}
//         >
//           <Heading size="md">Monthly Expenses Report</Heading>
//           <Select
//             w="120px"
//             value={selectedYear ?? ""}
//             onChange={(e) => setSelectedYear(parseInt(e.target.value))}
//           >
//             {years.map((y) => (
//               <option key={y} value={y}>
//                 {y}
//               </option>
//             ))}
//           </Select>
//         </Flex>

//         {loading ? (
//           <Flex justify="center" py={16}>
//             <Spinner size="lg" />
//           </Flex>
//         ) : (
//           <Box h="400px" position="relative">
//             <Bar
//               data={chartData}
//               options={{
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 onClick: handleBarClick,
//                 plugins: {
//                   legend: { display: false },
//                 },
//                 scales: {
//                   y: {
//                     beginAtZero: true,
//                     ticks: { precision: 0 },
//                   },
//                 },
//               }}
//             />
//           </Box>
//         )}
//       </Box>

//       {selectedMonth && categoryData && (
//         <Box mt={8}>
//           <Flex
//             gap={6}
//             align="flex-start"
//             minH="400px"
//             flexWrap="wrap"
//             direction={{ base: "column", lg: "row" }}
//           >
//             <Box
//               bg="white"
//               borderRadius="lg"
//               boxShadow="md"
//               p={{ base: 4, md: 6 }}
//               w={{ base: "100%", lg: "450px" }}
//               flexShrink={0}
//             >
//               {/* Header + Close button */}
//               <Flex justify="space-between" align="center" mb={4}>
//                 <Heading fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
//                   {new Date(selectedYear!, selectedMonth - 1).toLocaleString(
//                     "default",
//                     { month: "long" }
//                   )}{" "}
//                   {selectedYear} Expenses by Category
//                 </Heading>
//                 <Box
//                   as="button"
//                   onClick={() => {
//                     setSelectedMonth(null);
//                     setCategoryData(null);
//                   }}
//                   p={1}
//                   borderRadius="full"
//                   _hover={{ bg: "gray.100" }}
//                   cursor="pointer"
//                 >
//                   <Text fontSize="lg" color="gray.500">
//                     ✕
//                   </Text>
//                 </Box>
//               </Flex>

//               {loadingPie ? (
//                 <Flex justify="center" py={8}>
//                   <Spinner />
//                 </Flex>
//               ) : (
//                 <Box position="relative" display="flex" justifyContent="center">
//                   <Box
//                     w={{ base: "280px", md: "300px" }}
//                     h={{ base: "250px", md: "270px" }}
//                   >
//                     <Doughnut
//                       data={pieData}
//                       options={{
//                         responsive: true,
//                         cutout: "70%",
//                         plugins: {
//                           legend: { display: false },
//                         },
//                       }}
//                     />
//                   </Box>

//                   {/* Center Total in donut */}
//                   <Box
//                     position="absolute"
//                     top="50%"
//                     left="50%"
//                     transform="translate(-50%, -50%)"
//                     textAlign="center"
//                     pointerEvents="none"
//                   >
//                     <Box>
//                       <Box fontSize="sm" color="gray.500">
//                         Total
//                       </Box>
//                       <Box
//                         fontSize={{ base: "lg", md: "2xl" }}
//                         fontWeight="bold"
//                       >
//                         ₹
//                         {categoryData
//                           .reduce((sum, c) => sum + c.amount, 0)
//                           .toLocaleString()}
//                       </Box>
//                     </Box>
//                   </Box>
//                 </Box>
//               )}

//               {/* Category legend */}
//               <Flex mt={4} wrap="wrap" gap={3}>
//                 {categoryData.map((item, index) => (
//                   <Flex
//                     key={item.category}
//                     align="center"
//                     gap={2}
//                     p={2}
//                     borderRadius="md"
//                     bg="gray.50"
//                     _hover={{ bg: "gray.100" }}
//                   >
//                     <Box
//                       w="12px"
//                       h="12px"
//                       bg={pieData.datasets[0].backgroundColor[index]}
//                       borderRadius="full"
//                     />
//                     <Box fontSize="sm" fontWeight="medium">
//                       {item.category}
//                     </Box>
//                   </Flex>
//                 ))}
//               </Flex>
//             </Box>
//           </Flex>
//         </Box>
//       )}
//     </Box>
//   );
// }


"use client";

import {
  Box,
  Flex,
  Heading,
  Select,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useEffect, useState } from "react";
import {
  getAvailableYearsClient,
  getExpensesByYearClient,
  getExpenseCategoryForMonthYear,
  getSubcategoryBreakdownForMonthYear, //  ← NEW
} from "@/app/lib/supabase/data.client";
import { supabase } from "@/app/lib/supabase/client";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
);

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
type MonthlyPoint = { label: string; value: number };
type CategoryData = { category: string; amount: number };
type SubcategoryData = { subcategory: string; amount: number };

// ────────────────────────────────────────────
export default function Reports() {
  // ───── basic state ─────
  const toast = useToast();
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [monthly, setMonthly] = useState<MonthlyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // ───── category‑level pie ─────
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryData[] | null>(null);
  const [loadingPie, setLoadingPie] = useState(false);

  // ───── sub‑category pie ─────
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subcategoryData, setSubcategoryData] =
    useState<SubcategoryData[] | null>(null);
  const [loadingSubPie, setLoadingSubPie] = useState(false);

  // ────────────────────────────────────────────
  // Fetch helpers
  // ────────────────────────────────────────────
  const fetchYears = async (userId: string) => {
    const yrs = await getAvailableYearsClient(userId);
    setYears(yrs);
    if (yrs.length) setSelectedYear(yrs[yrs.length - 1]);
  };

  const fetchMonthly = async (userId: string, year: number) => {
    setLoading(true);
    const data = await getExpensesByYearClient(userId, year);
    setMonthly(data);
    setLoading(false);
  };

  // ────────────────────────────────────────────
  // Initial load
  // ────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        toast({ title: "Auth error", status: "error" });
        return;
      }
      await fetchYears(user.id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when year changes
  useEffect(() => {
    (async () => {
      if (!selectedYear) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await fetchMonthly(user.id, selectedYear);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  // ────────────────────────────────────────────
  // Chart Data objects
  // ────────────────────────────────────────────
  const barData = {
    labels: monthly.map((m) => m.label),
    datasets: [
      {
        label: `Expenses – ${selectedYear ?? ""}`,
        data: monthly.map((m) => m.value),
        backgroundColor: "rgb(0,112,243)",
        borderRadius: 4,
        barThickness: 30,
      },
    ],
  };

  const catPieData = {
    labels: categoryData?.map((c) => c.category) ?? [],
    datasets: [
      {
        label: "Category Breakdown",
        data: categoryData?.map((c) => c.amount) ?? [],
        backgroundColor: [
          "#0070f3",
          "#facc15",
          "#ef4444",
          "#10b981",
          "#8b5cf6",
          "#f97316",
          "#14b8a6",
          "#8b5cf6",
          "#eab308",
          "#f472b6",
        ],
        borderWidth: 1,
      },
    ],
  };

  const subPieData = {
    labels: subcategoryData?.map((s) => s.subcategory) ?? [],
    datasets: [
      {
        label: "Sub‑category Breakdown",
        data: subcategoryData?.map((s) => s.amount) ?? [],
        backgroundColor: [
          "#38bdf8",
          "#a78bfa",
          "#fb7185",
          "#34d399",
          "#fbbf24",
          "#f97316",
          "#818cf8",
        ],
        borderWidth: 1,
      },
    ],
  };

  // ────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────
  const handleBarClick = async (_: any, elements: any[]) => {
    if (!elements.length || !selectedYear) return;

    // month index
    const idx = elements[0].index;
    const monthNum = idx + 1; // 0‑based to 1‑based
    setSelectedMonth(monthNum);
    setSelectedCategory(null); // reset any open sub pie
    setSubcategoryData(null);

    setLoadingPie(true);
    const res = await getExpenseCategoryForMonthYear(monthNum, selectedYear);
    setCategoryData(res);
    setLoadingPie(false);
  };

  const handleCategorySliceClick = async (_: any, elements: any[]) => {
    if (
      !elements.length ||
      !categoryData ||
      !selectedMonth ||
      !selectedYear
    ) {
      return;
    }

    // Which category slice?
    const idx = elements[0].index;
    const cat = catPieData.labels[idx] as string;

    // Toggle logic
    if (selectedCategory === cat) {
      setSelectedCategory(null);
      setSubcategoryData(null);
      return;
    }

    setSelectedCategory(cat);
    setLoadingSubPie(true);

    const fullBreakdown = await getSubcategoryBreakdownForMonthYear(
      selectedMonth,
      selectedYear
    );
    setSubcategoryData(fullBreakdown[cat] ?? []);
    setLoadingSubPie(false);
  };

  // ────────────────────────────────────────────
  // JSX
  // ────────────────────────────────────────────
  return (
    <Box>
      {/* ───────── Bar Chart ───────── */}
      <Box bg="white" p={6} borderRadius="md" boxShadow="md">
        <Flex
          justify="space-between"
          align="center"
          flexWrap="wrap"
          gap={4}
          mb={4}
        >
          <Heading size="md">Monthly Expenses Report</Heading>
          <Select
            w="120px"
            value={selectedYear ?? ""}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </Flex>

        {loading ? (
          <Flex justify="center" py={16}>
            <Spinner size="lg" />
          </Flex>
        ) : (
          <Box h="400px" position="relative">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                onClick: handleBarClick,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
              }}
            />
          </Box>
        )}
      </Box>

      {/* ───────── Category Pie ───────── */}
      {selectedMonth && categoryData && (
        <Box mt={8}>
          <Flex
            gap={6}
            align="flex-start"
            flexWrap="wrap"
            direction={{ base: "column", lg: "row" }}
          >
            {/* Category Pie Box */}
            <Box
              bg="white"
              borderRadius="lg"
              boxShadow="md"
              p={{ base: 4, md: 6 }}
              w={{ base: "100%", lg: "450px" }}
              flexShrink={0}
            >
              {/* header */}
              <Flex justify="space-between" align="center" mb={4}>
                <Heading fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                  {new Date(
                    selectedYear!,
                    selectedMonth - 1
                  ).toLocaleString("default", { month: "long" })}{" "}
                  {selectedYear} Expenses by Category
                </Heading>
                <Box
                  as="button"
                  onClick={() => {
                    setSelectedMonth(null);
                    setCategoryData(null);
                    setSelectedCategory(null);
                    setSubcategoryData(null);
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

              {loadingPie ? (
                <Flex justify="center" py={8}>
                  <Spinner />
                </Flex>
              ) : (
                <Box position="relative" display="flex" justifyContent="center">
                  <Box
                    w={{ base: "280px", md: "300px" }}
                    h={{ base: "250px", md: "270px" }}
                  >
                    <Doughnut
                      data={catPieData}
                      options={{
                        responsive: true,
                        cutout: "70%",
                        plugins: { legend: { display: false } },
                        onClick: handleCategorySliceClick, // ← click!
                      }}
                    />
                  </Box>

                  {/* total in center */}
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    textAlign="center"
                    pointerEvents="none"
                  >
                    <Text fontSize="sm" color="gray.500">
                      Total
                    </Text>
                    <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold">
                      ₹
                      {categoryData
                        .reduce((s, c) => s + c.amount, 0)
                        .toLocaleString()}
                    </Text>
                  </Box>
                </Box>
              )}

              {/* legend */}
              <Flex mt={4} wrap="wrap" gap={3}>
                {categoryData.map((c, i) => (
                  <Flex
                    key={c.category}
                    align="center"
                    gap={2}
                    p={2}
                    borderRadius="md"
                    bg="gray.50"
                    _hover={{ bg: "gray.100" }}
                  >
                    <Box
                      w="12px"
                      h="12px"
                      bg={catPieData.datasets[0].backgroundColor[i] as string}
                      borderRadius="full"
                    />
                    <Text fontSize="sm">{c.category}</Text>
                  </Flex>
                ))}
              </Flex>
            </Box>

            {/* Sub‑category Pie Box (only if a slice is selected) */}
            {selectedCategory && subcategoryData && (
              <Box
                bg="white"
                borderRadius="lg"
                boxShadow="md"
                p={{ base: 4, md: 6 }}
                w={{ base: "100%", lg: "450px" }}
                flexShrink={0}
              >
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading
                    fontSize={{ base: "lg", md: "xl" }}
                    fontWeight="bold"
                  >
                    {selectedCategory} Breakdown
                  </Heading>
                  <Box
                    as="button"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSubcategoryData(null);
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

                {loadingSubPie ? (
                  <Flex justify="center" py={8}>
                    <Spinner />
                  </Flex>
                ) : (
                  <Box
                    position="relative"
                    display="flex"
                    justifyContent="center"
                  >
                    <Box
                      w={{ base: "280px", md: "300px" }}
                      h={{ base: "245px", md: "265px" }}
                    >
                      <Doughnut
                        data={subPieData}
                        options={{
                          responsive: true,
                          cutout: "70%",
                          plugins: { legend: { display: false } },
                        }}
                      />
                    </Box>

                    {/* subtotal label */}
                    <Box
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      textAlign="center"
                      pointerEvents="none"
                    >
                      <Text fontSize="sm" color="gray.500">
                        Subtotal
                      </Text>
                      <Text
                        fontSize={{ base: "lg", md: "2xl" }}
                        fontWeight="bold"
                      >
                        ₹
                        {subcategoryData
                          .reduce((s, sc) => s + sc.amount, 0)
                          .toLocaleString()}
                      </Text>
                    </Box>
                  </Box>
                )}

                {/* sub‑legend */}
                <Flex mt={4} wrap="wrap" gap={3}>
                  {subcategoryData.map((s, i) => (
                    <Flex
                      key={s.subcategory}
                      align="center"
                      gap={2}
                      p={2}
                      borderRadius="md"
                      bg="gray.50"
                      _hover={{ bg: "gray.100" }}
                    >
                      <Box
                        w="12px"
                        h="12px"
                        bg={
                          subPieData.datasets[0].backgroundColor[i] as string
                        }
                        borderRadius="full"
                      />
                      <Text fontSize="sm">{s.subcategory}</Text>
                    </Flex>
                  ))}
                </Flex>
              </Box>
            )}
          </Flex>
        </Box>
      )}
    </Box>
  );
}
