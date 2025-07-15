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
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email) return;

    setIsSubmitting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error sending reset link",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Reset link sent",
        description: "Check your email to reset your password.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/login");
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={4}>
      <Box
        bg="white"
        p={8}
        rounded="xl"
        shadow="lg"
        border="1px solid"
        borderColor="gray.200"
        w="full"
        maxW="400px"
      >
        <VStack spacing={6} align="stretch">
          <Heading size="md" textAlign="center" color="gray.700">
            Forgot your password?
          </Heading>
          <Text fontSize="sm" textAlign="center" color="gray.600">
            Enter your email and we’ll send you a reset link.
          </Text>

          <FormControl>
            <FormLabel fontSize="sm" color="gray.700">
              Email address
            </FormLabel>
            <Input
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              size="lg"
              borderRadius="md"
              borderColor="gray.300"
              _hover={{ borderColor: "blue.400" }}
              _focus={{
                borderColor: "rgb(0, 112, 243)",
                boxShadow: "0 0 0 1px rgb(0, 112, 243)",
              }}
            />
          </FormControl>

          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Sending..."
            size="lg"
            w="full"
            borderRadius="md"
            fontWeight="medium"
            bg="rgb(0, 112, 243)"
            color="white"
            _hover={{
              bg: "rgb(0, 95, 210)",
              transform: "translateY(-1px)",
              boxShadow: "lg",
            }}
            _active={{
              bg: "rgb(0, 80, 180)",
              transform: "translateY(0)",
            }}
            transition="all 0.2s ease"
          >
            Send Reset Link
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
