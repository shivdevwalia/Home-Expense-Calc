import { Box, Flex, Text } from "@chakra-ui/react";
import { Wallet, DollarSign, ArrowDownCircle } from "lucide-react";
import React from "react";
import {
  getAverageMonthlyExpense,
  getCurrentMonthExpense,
  getTotalOverdueAmount,
} from "../lib/data";

import Link from "next/link";

export default async function Cards() {
  const currentMonthExpense = await getCurrentMonthExpense();
  const monthlyAverageExpense = await getAverageMonthlyExpense();
  const totalOverdueAmount = await getTotalOverdueAmount();

  const CardItem = ({
    label,
    amount,
    icon,
    bg,
    showAmount = true,
  }: {
    label: string;
    amount: number;
    icon: React.ReactNode;
    bg: string;
    showAmount?: boolean;
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
      <Flex
        flexDirection="row"
        align="center"
        width="100%"
        p={3}
        gap={3}
        boxShadow="md"
      >
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
          <Text
            fontWeight="semibold"
            color="gray.800"
            fontSize={{ base: "sm", md: "md" }}
            noOfLines={2}
          >
            {label}
          </Text>
          {showAmount && (
            <Text
              fontWeight="bold"
              color="black"
              fontSize={{ base: "md", md: "lg" }}
              noOfLines={1}
            >
              ₹{amount.toLocaleString()}
            </Text>
          )}
        </Flex>
      </Flex>
    </Flex>
  );

  return (
    <Flex
      flexDirection={{ base: "column", md: "row" }}
      mt={4}
      gap={{ base: 0, md: 4 }}
      justify={{ base: "flex-start", md: "space-between" }}
      align={{ base: "stretch", md: "center" }}
    >
      <CardItem
        label="Current Month Expense"
        amount={currentMonthExpense}
        icon={<ArrowDownCircle size={20} color="white" />}
        bg="red"
      />

      <CardItem
        label="Total Overdue Payments"
        amount={totalOverdueAmount}
        icon={<DollarSign size={20} color="white" />}
        bg="#E53E3E"
      />

      <Link href="/dashboard/expenses" style={{ width: "100%" }}>
        <CardItem
          amount={currentMonthExpense}
          showAmount={false}
          label="Manage Expenses"
          icon={<Wallet size={20} color="white" />}
          bg="rgb(0, 112, 243)"
        />
      </Link>
    </Flex>
  );
}
