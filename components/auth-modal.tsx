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
import Image from "next/image";
import { SparklesText } from "@/components/ui/sparkles-text";
import { FcGoogle } from "react-icons/fc";

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
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center">
            <SparklesText className="text-3xl font-semibold">SRI MUL</SparklesText>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full px-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Masuk</TabsTrigger>
            <TabsTrigger value="signup">Daftar</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="px-6 pb-6">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">Masuk ke Akun Anda</h3>
                    {/* <p className="text-sm text-gray-600 mt-1">
                      Kelola bisnis UMKM berasa lebih mudah dengan Sri Mul UMKM
                    </p> */}
                  </div>

                  <div className="space-y-4">

                    <div className="grid grid-cols-1 py-5">
                      <Button variant="outline" type="button" onClick={signInWithGoogle} className="cursor-pointer">
                        <FcGoogle />
                        Google
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Atau
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="contoh@email.com"
                        value={signinEmail}
                        onChange={(e) => setSigninEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={signinPassword}
                        onChange={(e) => setSigninPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <Button
                      onClick={handleSignin}
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Masuk..." : "Masuk"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="px-6 pb-6">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">Buat Akun Baru</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Bergabunglah dan mulai kelola bisnis UMKM Anda
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nama Lengkap</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Nama Anda"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="contoh@email.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <Button
                      onClick={handleSignup}
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Mendaftar..." : "Daftar"}
                    </Button>

                    <div className="text-center text-sm text-gray-600">
                      Dengan mendaftar, Anda menyetujui{" "}
                      <a href="#" className="text-primary hover:underline">
                        Syarat & Ketentuan
                      </a>{" "}
                      dan{" "}
                      <a href="#" className="text-primary hover:underline">
                        Kebijakan Privasi
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}