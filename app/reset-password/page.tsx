"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!password) return;

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Failed to reset password",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Password updated",

        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/");
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={4}>
      <Box
        bg="white"
        p={8}
        rounded="lg"
        shadow="lg"
        w="full"
        maxW="400px"
        border="1px solid"
        borderColor="gray.200"
      >
        <VStack spacing={6} align="stretch">
          <Heading size="md" textAlign="center">
            Reset your password
          </Heading>
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Enter your new password below
          </Text>

          <FormControl>
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
            />
          </FormControl>

          <Button
            onClick={handleResetPassword}
            isLoading={isSubmitting}
            loadingText="Updating..."
            colorScheme="blue"
            w="full"
          >
            Update Password
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
