// "use client";

// import React, { useEffect, useState } from "react";
// import { Box, Flex, Text } from "@chakra-ui/react";
// import { DollarSign, Clock, History } from "lucide-react";
// import { getOverdueAmountByRange, getTotalOverdueAmount } from "../lib/supabase/data.client";


// const CardItem = ({
//   label,
//   amount,
//   icon,
//   bg,
// }: {
//   label: string;
//   amount: number;
//   icon: React.ReactNode;
//   bg: string;
// }) => (
//   <Flex
//     justify="flex-start"
//     align="center"
//     bg="white"
//     borderRadius="10px"
//     w="100%"
//     maxW={{ base: "100%", md: "300px" }}
//     mb={{ base: 4, md: 0 }}
//   >
//     <Flex
//       flexDirection="row"
//       align="center"
//       width="100%"
//       p={3}
//       gap={3}
//       boxShadow="md"
//     >
//       <Box
//         bg={bg}
//         borderRadius="full"
//         p={3}
//         display="flex"
//         alignItems="center"
//         justifyContent="center"
//         boxShadow="md"
//         flexShrink={0}
//       >
//         {icon}
//       </Box>
//       <Flex flexDirection="column" flex={1} minW={0}>
//         <Text
//           fontWeight="semibold"
//           color="gray.800"
//           fontSize={{ base: "sm", md: "md" }}
//           noOfLines={2}
//         >
//           {label}
//         </Text>
//         <Text
//           fontWeight="bold"
//           color="black"
//           fontSize={{ base: "md", md: "lg" }}
//           noOfLines={1}
//         >
//           ₹{amount.toLocaleString()}
//         </Text>
//       </Flex>
//     </Flex>
//   </Flex>
// );

// export default function Overdue() {
//   const [total, setTotal] = useState(0);
//   const [overdue30, setOverdue30] = useState(0);
//   const [overdue60, setOverdue60] = useState(0);

//   useEffect(() => {
//     async function fetchData() {
//       const totalAmount = await getTotalOverdueAmount();
//       const overdue_0_30 = await getOverdueAmountByRange(0, 30);
//       const overdue_30_60 = await getOverdueAmountByRange(30, 60);

//       setTotal(totalAmount);
//       setOverdue30(overdue_0_30);
//       setOverdue60(overdue_30_60);
//     }

//     fetchData();
//   }, []);

//   return (
//     <Flex
//       flexDirection={{ base: "column", md: "row" }}
//       mt={4}
//       gap={{ base: 0, md: 4 }}
//       justify={{ base: "flex-start", md: "space-between" }}
//       align={{ base: "stretch", md: "center" }}
//     >
//       <CardItem
//         label="Total Overdue Payments"
//         amount={total}
//         icon={<DollarSign size={20} color="white" />}
//         bg="#E53E3E"
//       />
//       <CardItem
//         label="Overdue: 0–30 Days"
//         amount={overdue30}
//         icon={<Clock size={20} color="white" />}
//         bg="#D69E2E"
//       />
//       <CardItem
//         label="Overdue: 30–60 Days"
//         amount={overdue60}
//         icon={<History size={20} color="white" />}
//         bg="#3182CE"
//       />
//     </Flex>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  Collapse,
  Flex,
  IconButton,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { DollarSign, Clock, History } from "lucide-react";
import {
  getOverdueAmountByRange,
  getTotalOverdueAmount,
  getGroupedOverduePayments,
  markOverdueAsPaid,
} from "../lib/supabase/data.client";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";

const CardItem = ({
  label,
  amount,
  icon,
  bg,
}: {
  label: string;
  amount: number;
  icon: React.ReactNode;
  bg: string;
}) => (
  <Flex
    justify="flex-start"
    align="center"
    bg="white"
    borderRadius="10px"
    w="100%"
    maxW={{ base: "100%", md: "300px" }}
    mb={{ base: 4, md: 0 }}
  >
    <Flex flexDirection="row" align="center" width="100%" p={3} gap={3} boxShadow="md">
      <Box
        bg={bg}
        borderRadius="full"
        p={3}
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxShadow="md"
        flexShrink={0}
      >
        {icon}
      </Box>
      <Flex flexDirection="column" flex={1} minW={0}>
        <Text fontWeight="semibold" color="gray.800" fontSize={{ base: "sm", md: "md" }}>
          {label}
        </Text>
        <Text fontWeight="bold" color="black" fontSize={{ base: "md", md: "lg" }}>
          ₹{amount.toLocaleString()}
        </Text>
      </Flex>
    </Flex>
  </Flex>
);

export default function Overdue() {
  const [total, setTotal] = useState(0);
  const [overdue30, setOverdue30] = useState(0);
  const [overdue60, setOverdue60] = useState(0);
  const [overdueGroups, setOverdueGroups] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchAll = async () => {
    setLoading(true);
    const [totalAmount, overdue_0_30, overdue_30_60, groups] = await Promise.all([
      getTotalOverdueAmount(),
      getOverdueAmountByRange(0, 30),
      getOverdueAmountByRange(30, 60),
      getGroupedOverduePayments(),
    ]);
    setTotal(totalAmount);
    setOverdue30(overdue_0_30);
    setOverdue60(overdue_30_60);
    setOverdueGroups(groups);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handlePaid = async (id: string) => {
    try {
      await markOverdueAsPaid(id);
      toast({
        title: "Marked as Paid",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      fetchAll(); // refresh totals and list
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box mt={6}>
      {/* Summary Cards */}
      <Flex
        flexDirection={{ base: "column", md: "row" }}
        gap={{ base: 2, md: 4 }}
        justify="space-between"
        align="stretch"
        mb={6}
      >
        <CardItem label="Total Overdue Payments" amount={total} icon={<DollarSign size={20} color="white" />} bg="#E53E3E" />
        <CardItem label="Overdue: 0–30 Days" amount={overdue30} icon={<Clock size={20} color="white" />} bg="#D69E2E" />
        <CardItem label="Overdue: 30–60 Days" amount={overdue60} icon={<History size={20} color="white" />} bg="#3182CE" />
      </Flex>

      {/* Overdue Groups */}
      <Box bg="white" borderRadius="md" p={6} boxShadow="md">
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Overdue Payments
        </Text>

        {loading ? (
          <Flex justify="center" py={6}>
            <Spinner />
          </Flex>
        ) : (
          <VStack align="stretch" spacing={4}>
            {overdueGroups.map((group) => (
              <Box key={group.groupLabel} border="1px solid #e2e8f0" borderRadius="md">
                <Flex
                  align="center"
                  justify="space-between"
                  p={3}
                  bg={expanded === group.groupLabel ? "gray.100" : "white"}
                  cursor="pointer"
                  onClick={() =>
                    setExpanded(expanded === group.groupLabel ? null : group.groupLabel)
                  }
                >
                  <Text fontWeight="medium">{group.groupLabel}</Text>
                  <IconButton
                    aria-label="toggle"
                    icon={
                      expanded === group.groupLabel ? (
                        <ChevronDownIcon />
                      ) : (
                        <ChevronRightIcon />
                      )
                    }
                    size="sm"
                    variant="ghost"
                  />
                </Flex>

                <Collapse in={expanded === group.groupLabel}>
                  <Box p={3} pl={6}>
                    {group.items.map((item: any) => (
                      <Flex key={item.id} justify="space-between" align="center" py={1}>
                        <Text>
                          {`${new Date(item.year, item.month - 1).toLocaleString("default", {
                            month: "long",
                            year: "numeric",
                          })} — ₹${item.amount}`}
                        </Text>
                        <Checkbox
                          isChecked={item.paid}
                          onChange={() => handlePaid(item.id)}
                          isDisabled={item.paid}
                          colorScheme="green"
                        >
                          {item.paid ? "Paid" : "Mark as Paid"}
                        </Checkbox>
                      </Flex>
                    ))}
                  </Box>
                </Collapse>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
}
