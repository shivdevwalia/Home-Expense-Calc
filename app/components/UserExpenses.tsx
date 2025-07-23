"use client";

import {
  Box,
  Collapse,
  Flex,
  IconButton,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import { deleteExpense, deletePersonById } from "../lib/supabase/data.client";

type SubcategoryMap = {
  [category: string]: {
    subcategory: string;
    amount: number;
    id: string;
  }[];
};

type ExpenseBreakdownProps = {
  categoryExpenses: {
    category: string;
    amount: number;
  }[];
  expenseSubcategoryMap: SubcategoryMap;
  personSubcategoryMap: SubcategoryMap;
};

export default function UserExpenses({
  categoryExpenses,
  expenseSubcategoryMap,
  personSubcategoryMap,
}: ExpenseBreakdownProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const toast = useToast();

  return (
    <Box mt={10} bg="white" borderRadius="md" p={6} boxShadow="md">
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Monthly Expense Breakdown
      </Text>

      <VStack align="stretch" spacing={4}>
        {categoryExpenses.map(({ category, amount }) => {
          let subs: {
            id: string;
            subcategory: string;
            amount: number;
          }[] = [];

          if (category === "Household Help") {
            const personSubs = personSubcategoryMap[category] || [];

            // ✅ Only include well-formed "Role - Name" labels
            subs = personSubs.filter((p) => p.subcategory.includes(" - "));
          } else {
            // All other categories (like Utilities)
            subs = expenseSubcategoryMap[category] || [];
          }

          return (
            <Box key={category} border="1px solid #e2e8f0" borderRadius="md">
              <Flex
                align="center"
                justify="space-between"
                p={3}
                cursor={subs.length ? "pointer" : "default"}
                bg={openCategory === category ? "gray.100" : "white"}
                onClick={() =>
                  subs.length
                    ? setOpenCategory(
                        openCategory === category ? null : category
                      )
                    : null
                }
              >
                <Text fontWeight="medium">
                  {category} — ₹{amount.toLocaleString()}
                </Text>
                {subs.length > 0 ? (
                  <IconButton
                    aria-label="toggle"
                    icon={
                      openCategory === category ? (
                        <ChevronDownIcon />
                      ) : (
                        <ChevronRightIcon />
                      )
                    }
                    size="sm"
                    variant="ghost"
                  />
                ) : (
                  <Text fontSize="sm" color="gray.400">
                    No subcategories
                  </Text>
                )}
              </Flex>

              <Collapse in={openCategory === category}>
                <Box p={3} pl={6}>
                  {subs.map((sub) => (
                    <Flex
                      key={sub.id}
                      justify="space-between"
                      align="center"
                      py={1}
                    >
                      <Text>{sub.subcategory}</Text>
                      <Flex align="center" gap={3}>
                        <Text fontWeight="medium">
                          ₹{sub.amount.toLocaleString()}
                        </Text>
                        <IconButton
                          aria-label="Delete"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              if (
                                personSubcategoryMap[category]?.some(
                                  (p) => p.id === sub.id
                                )
                              ) {
                                await deletePersonById(sub.id);
                              } else {
                                await deleteExpense(sub.id);
                              }

                              toast({
                                title: "Deleted",
                                description: `${sub.subcategory} was removed.`,
                                status: "success",
                                duration: 2000,
                                isClosable: true,
                              });
                            } catch (err: any) {
                              toast({
                                title: "Delete failed",
                                description: err.message,
                                status: "error",
                                duration: 3000,
                                isClosable: true,
                              });
                            }
                          }}
                        />
                      </Flex>
                    </Flex>
                  ))}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
}
