"use client";

import {
  Box,
  Heading,
  Button,
  Flex,
  Text,
  Input,
  FormControl,
  FormLabel,
  VStack,
  useToast,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Login Successful",
        description: "Redirecting to dashboard...",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      router.push("/dashboard");
    }
  };

  return (
    <Flex
      minH="100vh"
      p={8}
      flexDirection="column"
      justify="center"
      align="center"
      bg="gray.50"
    >
      <Heading mb={8} color="gray.700" textAlign="center">
        Home Expense Calculator
      </Heading>

      <Box
        bg="white"
        p={8}
        borderRadius="xl"
        boxShadow="2xl"
        w="full"
        maxW="400px"
        border="1px solid"
        borderColor="gray.200"
      >
        <VStack spacing={6} align="stretch">
          <Box textAlign="left">
            <Text fontWeight="bold" fontSize="20px" color="gray.800" mb={1}>
              Welcome Back
            </Text>
            <Text color="gray.600" fontSize="sm">
              Please enter your login details
            </Text>
          </Box>

          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </FormControl>

          <Button
            onClick={handleLogin}
            isLoading={isSubmitting}
            colorScheme="blue"
            w="full"
          >
            Sign In
          </Button>

          <Flex justify="space-between" align="center">
            <Text fontSize="sm">
              Don't have an account?{" "}
              <Link href="/signup">
                <Text as="span" color="black" fontWeight="bold">
                  Sign up
                </Text>
              </Link>
            </Text>
          </Flex>

          <Link href="/forgot-password">
            <Text
              fontSize="sm"
              textAlign="center"
              color="black"
              fontWeight="bold"
              textDecoration="underline"
            >
              Forgot password?
            </Text>
          </Link>
        </VStack>
      </Box>
    </Flex>
  );
}
