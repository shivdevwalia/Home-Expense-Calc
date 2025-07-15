// "use client";

// import {
//   Box,
//   Button,
//   Text,
//   VStack,
//   HStack,
//   IconButton,
//   Collapse,
// } from "@chakra-ui/react";
// import { useEffect, useState } from "react";
// import { CloseIcon } from "@chakra-ui/icons";
// import {
//   dismissAlertClient,
//   getAlertsClient,
// } from "../lib/supabase/data.client";

// export default function AlertDropdown() {
//   const [alerts, setAlerts] = useState<{ id: string; message: string }[]>([]);

//   useEffect(() => {
//     const fetchAlerts = async () => {
//       const res = await getAlertsClient();
//       setAlerts(res || []);
//     };
//     fetchAlerts();
//   }, []);

//   const dismissAlert = async (id: string) => {
//     await dismissAlertClient(id);
//     setAlerts((prev) => prev.filter((a) => a.id !== id));
//   };

//   if (alerts.length === 0) return null;

//   return (
//     <Box bg="red.50" borderRadius="lg" p={4} mb={4} boxShadow="sm">
//       <VStack align="start" spacing={3}>
//         {alerts.map((alert) => (
//           <HStack key={alert.id} justify="space-between" w="full">
//             <Text fontSize="sm">{alert.message}</Text>
//             <IconButton
//               aria-label="Dismiss alert"
//               icon={<CloseIcon />}
//               size="xs"
//               onClick={() => dismissAlert(alert.id)}
//             />
//           </HStack>
//         ))}
//       </VStack>
//     </Box>
//   );
// }

//session************************************************************************
"use client";

import {
  Box,
  Text,
  VStack,
  HStack,
  IconButton,
  AlertIcon,
  AlertDescription,
  CloseButton,
  Alert,
  AlertTitle,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { CloseIcon } from "@chakra-ui/icons";
import { getAlertsClient } from "../lib/supabase/data.client";

export default function AlertDropdown() {
  const [alerts, setAlerts] = useState<{ id: string; message: string }[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const res = await getAlertsClient();
      if (!res) return;

      // Get dismissed alerts from sessionStorage
      const dismissed = JSON.parse(
        sessionStorage.getItem("dismissed-alerts") || "[]"
      );

      // Filter out dismissed alerts
      const filtered = res.filter((alert) => !dismissed.includes(alert.id));
      setAlerts(filtered);
    };

    fetchAlerts();
  }, []);

  const dismissAlert = (id: string) => {
    // Mark alert as dismissed in sessionStorage
    const dismissed = JSON.parse(
      sessionStorage.getItem("dismissed-alerts") || "[]"
    );
    sessionStorage.setItem(
      "dismissed-alerts",
      JSON.stringify([...dismissed, id])
    );

    // Update UI
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <Box px={4} mt={4}>
      <VStack spacing={3} align="stretch">
        {alerts.map((alert) => (
          <Alert key={alert.id} status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle fontSize="sm" flex="1" color="red.800">
              {alert.message}
            </AlertTitle>
            <CloseButton
              onClick={() => dismissAlert(alert.id)}
              position="relative"
              right={-1}
              top={-1}
            />
          </Alert>
        ))}
      </VStack>
    </Box>
  );
}
