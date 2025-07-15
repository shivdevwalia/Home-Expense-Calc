// import React from "react";
// import Sidebar from "../components/Sidebar";
// import { Box, Flex } from "@chakra-ui/react";
// import Topbar from "../components/Topbar";
// import Cards from "../components/Cards";
// import {
//   checkAndInsertAlerts,
//   getLastSixMonthsExpenses,
//   getMonthlyExpenseByCategory,
//   getMonthlySubcategoriesGroupedByCategory,
// } from "../lib/data";
// import ExpenseChart from "../components/ExpenseChart";
// import CategoryPieChart from "../components/CategoryPieChart";

// import AlertDropdown from "../components/AlertDropdown";

// async function Dashboard() {
//   await checkAndInsertAlerts();

//   const last6MonthsExpenses = await getLastSixMonthsExpenses();
//   const categoryExpenses = await getMonthlyExpenseByCategory();
//   const subcategoryMap = await getMonthlySubcategoriesGroupedByCategory();

//   return (
//     <Box bg="gray.100" minH="100vh">
//       <Topbar />
//       <Flex>
//         <Sidebar />

//         <Box flex={1} p={8} w={"80%"}>
//           <AlertDropdown />
//           <Cards />
//           <ExpenseChart expenses={last6MonthsExpenses} />
//           <CategoryPieChart
//             data={categoryExpenses}
//             subcategoryMap={subcategoryMap}
//           />
//         </Box>
//       </Flex>
//     </Box>
//   );
// }

// export default Dashboard;

//responsive

import React from "react";
import Sidebar from "../components/Sidebar";
import { Box, Flex } from "@chakra-ui/react";
import Topbar from "../components/Topbar";
import Cards from "../components/Cards";
import {
  checkAndInsertAlerts,
  getLastSixMonthsExpenses,
  getMonthlyExpenseByCategory,
  getMonthlySubcategoriesGroupedByCategory,
} from "../lib/data";
import ExpenseChart from "../components/ExpenseChart";
import CategoryPieChart from "../components/CategoryPieChart";
import AlertDropdown from "../components/AlertDropdown";

async function Dashboard() {
  await checkAndInsertAlerts();

  const last6MonthsExpenses = await getLastSixMonthsExpenses();
  const categoryExpenses = await getMonthlyExpenseByCategory();
  const subcategoryMap = await getMonthlySubcategoriesGroupedByCategory();

  return (
    <Box bg="gray.100" minH="100vh">
      <Topbar />
      <Flex>
        <Sidebar />
        
        <Box 
          flex={1} 
          p={{ base: 4, md: 8 }} 
          w={{ base: "100%", lg: "80%" }}
          ml={{ base: 0, lg: 0 }} // Remove left margin on mobile since sidebar is now a drawer
        >
          <AlertDropdown />
          <Cards />
          <ExpenseChart expenses={last6MonthsExpenses} />
          <CategoryPieChart
            data={categoryExpenses}
            subcategoryMap={subcategoryMap}
          />
        </Box>
      </Flex>
    </Box>
  );
}

export default Dashboard;