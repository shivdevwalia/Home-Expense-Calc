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
import { supabase } from "../lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSignup = async () => {
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Signup Successful",

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
        Sign Up
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
              Create Your Account
            </Text>
            <Text color="gray.600" fontSize="sm">
              Start tracking your household expenses
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
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            />
          </FormControl>

          <Button
            onClick={handleSignup}
            isLoading={isSubmitting}
            colorScheme="blue"
            w="full"
          >
            Sign Up
          </Button>

          <Flex justify="space-between" align="center">
            <Text fontSize="sm">
              Already have an account?{" "}
              <Link href="/">
                <Text as="span" color={"black"} fontWeight="bold">
                  Log in
                </Text>
              </Link>
            </Text>
          </Flex>
        </VStack>
      </Box>
    </Flex>
  );
}
