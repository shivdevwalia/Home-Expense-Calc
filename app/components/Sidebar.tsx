// "use client";

// import {
//   Box,
//   Flex,
//   HStack,
//   Text,
//   VStack,
//   Icon,
//   Input,
//   Image,
//   Spinner,
//   useToast,
// } from "@chakra-ui/react";
// import { LayoutDashboard, LogOut, UserX, Wallet } from "lucide-react";
// import { FaUser } from "react-icons/fa";
// import { useRouter, usePathname } from "next/navigation";
// import { useEffect, useState } from "react";
// import { supabase } from "../lib/supabase/client";

// const menuItems = [
//   { label: "Dashboard", icon: LayoutDashboard },
//   { label: "Absence Tracker", icon: UserX },
//   { label: "Manage Expenses", icon: Wallet }, // Added Manage Expenses
//   { label: "Logout", icon: LogOut },
// ];

// export default function Sidebar() {
//   const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const toast = useToast();
//   const router = useRouter();
//   const pathname = usePathname();

//   const currentActive = (() => {
//     if (pathname === "/dashboard") return "Dashboard";
//     if (pathname.includes("/dashboard/absence")) return "Absence Tracker";
//     if (pathname.includes("/dashboard/expenses")) return "Manage Expenses";
//     return "";
//   })();

//   useEffect(() => {
//     const fetchAvatar = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) return;

//       const { data } = await supabase
//         .from("profiles")
//         .select("avatar_url")
//         .eq("id", user.id)
//         .single();

//       if (data?.avatar_url) {
//         setAvatarUrl(data.avatar_url);
//       }
//     };

//     fetchAvatar();
//   }, []);

//   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setLoading(true);

//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     if (!user) {
//       toast({ title: "User not found", status: "error" });
//       setLoading(false);
//       return;
//     }

//     const fileExt = file.name.split(".").pop();
//     const filePath = `${user.id}/avatar.${fileExt}`;

//     // Upload image
//     const { error: uploadError } = await supabase.storage
//       .from("avatars")
//       .upload(filePath, file, { upsert: true });

//     if (uploadError) {
//       toast({
//         title: "Upload failed",
//         description: uploadError.message,
//         status: "error",
//       });
//       setLoading(false);
//       return;
//     }

//     // Get public URL
//     const { data: publicUrlData } = await supabase.storage
//       .from("avatars")
//       .getPublicUrl(filePath);

//     if (!publicUrlData?.publicUrl) {
//       toast({
//         title: "Error generating avatar URL",
//         status: "error",
//       });
//       setLoading(false);
//       return;
//     }

//     const publicUrl = publicUrlData.publicUrl;

//     // Check if profile row exists
//     const { data: existingProfile, error: fetchError } = await supabase
//       .from("profiles")
//       .select("id")
//       .eq("id", user.id)
//       .single();

//     // If not found (error code PGRST116), insert row
//     if (fetchError && fetchError.code === "PGRST116") {
//       const { error: insertError } = await supabase
//         .from("profiles")
//         .insert({ id: user.id });

//       if (insertError) {
//         toast({ title: "Error creating profile", status: "error" });
//         setLoading(false);
//         return;
//       }
//     } else if (fetchError) {
//       toast({ title: "Error checking profile", status: "error" });
//       setLoading(false);
//       return;
//     }

//     // Update avatar_url
//     const { error: updateError } = await supabase
//       .from("profiles")
//       .update({ avatar_url: publicUrl })
//       .eq("id", user.id);

//     if (updateError) {
//       toast({ title: "Failed to save avatar", status: "error" });
//       setLoading(false);
//       return;
//     }

//     setAvatarUrl(publicUrl);
//     toast({ title: "Avatar updated!", status: "success" });
//     setLoading(false);
//   };

//   const handleRemoveAvatar = async () => {
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();
//     if (!user || !avatarUrl) return;

//     const filePath = avatarUrl.split("/").slice(-2).join("/");

//     await supabase.storage.from("avatars").remove([filePath]);
//     await supabase
//       .from("profiles")
//       .update({ avatar_url: null })
//       .eq("id", user.id);

//     setAvatarUrl(null);
//     toast({ title: "Avatar removed", status: "success" });
//   };

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     router.push("/");
//   };

//   return (
//     <Flex
//       w="20%"
//       position="sticky"
//       h="100vh"
//       mt="2px"
//       bg="white"
//       borderRadius="md"
//       flexDirection="column"
//       align="center"
//       py={8}
//       boxShadow="md"
//       top="70px"
//     >
//       {/* Avatar (with upload/remove) */}
//       <Box
//         borderRadius="full"
//         height="100px"
//         width="100px"
//         bg="gray.300"
//         mb={2}
//         overflow="hidden"
//         position="relative"
//         display="flex"
//         alignItems="center"
//         justifyContent="center"
//       >
//         {loading ? (
//           <Spinner />
//         ) : avatarUrl ? (
//           <Image
//             src={avatarUrl}
//             alt="avatar"
//             boxSize="100px"
//             objectFit="cover"
//           />
//         ) : (
//           <Icon as={FaUser} boxSize={6} color="gray.600" />
//         )}

//         <Input
//           type="file"
//           accept="image/*"
//           onChange={handleUpload}
//           position="absolute"
//           top={0}
//           left={0}
//           width="100%"
//           height="100%"
//           opacity={0}
//           cursor="pointer"
//         />
//       </Box>

//       {avatarUrl && (
//         <Text
//           fontSize="xs"
//           mt={1}
//           color="gray.600"
//           cursor="pointer"
//           _hover={{ textDecoration: "underline" }}
//           onClick={handleRemoveAvatar}
//         >
//           Remove Avatar
//         </Text>
//       )}

//       <Box mb={8} mt={2}>
//         <Text fontSize="18px" fontWeight="bold">
//           Welcome!
//         </Text>
//       </Box>

//       <VStack spacing={1} align="stretch" w="100%" px={6}>
//         {menuItems.map(({ label, icon: Icon }) => (
//           <HStack
//             key={label}
//             onClick={() => {
//               if (label === "Logout") {
//                 handleLogout();
//               } else {
//                 router.push(
//                   // label === "Dashboard"
//                   //   ? "/dashboard"
//                   //   : "/dashboard/absence-tracker"
//                   label === "Dashboard"
//                     ? "/dashboard"
//                     : label === "Absence Tracker"
//                     ? "/dashboard/absence-tracker"
//                     : label === "Manage Expenses"
//                     ? "/dashboard/expenses"
//                     : "/"
//                 );
//               }
//             }}
//             cursor="pointer"
//             px={4}
//             py={2}
//             borderRadius="md"
//             bg={currentActive === label ? "rgb(0, 112, 243)" : "transparent"}
//             color={currentActive === label ? "white" : "gray.700"}
//             fontWeight={currentActive === label ? "bold" : "normal"}
//             _hover={{
//               bg: currentActive === label ? "rgb(0, 112, 243)" : "gray.100",
//             }}
//           >
//             <Icon size={18} />
//             <Text fontWeight="semibold">{label}</Text>
//           </HStack>
//         ))}
//       </VStack>
//     </Flex>
//   );
// }

//responsive

"use client";

import {
  Box,
  Flex,
  HStack,
  Text,
  VStack,
  Icon,
  Input,
  Image,
  Spinner,
  useToast,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  LayoutDashboard,
  LogOut,
  UserX,
  Wallet,
  Menu,
  BarChart3,
  LucideUser,
} from "lucide-react";
import { FaHandsHelping, FaUser } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Househelp", icon: LucideUser  },
  { label: "Manage Expenses", icon: Wallet },
  { label: "Reports", icon: BarChart3 },
  { label: "Logout", icon: LogOut },
];

export default function Sidebar() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Determine if we should show mobile version
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const currentActive = (() => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname.includes("/dashboard/overview")) return "Househelp";
    if (pathname.includes("/dashboard/expenses")) return "Manage Expenses";
    if (pathname.includes("/dashboard/reports")) return "Reports";
    return "";
  })();

  useEffect(() => {
    const fetchAvatar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    };

    fetchAvatar();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({ title: "User not found", status: "error" });
      setLoading(false);
      return;
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    // Upload image
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({
        title: "Upload failed",
        description: uploadError.message,
        status: "error",
      });
      setLoading(false);
      return;
    }

    // Get public URL
    const { data: publicUrlData } = await supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      toast({
        title: "Error generating avatar URL",
        status: "error",
      });
      setLoading(false);
      return;
    }

    const publicUrl = publicUrlData.publicUrl;

    // Check if profile row exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    // If not found (error code PGRST116), insert row
    if (fetchError && fetchError.code === "PGRST116") {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ id: user.id });

      if (insertError) {
        toast({ title: "Error creating profile", status: "error" });
        setLoading(false);
        return;
      }
    } else if (fetchError) {
      toast({ title: "Error checking profile", status: "error" });
      setLoading(false);
      return;
    }

    // Update avatar_url
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      toast({ title: "Failed to save avatar", status: "error" });
      setLoading(false);
      return;
    }

    setAvatarUrl(publicUrl);
    toast({ title: "Avatar updated!", status: "success" });
    setLoading(false);
  };

  const handleRemoveAvatar = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !avatarUrl) return;

    const filePath = avatarUrl.split("/").slice(-2).join("/");

    await supabase.storage.from("avatars").remove([filePath]);
    await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", user.id);

    setAvatarUrl(null);
    toast({ title: "Avatar removed", status: "success" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleNavigation = (label: string) => {
    if (label === "Logout") {
      handleLogout();
    } else {
      router.push(
        label === "Dashboard"
          ? "/dashboard"
          : label === "Househelp"
          ? "/dashboard/overview"
          : label === "Manage Expenses"
          ? "/dashboard/expenses"
          : label === "Reports"
          ? "/dashboard/reports"
          : "/"
      );
    }
    // Close drawer on mobile after navigation
    if (isMobile) {
      onClose();
    }
  };

  // Sidebar Content Component
  const SidebarContent = () => (
    <VStack spacing={6} align="center" h="100%">
      {/* Avatar Section */}
      <VStack spacing={2}>
        <Box
          borderRadius="full"
          height="100px"
          width="100px"
          bg="gray.300"
          overflow="hidden"
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {loading ? (
            <Spinner />
          ) : avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="avatar"
              boxSize="100px"
              objectFit="cover"
            />
          ) : (
            <Icon as={FaUser} boxSize={6} color="gray.600" />
          )}

          <Input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            opacity={0}
            cursor="pointer"
          />
        </Box>

        {avatarUrl && (
          <Text
            fontSize="xs"
            color="gray.600"
            cursor="pointer"
            _hover={{ textDecoration: "underline" }}
            onClick={handleRemoveAvatar}
          >
            Remove Avatar
          </Text>
        )}

        <Text fontSize="18px" fontWeight="bold">
          Welcome!
        </Text>
      </VStack>

      {/* Menu Items */}
      <VStack spacing={1} align="stretch" w="100%" px={6}>
        {menuItems.map(({ label, icon: Icon }) => (
          <HStack
            key={label}
            onClick={() => handleNavigation(label)}
            cursor="pointer"
            px={4}
            py={2}
            borderRadius="md"
            bg={currentActive === label ? "rgb(0, 112, 243)" : "transparent"}
            color={currentActive === label ? "white" : "gray.700"}
            fontWeight={currentActive === label ? "bold" : "normal"}
            _hover={{
              bg: currentActive === label ? "rgb(0, 112, 243)" : "gray.100",
            }}
          >
            <Icon size={18} />
            <Text fontWeight="semibold">{label}</Text>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );

  // Mobile version with hamburger menu
  if (isMobile) {
    return (
      <>
        <IconButton
          icon={<Menu size={20} />}
          aria-label="Open menu"
          onClick={onOpen}
          position="fixed"
          top={4}
          right={4}
          zIndex={1000}
          bg="white"
          borderRadius="md"
          _hover={{ bg: "gray.100" }}
        />

        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Menu</DrawerHeader>
            <DrawerBody p={0}>
              <SidebarContent />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Flex
      w="20%"
      position="sticky"
      h="100vh"
      mt="2px"
      bg="white"
      borderRadius="md"
      flexDirection="column"
      py={8}
      boxShadow="md"
      top="70px"
    >
      <SidebarContent />
    </Flex>
  );
}
