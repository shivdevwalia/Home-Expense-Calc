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

//         <Box
//           flex={1}
//           p={{ base: 4, md: 8 }}
//           w={{ base: "100%", lg: "80%" }}
//           ml={{ base: 0, lg: 0 }} // Remove left margin on mobile since sidebar is now a drawer
//         >
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


import React, { Suspense } from "react";
import Sidebar from "../components/Sidebar";
import { 
  Box, 
  Flex, 
  Skeleton, 
  SkeletonText, 
  VStack, 
  HStack,
  Spinner,
  Text,
  SimpleGrid,
  Circle
} from "@chakra-ui/react";
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

// Loading component for the main dashboard content
const DashboardLoading = () => (
  <Box bg="gray.100" minH="100vh">
    <Topbar />
    <Flex>
      <Sidebar />
      
      <Box
        flex={1}
        p={{ base: 4, md: 8 }}
        w={{ base: "100%", lg: "80%" }}
        ml={{ base: 0, lg: 0 }}
      >
        {/* Loading state for AlertDropdown */}
        <Box mb={6}>
          <Skeleton height="40px" width="200px" borderRadius="md" />
        </Box>

        {/* Loading state for Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {[1, 2, 3, 4].map((item) => (
            <Box
              key={item}
              p={6}
              bg="white"
              borderRadius="lg"
              boxShadow="sm"
              border="1px"
              borderColor="gray.200"
            >
              <VStack spacing={3} align="stretch">
                <Skeleton height="20px" width="60%" />
                <Skeleton height="32px" width="80%" />
                <HStack justify="space-between">
                  <Skeleton height="16px" width="40%" />
                  <Skeleton height="16px" width="30%" />
                </HStack>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        {/* Loading state for ExpenseChart */}
        <Box 
          bg="white" 
          p={6} 
          borderRadius="lg" 
          boxShadow="sm"
          border="1px"
          borderColor="gray.200"
          mb={8}
        >
          <VStack spacing={4}>
            <Skeleton height="24px" width="200px" />
            <Box position="relative" width="100%" height="400px">
              <Skeleton height="100%" width="100%" borderRadius="md" />
              <Flex 
                position="absolute" 
                top="50%" 
                left="50%" 
                transform="translate(-50%, -50%)"
                align="center"
                gap={3}
              >
                <Spinner size="md" color="blue.500" />
                <Text color="gray.600" fontSize="sm">Loading chart...</Text>
              </Flex>
            </Box>
          </VStack>
        </Box>

        {/* Loading state for CategoryPieChart */}
        <Box 
          bg="white" 
          p={6} 
          borderRadius="lg" 
          boxShadow="sm"
          border="1px"
          borderColor="gray.200"
        >
          <VStack spacing={4}>
            <Skeleton height="24px" width="180px" />
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} width="100%">
              {/* Pie chart loading */}
              <Box position="relative" height="300px">
                <Circle size="300px" bg="gray.100" position="relative">
                  <Flex 
                    position="absolute" 
                    top="50%" 
                    left="50%" 
                    transform="translate(-50%, -50%)"
                    align="center"
                    gap={3}
                  >
                    <Spinner size="md" color="purple.500" />
                    <Text color="gray.600" fontSize="sm">Loading pie chart...</Text>
                  </Flex>
                </Circle>
              </Box>
              
              {/* Legend loading */}
              <VStack spacing={3} align="stretch">
                {[1, 2, 3, 4, 5].map((item) => (
                  <HStack key={item} spacing={3}>
                    <Skeleton height="16px" width="16px" borderRadius="sm" />
                    <Skeleton height="16px" flex={1} />
                    <Skeleton height="16px" width="60px" />
                  </HStack>
                ))}
              </VStack>
            </SimpleGrid>
          </VStack>
        </Box>
      </Box>
    </Flex>
  </Box>
);

// Main dashboard content component
const DashboardContent = async () => {
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
          ml={{ base: 0, lg: 0 }}
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
};

// Main Dashboard component with Suspense
function Dashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}

export default Dashboard;