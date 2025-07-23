// "use client";
// import {
//   Box,
//   Button,
//   Checkbox,
//   Flex,
//   HStack,
//   IconButton,
//   Input,
//   InputGroup,
//   InputLeftAddon,
//   Text,
//   useToast,
//   VStack,
// } from "@chakra-ui/react";
// import React, { useEffect, useState } from "react";
// import {
//   addAbsence,
//   addAdvanceForPerson,
//   deleteAdvanceById,
//   getAbsencesCount,
//   getAbsencesForMonth,
//   getAdvancesForPerson,
//   getDeductableAbsencesCount,
//   getHouseHelpSalary,
//   removeAbsence,
//   updateAdvanceById,
// } from "../lib/supabase/data.client";
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";
// import { DeleteIcon, EditIcon } from "lucide-react";

// type SelectedPerson = {
//   id: string;
//   name: string;
//   subcategoryName: string;
// };

// function HelpNavbar({ selectedPerson }: { selectedPerson: SelectedPerson }) {
//   const [salary, setSalary] = useState<number>(0);
//   const [absences, setAbsences] = useState<number>(0);
//   const [deductable, setDeductable] = useState<number>(0);
//   const [deduct, setDeduct] = useState<boolean>(false);
//   const [selectedDate, setSelectedDate] = useState<Date[]>([]);
//   const [originalAbsences, setOriginalAbsences] = useState<Date[]>([]);
//   const toast = useToast();

//   // Advances state
//   const [isAddingAdvance, setIsAddingAdvance] = useState(false);
//   const [newAdvanceNote, setNewAdvanceNote] = useState("");
//   const [editingAdvanceId, setEditingAdvanceId] = useState<string | null>(null);
//   const [newAdvanceAmount, setNewAdvanceAmount] = useState<string>("");
//   const [editingAmount, setEditingAmount] = useState<string>("");
//   const [editingNote, setEditingNote] = useState("");
//   const [advanceTotal, setAdvanceTotal] = useState<number>(0);
//   const [advances, setAdvances] = useState<
//     { id: string; amount: number; note: string; date: string }[]
//   >([]);

//   async function fetchDetails() {
//     if (!selectedPerson?.id) return;

//     const [fetchedSalary, fetchedAbsences, fetchedDeductable] =
//       await Promise.all([
//         getHouseHelpSalary(selectedPerson.id),
//         getAbsencesCount(selectedPerson.id),
//         getDeductableAbsencesCount(selectedPerson.id),
//       ]);

//     const absentDates = await getAbsencesForMonth(selectedPerson.id);
//     setOriginalAbsences(absentDates);
//     setSelectedDate(absentDates);

//     setSalary(fetchedSalary);
//     setAbsences(fetchedAbsences);
//     setDeductable(fetchedDeductable);
//   }

//   const fetchAdvances = async () => {
//     if (!selectedPerson?.id) return;

//     const data = await getAdvancesForPerson(selectedPerson.id);
//     setAdvances(data);
//     const totalAdvanceAmount = data.reduce((sum, adv) => sum + adv.amount, 0);
//     setAdvanceTotal(totalAdvanceAmount);
//   };

//   useEffect(() => {
//     if (selectedPerson?.id) {
//       fetchDetails();
//       fetchAdvances();
//     }
//   }, [selectedPerson?.id]);

//   const handleDateClick = (date: Date) => {
//     const found = selectedDate.find(
//       (d) => d.toDateString() === date.toDateString()
//     );
//     if (found) {
//       setSelectedDate((prev) =>
//         prev.filter((d) => d.toDateString() !== date.toDateString())
//       );
//     } else {
//       setSelectedDate((prev) => [...prev, date]);
//     }
//   };

//   const handleConfirm = async () => {
//     const added = selectedDate.filter(
//       (d) =>
//         !originalAbsences.some((o) => o.toDateString() === d.toDateString())
//     );
//     const removed = originalAbsences.filter(
//       (d) => !selectedDate.some((s) => s.toDateString() === d.toDateString())
//     );

//     try {
//       for (const date of added) {
//         await addAbsence(selectedPerson.id, date, deduct);
//       }
//       for (const date of removed) {
//         await removeAbsence(selectedPerson.id, date);
//       }
//       toast({ title: "Updated absences", status: "success" });
//       await fetchDetails();
//     } catch (err) {
//       toast({ title: "Error updating", status: "error" });
//     }
//     setDeduct(false);
//   };

//   const handleCancel = () => {
//     setSelectedDate(originalAbsences);
//     setDeduct(false);
//   };

//   const tileClassName = ({ date }: { date: Date }) => {
//     return selectedDate.some((d) => d.toDateString() === date.toDateString())
//       ? "absent-day"
//       : "";
//   };

//   const handleEditAdvance = (advance: {
//     id: string;
//     amount: number;
//     note: string;
//   }) => {
//     setEditingAdvanceId(advance.id);
//     setEditingAmount(advance.amount.toString());
//     setEditingNote(advance.note || "");
//   };

//   const handleSaveEdit = async () => {
//     if (!editingAdvanceId || !editingAmount)
//       return toast({ title: "Amount is required", status: "warning" });

//     try {
//       await updateAdvanceById(
//         editingAdvanceId,
//         parseFloat(editingAmount),
//         editingNote
//       );
//       toast({ title: "Advance updated", status: "success" });
//       setEditingAdvanceId(null);
//       setEditingAmount("");
//       setEditingNote("");
//       fetchAdvances();
//     } catch (err) {
//       toast({ title: "Error updating advance", status: "error" });
//     }
//   };

//   const handleCancelEdit = () => {
//     setEditingAdvanceId(null);
//     setEditingAmount("");
//     setEditingNote("");
//   };

//   const handleSaveAdvance = async () => {
//     if (!newAdvanceAmount)
//       return toast({ title: "Amount is required", status: "warning" });
//     try {
//       await addAdvanceForPerson(
//         selectedPerson.id,
//         parseFloat(newAdvanceAmount),
//         newAdvanceNote
//       );
//       await fetchAdvances();
//       setIsAddingAdvance(false);
//       setNewAdvanceAmount("");
//       setNewAdvanceNote("");
//       toast({ title: "Advance added", status: "success" });
//     } catch (err) {
//       toast({ title: "Error adding advance", status: "error" });
//     }
//   };

//   const handleCancelAdvance = () => {
//     setIsAddingAdvance(false);
//     setNewAdvanceAmount("");
//     setNewAdvanceNote("");
//   };

//   const handleDeleteAdvance = async (id: string) => {
//     await deleteAdvanceById(id);
//     await fetchAdvances();
//   };

//   const now = new Date();
//   const daysInMonth = new Date(
//     now.getFullYear(),
//     now.getMonth() + 1,
//     0
//   ).getDate();

//   const presentSalary =
//     salary && daysInMonth
//       ? salary - deductable * (salary / daysInMonth) - advanceTotal
//       : 0;

//   return (
//     <Box>
//       {/* Person Header */}
//       <Box mb={6}>
//         <Text fontSize="2xl" fontWeight="bold" color="gray.800">
//           {selectedPerson.name}
//         </Text>
//         <Text fontSize="lg" color="gray.600">
//           {selectedPerson.subcategoryName}
//         </Text>
//       </Box>

//       {/* Cards */}
//       <Flex
//         flexDirection={{ base: "column", md: "row" }}
//         gap={6}
//         flexWrap="wrap"
//         mb={8}
//       >
//         <Box
//           p={6}
//           bg="gradient-to-br from-blue-50 to-blue-100"
//           borderRadius="xl"
//           shadow="sm"
//           border="1px solid"
//           borderColor="blue.200"
//           minW="200px"
//           flex="1"
//           _hover={{
//             shadow: "md",
//             transform: "translateY(-2px)",
//           }}
//           transition="all 0.2s ease"
//         >
//           <Text fontSize="sm" color="blue.600" fontWeight="semibold" mb={2}>
//             TOTAL SALARY
//           </Text>
//           <Text fontSize="3xl" fontWeight="bold" color="blue.800">
//             ₹{salary.toLocaleString()}
//           </Text>
//         </Box>

//         <Box
//           p={6}
//           bg="gradient-to-br from-green-50 to-green-100"
//           borderRadius="xl"
//           shadow="sm"
//           border="1px solid"
//           borderColor="green.200"
//           minW="200px"
//           flex="1"
//           _hover={{
//             shadow: "md",
//             transform: "translateY(-2px)",
//           }}
//           transition="all 0.2s ease"
//         >
//           <Text fontSize="sm" color="green.600" fontWeight="semibold" mb={2}>
//             THIS MONTH SALARY
//           </Text>
//           <Text fontSize="3xl" fontWeight="bold" color="green.800">
//             ₹{Math.max(0, Math.round(presentSalary)).toLocaleString()}
//           </Text>
//         </Box>

//         <Box
//           p={6}
//           bg="gradient-to-br from-orange-50 to-orange-100"
//           borderRadius="xl"
//           shadow="sm"
//           border="1px solid"
//           borderColor="orange.200"
//           minW="200px"
//           flex="1"
//           _hover={{
//             shadow: "md",
//             transform: "translateY(-2px)",
//           }}
//           transition="all 0.2s ease"
//         >
//           <Text fontSize="sm" color="orange.600" fontWeight="semibold" mb={2}>
//             ABSENCES
//           </Text>
//           <Text fontSize="3xl" fontWeight="bold" color="orange.800">
//             {absences}
//           </Text>
//           <Text fontSize="sm" color="orange.500" mt={1}>
//             days this month
//           </Text>
//         </Box>
//       </Flex>

//       {/* Advances Section */}
//       <Box
//         mt={8}
//         border="1px solid"
//         borderColor="gray.200"
//         p={6}
//         borderRadius="md"
//         bg="white"
//       >
//         <Flex justify="space-between" align="center" mb={4}>
//           <Text fontSize="xl" fontWeight="bold">
//             Advances
//           </Text>
//           <Button
//             bg="rgb(0, 112, 243)"
//             color="white"
//             size="sm"
//             onClick={() => setIsAddingAdvance(true)}
//             _hover={{ bg: "blue.600" }}
//             isDisabled={isAddingAdvance}
//           >
//             Add Advance
//           </Button>
//         </Flex>

//         <VStack spacing={4} align="stretch">
//           {advances.length === 0 && !isAddingAdvance && (
//             <Text color="gray.500" fontSize="sm">
//               No advances given.
//             </Text>
//           )}

//           {advances.map((advance) => (
//             <Box
//               key={advance.id}
//               p={4}
//               border="1px solid"
//               borderColor="gray.200"
//               borderRadius="md"
//               boxShadow="sm"
//               bg="white"
//             >
//               {editingAdvanceId === advance.id ? (
//                 <Flex align="center" gap={4} flexWrap="wrap">
//                   <InputGroup maxW="160px">
//                     <InputLeftAddon children="₹" />
//                     <Input
//                       type="text"
//                       placeholder="Amount"
//                       value={editingAmount}
//                       onChange={(e) => setEditingAmount(e.target.value)}
//                     />
//                   </InputGroup>

//                   <Input
//                     placeholder="Note"
//                     value={editingNote}
//                     onChange={(e) => setEditingNote(e.target.value)}
//                     flex={1}
//                   />
//                   <HStack>
//                     <Button
//                       size="sm"
//                       colorScheme="green"
//                       onClick={handleSaveEdit}
//                     >
//                       Save
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="ghost"
//                       onClick={handleCancelEdit}
//                     >
//                       Cancel
//                     </Button>
//                   </HStack>
//                 </Flex>
//               ) : (
//                 <Flex justify="space-between" align="center">
//                   <Box>
//                     <Text fontWeight="semibold" fontSize="md">
//                       ₹{advance.amount}
//                     </Text>
//                     <Text fontSize="sm" color="gray.600">
//                       {advance.note || "No note"}
//                     </Text>
//                     <Text fontSize="sm" color="gray.500">
//                       {advance.date
//                         ? new Date(advance.date).toLocaleDateString()
//                         : ""}
//                     </Text>
//                   </Box>
//                   <HStack>
//                     <IconButton
//                       aria-label="Edit"
//                       icon={<EditIcon />}
//                       size="sm"
//                       variant="ghost"
//                       onClick={() => handleEditAdvance(advance)}
//                     />
//                     <IconButton
//                       aria-label="Delete"
//                       icon={<DeleteIcon />}
//                       size="sm"
//                       variant="ghost"
//                       color="red.500"
//                       onClick={() => handleDeleteAdvance(advance.id)}
//                     />
//                   </HStack>
//                 </Flex>
//               )}
//             </Box>
//           ))}

//           {isAddingAdvance && (
//             <Box
//               p={4}
//               border="1px dashed"
//               borderColor="gray.300"
//               borderRadius="md"
//               bg="gray.50"
//             >
//               <Flex align="center" gap={4} flexWrap="wrap">
//                 <InputGroup maxW="160px">
//                   <InputLeftAddon children="₹" />
//                   <Input
//                     type="text"
//                     placeholder="Amount"
//                     value={newAdvanceAmount}
//                     onChange={(e) => setNewAdvanceAmount(e.target.value)}
//                   />
//                 </InputGroup>

//                 <Input
//                   placeholder="Note"
//                   value={newAdvanceNote}
//                   onChange={(e) => setNewAdvanceNote(e.target.value)}
//                   flex={1}
//                 />
//                 <HStack>
//                   <Button
//                     size="sm"
//                     colorScheme="green"
//                     onClick={handleSaveAdvance}
//                   >
//                     Save
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="ghost"
//                     onClick={handleCancelAdvance}
//                   >
//                     Cancel
//                   </Button>
//                 </HStack>
//               </Flex>
//             </Box>
//           )}
//         </VStack>
//       </Box>

//       {/* Calendar + Actions */}
//       <Box
//         mt={6}
//         p={6}
//         border="1px solid"
//         borderColor="gray.200"
//         borderRadius="xl"
//         boxShadow="sm"
//         bg="white"
//         _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
//         transition="all 0.2s ease"
//       >
//         <Text fontSize="xl" fontWeight="bold" mb={4} color="gray.700">
//           Select Absent Days
//         </Text>

//         <Box
//           bg="gray.50"
//           borderRadius="lg"
//           p={4}
//           display="flex"
//           justifyContent="center"
//           overflowX="auto"
//           mx="auto"
//           boxShadow="xs"
//         >
//           <Calendar
//             onClickDay={handleDateClick}
//             tileClassName={tileClassName}
//           />
//         </Box>

//         <Checkbox
//           mt={6}
//           isChecked={deduct}
//           onChange={(e) => setDeduct(e.target.checked)}
//           colorScheme="red"
//         >
//           Deduct Salary?
//         </Checkbox>

//         <Flex mt={6} gap={4} justify="flex-end" flexWrap="wrap">
//           <Button onClick={handleConfirm} colorScheme="blue">
//             Confirm
//           </Button>
//           <Button onClick={handleCancel} variant="outline">
//             Cancel
//           </Button>
//         </Flex>

//         <style>{`
//           .react-calendar__tile {
//             border-radius: 50%;
//           }

//           .react-calendar__tile--now {
//             background: #edf2f7 !important;
//             color: #1a202c !important;
//           }

//           .react-calendar__tile--active {
//             background: none !important;
//             color: inherit !important;
//           }

//           .absent-day {
//             background: #feb2b2 !important;
//             color: #742a2a !important;
//             border-radius: 10% !important;
//           }

//           .react-calendar__tile:enabled:hover {
//             background: #e2e8f0;
//           }
//         `}</style>
//       </Box>
//     </Box>
//   );
// }

// export default HelpNavbar;

"use client";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  Text,
  Heading,
  Select,
  Spinner,
  useToast,
  VStack,
} from "@chakra-ui/react";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  getYearsForPersonIdentity,
  getMonthlyDataForPersonIdentity,
} from "@/app/lib/supabase/data.client";
import React, { useEffect, useState } from "react";
import {
  addAbsence,
  addAdvanceForPerson,
  deleteAdvanceById,
  getAbsencesCount,
  getAbsencesForMonth,
  getAdvancesForPerson,
  getDeductableAbsencesCount,
  getHouseHelpSalary,
  removeAbsence,
  updateAdvanceById,
} from "../lib/supabase/data.client";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { DeleteIcon, EditIcon } from "lucide-react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type SelectedPerson = {
  id: string;
  name: string;
  subcategoryName: string;
  personIdentityId: string;
};

function HelpNavbar({ selectedPerson }: { selectedPerson: SelectedPerson }) {
  const [salary, setSalary] = useState<number>(0);
  const [absences, setAbsences] = useState<number>(0);
  const [deductable, setDeductable] = useState<number>(0);
  const [deduct, setDeduct] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date[]>([]);
  const [originalAbsences, setOriginalAbsences] = useState<Date[]>([]);
  const toast = useToast();

  // Advances state
  const [isAddingAdvance, setIsAddingAdvance] = useState(false);
  const [newAdvanceNote, setNewAdvanceNote] = useState("");
  const [editingAdvanceId, setEditingAdvanceId] = useState<string | null>(null);
  const [newAdvanceAmount, setNewAdvanceAmount] = useState<string>("");
  const [editingAmount, setEditingAmount] = useState<string>("");
  const [editingNote, setEditingNote] = useState("");
  const [advanceTotal, setAdvanceTotal] = useState<number>(0);
  const [advances, setAdvances] = useState<
    { id: string; amount: number; note: string; date: string }[]
  >([]);

  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [monthlyData, setMonthlyData] = useState<
    { label: string; value: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const personIdentityId = selectedPerson.personIdentityId;

  const barData = {
    labels: monthlyData.map((d) => d.label),
    datasets: [
      {
        label: `Monthly Salary – ${selectedYear}`,
        data: monthlyData.map((d) => d.value),
        backgroundColor: "rgb(0,112,243)",
        borderRadius: 4,
        barThickness: 30,
      },
    ],
  };

  useEffect(() => {
    (async () => {
      const result = await getYearsForPersonIdentity(personIdentityId);
      setYears(result);
      if (result.length > 0) setSelectedYear(result[result.length - 1]);
    })();
  }, [personIdentityId]);

  // fetch monthly data
  useEffect(() => {
    if (!selectedYear) return;
    setLoading(true);
    (async () => {
      const data = await getMonthlyDataForPersonIdentity(
        personIdentityId,
        selectedYear
      );
      setMonthlyData(data);
      setLoading(false);
    })();
  }, [selectedYear, personIdentityId]);

  async function fetchDetails() {
    if (!selectedPerson?.id) return;

    const [fetchedSalary, fetchedAbsences, fetchedDeductable] =
      await Promise.all([
        getHouseHelpSalary(selectedPerson.id),
        getAbsencesCount(selectedPerson.id),
        getDeductableAbsencesCount(selectedPerson.id),
      ]);

    const absentDates = await getAbsencesForMonth(selectedPerson.id);
    setOriginalAbsences(absentDates);
    setSelectedDate(absentDates);

    setSalary(fetchedSalary);
    setAbsences(fetchedAbsences);
    setDeductable(fetchedDeductable);
  }

  const fetchAdvances = async () => {
    if (!selectedPerson?.id) return;

    const data = await getAdvancesForPerson(selectedPerson.id);
    setAdvances(data);
    const totalAdvanceAmount = data.reduce((sum, adv) => sum + adv.amount, 0);
    setAdvanceTotal(totalAdvanceAmount);
  };

  useEffect(() => {
    if (selectedPerson?.id) {
      fetchDetails();
      fetchAdvances();
    }
  }, [selectedPerson?.id]);

  const handleDateClick = (date: Date) => {
    const found = selectedDate.find(
      (d) => d.toDateString() === date.toDateString()
    );
    if (found) {
      setSelectedDate((prev) =>
        prev.filter((d) => d.toDateString() !== date.toDateString())
      );
    } else {
      setSelectedDate((prev) => [...prev, date]);
    }
  };

  const handleConfirm = async () => {
    const added = selectedDate.filter(
      (d) =>
        !originalAbsences.some((o) => o.toDateString() === d.toDateString())
    );
    const removed = originalAbsences.filter(
      (d) => !selectedDate.some((s) => s.toDateString() === d.toDateString())
    );

    try {
      for (const date of added) {
        await addAbsence(selectedPerson.id, date, deduct);
      }
      for (const date of removed) {
        await removeAbsence(selectedPerson.id, date);
      }
      toast({ title: "Updated absences", status: "success" });
      await fetchDetails();
    } catch (err) {
      toast({ title: "Error updating", status: "error" });
    }
    setDeduct(false);
  };

  const handleCancel = () => {
    setSelectedDate(originalAbsences);
    setDeduct(false);
  };

  const tileClassName = ({ date }: { date: Date }) => {
    return selectedDate.some((d) => d.toDateString() === date.toDateString())
      ? "absent-day"
      : "";
  };

  const handleEditAdvance = (advance: {
    id: string;
    amount: number;
    note: string;
  }) => {
    setEditingAdvanceId(advance.id);
    setEditingAmount(advance.amount.toString());
    setEditingNote(advance.note || "");
  };

  const handleSaveEdit = async () => {
    if (!editingAdvanceId || !editingAmount)
      return toast({ title: "Amount is required", status: "warning" });

    try {
      await updateAdvanceById(
        editingAdvanceId,
        parseFloat(editingAmount),
        editingNote
      );
      toast({ title: "Advance updated", status: "success" });
      setEditingAdvanceId(null);
      setEditingAmount("");
      setEditingNote("");
      fetchAdvances();
    } catch (err) {
      toast({ title: "Error updating advance", status: "error" });
    }
  };

  const handleCancelEdit = () => {
    setEditingAdvanceId(null);
    setEditingAmount("");
    setEditingNote("");
  };

  const handleSaveAdvance = async () => {
    if (!newAdvanceAmount)
      return toast({ title: "Amount is required", status: "warning" });
    try {
      await addAdvanceForPerson(
        selectedPerson.id,
        parseFloat(newAdvanceAmount),
        newAdvanceNote
      );
      await fetchAdvances();
      setIsAddingAdvance(false);
      setNewAdvanceAmount("");
      setNewAdvanceNote("");
      toast({ title: "Advance added", status: "success" });
    } catch (err) {
      toast({ title: "Error adding advance", status: "error" });
    }
  };

  const handleCancelAdvance = () => {
    setIsAddingAdvance(false);
    setNewAdvanceAmount("");
    setNewAdvanceNote("");
  };

  const handleDeleteAdvance = async (id: string) => {
    await deleteAdvanceById(id);
    await fetchAdvances();
  };

  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();

  const presentSalary =
    salary && daysInMonth
      ? salary - deductable * (salary / daysInMonth) - advanceTotal
      : 0;

  return (
    <Box>
      {/* Person Header */}
      <Box mb={6}>
        <Text fontSize="2xl" fontWeight="bold" color="gray.800">
          {selectedPerson.name}
        </Text>
        <Text fontSize="lg" color="gray.600">
          {selectedPerson.subcategoryName}
        </Text>
      </Box>

      {/* Cards */}
      <Flex
        flexDirection={{ base: "column", md: "row" }}
        gap={6}
        flexWrap="wrap"
        mb={8}
      >
        <Box
          p={6}
          bg="gradient-to-br from-blue-50 to-blue-100"
          borderRadius="xl"
          shadow="sm"
          border="1px solid"
          borderColor="blue.200"
          minW="200px"
          flex="1"
          _hover={{
            shadow: "md",
            transform: "translateY(-2px)",
          }}
          transition="all 0.2s ease"
        >
          <Text fontSize="sm" color="blue.600" fontWeight="semibold" mb={2}>
            TOTAL SALARY
          </Text>
          <Text fontSize="3xl" fontWeight="bold" color="blue.800">
            ₹{salary.toLocaleString()}
          </Text>
        </Box>

        <Box
          p={6}
          bg="gradient-to-br from-green-50 to-green-100"
          borderRadius="xl"
          shadow="sm"
          border="1px solid"
          borderColor="green.200"
          minW="200px"
          flex="1"
          _hover={{
            shadow: "md",
            transform: "translateY(-2px)",
          }}
          transition="all 0.2s ease"
        >
          <Text fontSize="sm" color="green.600" fontWeight="semibold" mb={2}>
            THIS MONTH SALARY
          </Text>
          <Text fontSize="3xl" fontWeight="bold" color="green.800">
            ₹{Math.max(0, Math.round(presentSalary)).toLocaleString()}
          </Text>
        </Box>

        <Box
          p={6}
          bg="gradient-to-br from-orange-50 to-orange-100"
          borderRadius="xl"
          shadow="sm"
          border="1px solid"
          borderColor="orange.200"
          minW="200px"
          flex="1"
          _hover={{
            shadow: "md",
            transform: "translateY(-2px)",
          }}
          transition="all 0.2s ease"
        >
          <Text fontSize="sm" color="orange.600" fontWeight="semibold" mb={2}>
            ABSENCES
          </Text>
          <Text fontSize="3xl" fontWeight="bold" color="orange.800">
            {absences}
          </Text>
          <Text fontSize="sm" color="orange.500" mt={1}>
            days this month
          </Text>
        </Box>
      </Flex>

      {/* Advances Section */}
      <Box
        mt={8}
        border="1px solid"
        borderColor="gray.200"
        p={6}
        borderRadius="md"
        bg="white"
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="xl" fontWeight="bold">
            Advances
          </Text>
          <Button
            bg="rgb(0, 112, 243)"
            color="white"
            size="sm"
            onClick={() => setIsAddingAdvance(true)}
            _hover={{ bg: "blue.600" }}
            isDisabled={isAddingAdvance}
          >
            Add Advance
          </Button>
        </Flex>

        <VStack spacing={4} align="stretch">
          {advances.length === 0 && !isAddingAdvance && (
            <Text color="gray.500" fontSize="sm">
              No advances given.
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
              {editingAdvanceId === advance.id ? (
                <Flex align="center" gap={4} flexWrap="wrap">
                  <InputGroup maxW="160px">
                    <InputLeftAddon children="₹" />
                    <Input
                      type="text"
                      placeholder="Amount"
                      value={editingAmount}
                      onChange={(e) => setEditingAmount(e.target.value)}
                    />
                  </InputGroup>

                  <Input
                    placeholder="Note"
                    value={editingNote}
                    onChange={(e) => setEditingNote(e.target.value)}
                    flex={1}
                  />
                  <HStack>
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={handleSaveEdit}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </Flex>
              ) : (
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="semibold" fontSize="md">
                      ₹{advance.amount}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {advance.note || "No note"}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {advance.date
                        ? new Date(advance.date).toLocaleDateString()
                        : ""}
                    </Text>
                  </Box>
                  <HStack>
                    <IconButton
                      aria-label="Edit"
                      icon={<EditIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditAdvance(advance)}
                    />
                    <IconButton
                      aria-label="Delete"
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      color="red.500"
                      onClick={() => handleDeleteAdvance(advance.id)}
                    />
                  </HStack>
                </Flex>
              )}
            </Box>
          ))}

          {isAddingAdvance && (
            <Box
              p={4}
              border="1px dashed"
              borderColor="gray.300"
              borderRadius="md"
              bg="gray.50"
            >
              <Flex align="center" gap={4} flexWrap="wrap">
                <InputGroup maxW="160px">
                  <InputLeftAddon children="₹" />
                  <Input
                    type="text"
                    placeholder="Amount"
                    value={newAdvanceAmount}
                    onChange={(e) => setNewAdvanceAmount(e.target.value)}
                  />
                </InputGroup>

                <Input
                  placeholder="Note"
                  value={newAdvanceNote}
                  onChange={(e) => setNewAdvanceNote(e.target.value)}
                  flex={1}
                />
                <HStack>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={handleSaveAdvance}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelAdvance}
                  >
                    Cancel
                  </Button>
                </HStack>
              </Flex>
            </Box>
          )}
        </VStack>
      </Box>

      {/* Calendar + Actions */}
      <Box
        mt={6}
        p={6}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="xl"
        boxShadow="sm"
        bg="white"
        _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
        transition="all 0.2s ease"
      >
        <Text fontSize="xl" fontWeight="bold" mb={4} color="gray.700">
          Select Absent Days
        </Text>

        <Box
          bg="gray.50"
          borderRadius="lg"
          p={4}
          display="flex"
          justifyContent="center"
          overflowX="auto"
          mx="auto"
          boxShadow="xs"
        >
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
          />
        </Box>

        <Checkbox
          mt={6}
          isChecked={deduct}
          onChange={(e) => setDeduct(e.target.checked)}
          colorScheme="red"
        >
          Deduct Salary?
        </Checkbox>

        <Flex mt={6} gap={4} justify="flex-end" flexWrap="wrap">
          <Button onClick={handleConfirm} colorScheme="blue">
            Confirm
          </Button>
          <Button onClick={handleCancel} variant="outline">
            Cancel
          </Button>
        </Flex>

        <style>{`
          .react-calendar__tile {
            border-radius: 50%;
          }

          .react-calendar__tile--now {
            background: #edf2f7 !important;
            color: #1a202c !important;
          }

          .react-calendar__tile--active {
            background: none !important;
            color: inherit !important;
          }

          .absent-day {
            background: #feb2b2 !important;
            color: #742a2a !important;
            border-radius: 10% !important;
          }

          .react-calendar__tile:enabled:hover {
            background: #e2e8f0;
          }
        `}</style>
      </Box>
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading fontSize="xl">Salary Chart</Heading>
          <Select
            w="150px"
            value={selectedYear ?? ""}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </Select>
        </Flex>

        {loading ? (
          <Flex justify="center" align="center" h="200px">
            <Spinner />
          </Flex>
        ) : (
          <Bar data={barData} />
        )}
      </Box>
    </Box>
  );
}

export default HelpNavbar;
