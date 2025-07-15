import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import {
  getAdvancesForPerson,
  deleteAdvanceById,
} from "../lib/supabase/data.client";

function AdvancesSection({ personId }: { personId: string }) {
  const [advances, setAdvances] = useState<
    { id: string; amount: number; note: string }[]
  >([]);

  const fetchAdvances = async () => {
    const data = await getAdvancesForPerson(personId);
    setAdvances(data);
  };

  const handleDelete = async (id: string) => {
    await deleteAdvanceById(id);
    await fetchAdvances();
  };

  useEffect(() => {
    if (personId) fetchAdvances();
  }, [personId]);

  return (
    <Box mt={8} border="1px solid" borderColor="gray.200" p={6} borderRadius="md" bg="white">
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          Advances
        </Text>
        <Button
          bg={"rgb(0, 112, 243)"}
          color={"white"}
          size="sm"
          _hover={{ bg: "blue.600" }}
        >
          Add Advance
        </Button>
      </Flex>

      <VStack spacing={4} align="stretch">
        {advances.length === 0 && (
          <Text color="gray.500" fontSize="sm">
            No advances this month.
          </Text>
        )}
        {advances.map((advance) => (
          <Box
            key={advance.id}
            p={4}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            boxShadow="sm"
            bg="white"
          >
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="semibold" fontSize="md">
                  ₹{advance.amount}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {advance.note || "No note"}
                </Text>
              </Box>
              <HStack>
                <IconButton
                  aria-label="Edit"
                  icon={<EditIcon />}
                  size="sm"
                  variant="ghost"
                />
                <IconButton
                  aria-label="Delete"
                  icon={<DeleteIcon />}
                  size="sm"
                  variant="ghost"
                  color="red.500"
                  onClick={() => handleDelete(advance.id)}
                />
              </HStack>
            </Flex>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default AdvancesSection;
