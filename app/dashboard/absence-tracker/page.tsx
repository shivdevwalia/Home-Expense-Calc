import HelpNavbar from "@/app/components/HelpNavbar";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { getHouseHelpRolesForCurrentUser } from "@/app/lib/data";
import { Box, Flex } from "@chakra-ui/react";
import React from "react";

async function AbsencePage() {
  const houseRoles = await getHouseHelpRolesForCurrentUser();
  return (
    <Box bg="white" minH="100vh">
      <Topbar />
      <Box h="1px" bg="gray.200" boxShadow="sm" w="100%" />
      <Flex>
        <Sidebar />
        <Box flex={1} p={8}>
          <HelpNavbar houseRoles={houseRoles}></HelpNavbar>
          
        </Box>
      </Flex>
    </Box>
  );
}

export default AbsencePage;
