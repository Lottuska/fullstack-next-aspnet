"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../api/endpoints";
import { setAccessTokenCookie, setRefreshTokenCookie } from "../../api/jwt";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [visiblePassword, showVisiblePassword] = useState(false);

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState([]);

  const router = useRouter();

  const submitLogin = async (event) => {
    event.preventDefault();

    try {
      const credentials = {
        email: email,
        password: password,
      };
      const response = await login(credentials);

      if (response.token !== null && response.refreshToken !== null) {
        await Promise.all([
          setAccessTokenCookie(response.token),
          setRefreshTokenCookie(response.refreshToken),
        ]);
        setError(false);
        router.push("/dashboard");
      } else if (response.errors) {
        setEmail("");
        setPassword("");
        setErrorMessage(response.errors);
        setError(true);
      }
    } catch (error) {
      setEmail("");
      setPassword("");
      throw new Error("Login failed");
    }
  };

  return (
    <React.Fragment>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Login to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={submitLogin} method="POST">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
              </div>
              <div className="mt-2 relative w-full">
                  <input
                    id="password"
                    name="password"
                    type={visiblePassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                  <span
                    onClick={() => showVisiblePassword(!visiblePassword)}
                    className="absolute cursor-pointer inset-y-0 right-0 flex items-center pr-3"
                  >
                    {visiblePassword ? (
                      <EyeSlashIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-500" />
                    )}
                  </span>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Login
              </button>
            </div>

            {error && (
              <div
                className="p-4 mb-4 text-sm text-yellow-800 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300"
                role="alert"
              >
                <span className="font-medium">Oops!</span>
                <ul>
                  {errorMessage.map((message) => (
                    <li>{message}</li>
                  ))}
                </ul>
              </div>
            )}
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Don't have an account?
            <a
              href="/register"
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              &nbsp;Register
            </a>
          </p>
        </div>
      </div>
    </React.Fragment>
  );
}
