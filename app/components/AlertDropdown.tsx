

// //session************************************************************************
// "use client";

// import {
//   Box,
//   Text,
//   VStack,
//   HStack,
//   IconButton,
//   AlertIcon,
//   AlertDescription,
//   CloseButton,
//   Alert,
//   AlertTitle,
// } from "@chakra-ui/react";
// import { useEffect, useState } from "react";
// import { CloseIcon } from "@chakra-ui/icons";
// import { getAlertsClient } from "../lib/supabase/data.client";

// export default function AlertDropdown() {
//   const [alerts, setAlerts] = useState<{ id: string; message: string }[]>([]);

//   useEffect(() => {
//     const fetchAlerts = async () => {
//       const res = await getAlertsClient();
//       if (!res) return;

//       // Get dismissed alerts from sessionStorage
//       const dismissed = JSON.parse(
//         sessionStorage.getItem("dismissed-alerts") || "[]"
//       );

//       // Filter out dismissed alerts
//       const filtered = res.filter((alert) => !dismissed.includes(alert.id));
//       setAlerts(filtered);
//     };

//     fetchAlerts();
//   }, []);

//   const dismissAlert = (id: string) => {
//     // Mark alert as dismissed in sessionStorage
//     const dismissed = JSON.parse(
//       sessionStorage.getItem("dismissed-alerts") || "[]"
//     );
//     sessionStorage.setItem(
//       "dismissed-alerts",
//       JSON.stringify([...dismissed, id])
//     );

//     // Update UI
//     setAlerts((prev) => prev.filter((a) => a.id !== id));
//   };

//   if (alerts.length === 0) return null;

//   return (
//     <Box px={4} mt={4}>
//       <VStack spacing={3} align="stretch">
//         {alerts.map((alert) => (
//           <Alert key={alert.id} status="error" borderRadius="md">
//             <AlertIcon />
//             <AlertTitle fontSize="sm" flex="1" color="red.800">
//               {alert.message}
//             </AlertTitle>
//             <CloseButton
//               onClick={() => dismissAlert(alert.id)}
//               position="relative"
//               right={-1}
//               top={-1}
//             />
//           </Alert>
//         ))}
//       </VStack>
//     </Box>
//   );
// }




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
import { 
  getAlertsClient, 
  dismissAlertClient 
} from "../lib/supabase/data.client";

export default function AlertDropdown() {
  const [alerts, setAlerts] = useState<{ id: string; message: string }[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const res = await getAlertsClient();
      if (!res) return;
      
      // Only show non-dismissed alerts from database
      setAlerts(res);
    };

    fetchAlerts();
  }, []);

  const dismissAlert = async (id: string) => {
    try {
      // Update database to mark as dismissed
      await dismissAlertClient(id);
      
      // Update UI immediately
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Failed to dismiss alert:", error);
    }
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