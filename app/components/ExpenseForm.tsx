"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createExpenseClient,
  getMonthlyExpenseBySubcategoryClient,
  getPeopleBySubcategoryClient,
  updateExpenseClient,
  createPersonClient,
  updatePersonSalary,
} from "../lib/supabase/data.client";

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

export default function ExpenseForm({
  categories,
  subcategories,
}: {
  categories: Category[];
  subcategories: Subcategory[];
}) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredSubcategories, setFilteredSubcategories] = useState<
    Subcategory[]
  >([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [amount, setAmount] = useState("");
  const [existingExpenseId, setExistingExpenseId] = useState<string | null>(
    null
  );
  const [people, setPeople] = useState<
    { id: string; name: string; salary: number }[]
  >([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [newPersonName, setNewPersonName] = useState("");

  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    setFilteredSubcategories(
      subcategories.filter((s) => s.category_id === selectedCategory)
    );
    setSelectedSubcategory("");
    setPeople([]);
    setSelectedPersonId("");
    setNewPersonName("");
  }, [selectedCategory, subcategories]);

  useEffect(() => {
    async function handleSubcategoryChange() {
      if (!selectedSubcategory) return;

      const existing = await getMonthlyExpenseBySubcategoryClient(
        selectedSubcategory
      );
      if (existing) {
        setAmount(existing.amount.toString());
        setExistingExpenseId(existing.id);
      } else {
        setAmount("");
        setExistingExpenseId(null);
      }

      const selectedCat = categories.find((c) => c.id === selectedCategory);
      if (selectedCat?.name.trim().toLowerCase() === "household help") {
        const peopleList = await getPeopleBySubcategoryClient(
          selectedSubcategory
        );
        setPeople(peopleList);
      } else {
        setPeople([]);
      }

      setSelectedPersonId("");
      setNewPersonName("");
    }

    handleSubcategoryChange();
  }, [selectedSubcategory]);

  const selectedCat = categories.find((c) => c.id === selectedCategory);
  const isHouseholdHelp =
    selectedCat?.name.trim().toLowerCase() === "household help";
  const showUpdateLabel =
    (!isHouseholdHelp && !!existingExpenseId) ||
    (isHouseholdHelp && !!selectedPersonId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedCategory || !selectedSubcategory || !amount) {
      toast({
        title: "All fields required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (isHouseholdHelp) {
        if (!selectedPersonId && !newPersonName) {
          toast({
            title: "Please select or enter a name",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        // if (newPersonName) {
        //   const created = await createPersonClient({
        //     name: newPersonName,
        //     subcategory_id: selectedSubcategory,
        //     salary: parseFloat(amount),
        //   });

        //   if (!created?.id) {
        //     toast({ title: "Failed to add person", status: "error" });
        //     return;
        //   }

        //   toast({ title: "Person added", status: "success", isClosable: true });
        // }

        if (newPersonName) {
          const nameExists = people.some(
            (p) =>
              p.name.trim().toLowerCase() === newPersonName.trim().toLowerCase()
          );

          if (nameExists) {
            toast({
              title: "Duplicate name",
              description:
                "A person with this name already exists in this subcategory.",
              status: "warning",
              duration: 3000,
              isClosable: true,
            });
            return;
          }

          const created = await createPersonClient({
            name: newPersonName,
            subcategory_id: selectedSubcategory,
            salary: parseFloat(amount),
          });

          if (!created?.id) {
            toast({ title: "Failed to add person", status: "error" });
            return;
          }

          toast({ title: "Person added", status: "success", isClosable: true });
        }

        if (selectedPersonId) {
          await updatePersonSalary(selectedPersonId, parseFloat(amount));
          toast({
            title: "Salary updated",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        if (existingExpenseId) {
          await updateExpenseClient(existingExpenseId, parseFloat(amount));
          toast({
            title: "Expense updated",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          await createExpenseClient({
            subcategory_id: selectedSubcategory,
            amount: parseFloat(amount),
            date: new Date().toISOString(),
          });
          toast({
            title: "Expense added",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      }

      setSelectedCategory("");
      setSelectedSubcategory("");
      setAmount("");
      setSelectedPersonId("");
      setNewPersonName("");
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Could not save expense",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  return (
    <Box
      maxW="600px"
      mx="auto"
      mt={10}
      p={6}
      bg="white"
      borderRadius="md"
      boxShadow="md"
    >
      <Text fontSize="xl" mb={4} fontWeight="semibold">
        {showUpdateLabel ? "Update" : "Add"} Expense
      </Text>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Category</FormLabel>
            <Select
              placeholder="Select category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Subcategory</FormLabel>
            <Select
              placeholder="Select subcategory"
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
            >
              {filteredSubcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </Select>
          </FormControl>

          {isHouseholdHelp && (
            <>
              <FormControl>
                <FormLabel>Select existing person</FormLabel>
                <Select
                  placeholder="Select person"
                  value={selectedPersonId}
                  isDisabled={newPersonName.trim().length > 0}
                  onChange={(e) => {
                    const personId = e.target.value;
                    setSelectedPersonId(personId);
                    const p = people.find((p) => p.id === personId);
                    if (p) {
                      setAmount(p.salary.toString());
                      setNewPersonName("");
                    }
                  }}
                >
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Or Add New Person</FormLabel>
                <Input
                  placeholder="Enter new name"
                  value={newPersonName}
                  isDisabled={!!selectedPersonId}
                  onChange={(e) => {
                    setNewPersonName(e.target.value);
                    setSelectedPersonId("");
                  }}
                />
              </FormControl>
            </>
          )}

          <FormControl isRequired>
            <FormLabel>Amount (₹)</FormLabel>
            <Input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </FormControl>

          <Button type="submit" colorScheme="blue">
            {showUpdateLabel ? "Update Expense" : "Add Expense"}
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
