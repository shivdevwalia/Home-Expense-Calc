import Overdue from "@/app/components/Overdue";
import Reports from "@/app/components/Reports";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { Box, Flex } from "@chakra-ui/react";
import React from "react";

function ReportsPage() {
  return (
    <Box bg="gray.100" minH="100vh">
      <Topbar />
      <Flex>
        <Sidebar />
        <Box flex={1} p={8} gap={20}>
          <Flex direction="column" gap={10}>
            <Overdue />
            <Reports />
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

export default ReportsPage;
