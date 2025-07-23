// import { Flex, Text } from "@chakra-ui/react";
// import React from "react";

// function Topbar() {
//   return (
//     <Flex
//       bg="white"
//       px={6}
//       py={4}
//       align="center"
//       w="100%"
//       top={0}
//       zIndex={1}
//       position={"sticky"}
//     >
//       <Text fontSize="xl" fontWeight="bold">
//         Expense Tracker
//       </Text>
//     </Flex>
//   );
// }

// export default Topbar;

//responsive
import { Box, Flex, Text } from "@chakra-ui/react";
import React from "react";

function Topbar() {
  return (
    <Flex
      bg="white"
      px={{ base: 4, md: 6 }}
      py={4}
      align="center"
      justify="space-between"
      w="100%"
      top={0}
      zIndex={100}
      position="sticky"
    >
      <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
        Home Expense Calculator
      </Text>

      {/* This space is reserved for the mobile menu button */}
      <Box w={{ base: "40px", lg: "0" }} />
    </Flex>
  );
}

export default Topbar;
