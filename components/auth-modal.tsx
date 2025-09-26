"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FcGoogle } from "react-icons/fc";
import { SparklesText } from "./ui/sparkles-text";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Signin form state
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");

  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignin = async () => {
    if (!signinEmail || !signinPassword) {
      toast("Please fill in all fields", {
        duration: 2000,
        position: "top-center"
      });
      return;
    }

    setIsLoading(true);

    authClient.signIn.email({
      email: signinEmail,
      password: signinPassword,
      callbackURL: "/",
    }, {
      onRequest: () => {
        setIsLoading(true);
      },
      onSuccess: (data) => {
        toast("Login berhasil! 🎉", {
          duration: 2000,
          position: "top-center"
        });

        // Clear form
        setSigninEmail("");
        setSigninPassword("");
        setIsLoading(false);

        // Close modal and reload page
        onOpenChange(false);
        window.location.reload();
      },
      onError: (error) => {
        setIsLoading(false);
        toast(error.error.message, {
          duration: 2000,
          position: "top-center"
        });
      },
    });
  };

  const signInWithGoogle = async () => {
    const data = await authClient.signIn.social({
      provider: "google",
    });
  };

  const handleSignup = async () => {
    if (!signupEmail || !signupPassword || !confirmPassword || !name) {
      toast("Please fill in all fields", {
        duration: 2000,
        position: "top-center"
      });
      return;
    }

    if (signupPassword !== confirmPassword) {
      toast("Passwords do not match", {
        duration: 2000,
        position: "top-center"
      });
      return;
    }

    setIsLoading(true);

    authClient.signUp.email({
      email: signupEmail,
      password: signupPassword,
      name: name,
      callbackURL: "/",
    }, {
      onRequest: () => {
        setIsLoading(true);
      },
      onSuccess: () => {
        toast("Signup berhasil! Silakan login.", {
          duration: 2000,
          position: "top-center"
        });

        // Clear form
        setSignupEmail("");
        setSignupPassword("");
        setConfirmPassword("");
        setName("");
        setIsLoading(false);

        // Switch to signin tab
        setTimeout(() => {
          const signinTab = document.querySelector('[value="signin"]') as HTMLButtonElement;
          if (signinTab) {
            signinTab.click();
          }
        }, 100);
      },
      onError: (error) => {
        setIsLoading(false);
        toast(error.error.message, {
          duration: 2000,
          position: "top-center"
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 border-muted shadow-md">
        <div className="flex flex-col items-center gap-y-8 px-6 py-12">
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-y-2">
            <div className="flex items-center gap-1">
              <SparklesText className="text-3xl font-semibold font-[Lilita_One] text-[#fb8500]">SRI MUL</SparklesText>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="signin">Masuk</TabsTrigger>
              <TabsTrigger value="signup">Daftar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-0">
              <div className="flex w-full flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={signinEmail}
                      onChange={(e) => setSigninEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="password"
                      placeholder="Password"
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <Button
                      onClick={handleSignin}
                      className="mt-2 w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Masuk..." : "Masuk"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={signInWithGoogle}
                      className="w-full"
                      type="button"
                    >
                      <FcGoogle className="mr-2 size-5" />
                      Masuk dengan Google
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    v{process.env.NEXT_PUBLIC_APP_VERSION}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <div className="flex w-full flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Input
                      type="text"
                      placeholder="Nama Lengkap"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="password"
                      placeholder="Password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="password"
                      placeholder="Konfirmasi Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <Button
                      onClick={handleSignup}
                      className="mt-2 w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Mendaftar..." : "Daftar"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={signInWithGoogle}
                      className="w-full"
                      type="button"
                    >
                      <FcGoogle className="mr-2 size-5" />
                      Daftar dengan Google
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    v{process.env.NEXT_PUBLIC_APP_VERSION}
                  </div>
                </div>
              </div>
              {/* <div className="text-muted-foreground flex justify-center gap-1 text-sm mt-6">
                <p>Dengan mendaftar, Anda menyetujui</p>
                <a href="#" className="text-primary font-medium hover:underline">
                  Syarat & Ketentuan
                </a>
                <p>dan</p>
                <a href="#" className="text-primary font-medium hover:underline">
                  Kebijakan Privasi
                </a>
              </div> */}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}