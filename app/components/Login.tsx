"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignIn() {
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        redirect: false, // Prevent automatic redirection
        email,
        password,
      });

      if (result?.error) {
        setErrorMessage("Failed to sign in. Please check your credentials and try again. ");
      } else {
        router.push("/"); // Redirect to the home page on successful sign-in
      }
    } catch (error: any) {
      setErrorMessage("Failed to sign in. Please check your credentials and try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          await handleSubmit(formData);
        }}
        className="w-full max-w-sm p-8 space-y-6 bg-white rounded shadow-md"
      >
        <h2 className="text-2xl font-bold text-center">Sign In</h2>
        {errorMessage && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {errorMessage}
          </div>
        )}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            name="email"
            type="email"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            name="password"
            type="password"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 mt-4 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
