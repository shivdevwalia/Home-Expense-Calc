"use client";
import HelpNavbar from "@/app/components/HelpNavbar";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import {
  getAdvancesForPerson,
  getAbsencesCount,
  getDeductableAbsencesCount,
  getHouseHelpRolesForCurrentUser,
  getHouseHelpSalary,
} from "@/app/lib/supabase/data.client";

import {
  Box,
  Flex,
  Text,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

type Person = {
  id: string;
  name: string;
  subcategoryName: string;
  personIdentityId: string;
};

type PersonInfo = {
  id: string;
  name: string;
  role: string;
  subcategory: string;
  salary: number;
  totalAbsences: number;
  deductableAbsences: number;
  advances: number;
  presentSalary: number;
  personIdentityId: string;
};

export default function OverviewPage() {
  const [houseRoles, setHouseRoles] = useState<Person[]>([]);
  const [personDetails, setPersonDetails] = useState<PersonInfo[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();

  const loadData = async () => {
    const roles = await getHouseHelpRolesForCurrentUser();
    setHouseRoles(roles);

    const data: PersonInfo[] = await Promise.all(
      roles.map(async (person) => {
        const [salary, totalAbsences, deductableAbsences, advancesList] =
          await Promise.all([
            getHouseHelpSalary(person.id),
            getAbsencesCount(person.id),
            getDeductableAbsencesCount(person.id),
            getAdvancesForPerson(person.id),
          ]);

        const totalAdvances = advancesList.reduce(
          (sum, a) => sum + a.amount,
          0
        );

        const presentSalary =
          salary - deductableAbsences * (salary / daysInMonth) - totalAdvances;

        return {
          id: person.id,
          name: person.name,
          role: person.subcategoryName,
          subcategory: person.subcategoryName,
          salary,
          totalAbsences,
          deductableAbsences,
          advances: totalAdvances,
          presentSalary: Math.max(0, Math.round(presentSalary)),
          personIdentityId: person.personIdentityId,
        };
      })
    );

    setPersonDetails(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Box bg="white" minH="100vh">
      <Topbar />
      <Box h="1px" bg="gray.200" boxShadow="sm" w="100%" />
      <Flex>
        <Sidebar />
        <Box flex={1} p={8}>
          {!selectedPerson ? (
            <>
              <Text fontSize="2xl" fontWeight="bold" mb={6}>
                Household Help Overview
              </Text>
              <Table variant="simple" size="md">
                <Thead bg="gray.100">
                  <Tr>
                    <Th borderRight="1px solid #e2e8f0">Role</Th>
                    <Th borderRight="1px solid #e2e8f0">Name</Th>
                    <Th isNumeric borderRight="1px solid #e2e8f0">
                      Total Salary
                    </Th>
                    <Th isNumeric>Present Salary</Th>
                    <Th isNumeric borderRight="1px solid #e2e8f0">
                      Total Absences
                    </Th>
                    <Th isNumeric borderRight="1px solid #e2e8f0">
                      Deductible Absences
                    </Th>
                    <Th isNumeric borderRight="1px solid #e2e8f0">
                      Advances
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {personDetails.map((person) => (
                    <Tr
                      key={person.id}
                      _hover={{ bg: "gray.50", cursor: "pointer" }}
                      onClick={() =>
                        setSelectedPerson({
                          id: person.id,
                          name: person.name,
                          subcategoryName: person.subcategory,
                          personIdentityId: person.personIdentityId,
                        })
                      }
                    >
                      <Td borderRight="1px solid #edf2f7">{person.role}</Td>
                      <Td
                        color="blue.600"
                        fontWeight="semibold"
                        borderRight="1px solid #edf2f7"
                      >
                        {person.name}
                      </Td>
                      <Td isNumeric borderRight="1px solid #edf2f7">
                        ₹{person.salary}
                      </Td>
                      <Td isNumeric>₹{person.presentSalary}</Td>
                      <Td isNumeric borderRight="1px solid #edf2f7">
                        {person.totalAbsences}
                      </Td>
                      <Td isNumeric borderRight="1px solid #edf2f7">
                        {person.deductableAbsences}
                      </Td>
                      <Td isNumeric borderRight="1px solid #edf2f7">
                        ₹{person.advances}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </>
          ) : (
            <>
              <Text
                fontSize="lg"
                fontWeight="bold"
                color="gray.600"
                mb={4}
                cursor="pointer"
                onClick={() => {
                  setSelectedPerson(null);
                  loadData(); // Refresh data when going back to overview
                }}
              >
                ← Back to Overview
              </Text>
              <HelpNavbar selectedPerson={selectedPerson} />
            </>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
