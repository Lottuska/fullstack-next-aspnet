'use client';

import "./globals.css";
import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { logout } from "../api/endpoints";
import {
  getAccessTokenCookie,
  removeAccessTokenCookie,
  getRefreshTokenCookie,
  removeRefreshTokenCookie,
  checkAndRefreshToken,
} from "../api/jwt";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Books",
  description: "Application for book enthusiasts!",
};

export default function RootLayout({ children }) {
  const [mobileNav, setMobileNav] = useState(false);
  const [loggedIn, setLoggedIn] = useState(true);
  const [currentPath, setCurrentPath] = useState("");

  const router = useRouter();

  useEffect(() => {
    const path = window.location.pathname;
    if (currentPath !== path) {
      setCurrentPath(path);
      setMobileNav(false);
    }

    const accessToken = getAccessTokenCookie();
    const refreshToken = getRefreshTokenCookie();

    let interval;
    if ((accessToken !== null || accessToken !== undefined || accessToken !== "") && (refreshToken !== null || refreshToken !== undefined || refreshToken !== "")) {
      checkAndRefreshToken();
      interval = setInterval(() => checkAndRefreshToken(), 30000);
    }

    setLoggedIn(!!refreshToken);

    return () => clearInterval(interval);
  }, []);

  const submitLogout = async (event) => {
    event.preventDefault();

    try {
      const refreshToken = getRefreshTokenCookie();
      const credentials = {
        refreshToken: refreshToken,
      };
      const response = await logout(credentials);
      if (response !== null) {
        removeAccessTokenCookie();
        removeRefreshTokenCookie();
        setLoggedIn(false);
        router.push("/logout");
      }
    } catch (error) {}
  };

  const userActions = [
    { name: "Login", href: "/login" },
    { name: "Register", href: "/register" },
  ];
  const userActionsLoggedIn = [
    { name: "Logout", onClick: submitLogout },
  ];
  const appNavigation = [
    { name: "Start", href: "/" },
  ];
  const appNavigationLoggedIn = [
    { name: "Start", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <html lang="en" className="bg-white">
      <body className={inter.className}>
        <nav className="bg-white fixed w-full z-20 top-0 left-0 md:static shadow-md md:shadow-none">
          <div className="mx-auto max-w-7xl px-2 sm:px-2 md:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center md:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  aria-controls="mobile-menu"
                  aria-expanded="false"
                  onClick={() => setMobileNav(!mobileNav)}
                >
                  <span className="sr-only">Open main menu</span>
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                  <svg
                    className="hidden h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <a href="/">
                  <img
                    className="h-8 w-auto"
                    src="/logo.png"
                    alt="B"
                  />
                  </a>
                </div>
                <div className="hidden md:ml-6 md:block">
                  <div className="flex space-x-4">
                    {loggedIn ? (
                      appNavigationLoggedIn.map((navItem) => (
                        <a
                          key={navItem.name}
                          href={navItem.href}
                          className={`${navItem.href === currentPath ? "border-indigo-600" : "border-transparent"} border-b-2 text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium`}
                        >
                          {navItem.name}
                        </a>
                      ))
                    ) : (
                      appNavigation.map((navItem) => (
                        <a
                          key={navItem.name}
                          href={navItem.href}
                          className={`${navItem.href === currentPath ? "border-indigo-600" : "border-transparent"} border-b-2 text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium`}
                        >
                          {navItem.name}
                        </a>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 hidden md:ml-6 md:block md:static md:inset-auto md:ml-6 md:pr-0">
                <div className="flex space-x-4">
                  {loggedIn ? (
                    userActionsLoggedIn.map((navItem) => (
                      <a
                        key={navItem.name}
                        href={navItem.href}
                        onClick={navItem.onClick && navItem.onClick}
                        className={`${navItem.href === currentPath ? "border-indigo-600" : "border-transparent"} ${navItem.onClick && "cursor-pointer"} border-b-2 text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium`}
                      >
                        {navItem.name}
                      </a>
                    ))
                  ) : (
                    userActions.map((navItem) => (
                      <a
                        key={navItem.name}
                        href={navItem.href}
                        className={`${navItem.href === currentPath ? "border-indigo-600" : "border-transparent"} border-b-2 text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium`}
                      >
                        {navItem.name}
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {mobileNav && (
            <div className="md:hidden" id="mobile-menu">
              <div className="space-y-1 px-2 pb-3 pt-2 shadow-md">
                {loggedIn ? (
                  loggedInNavigation.map((navItem) => (
                    <a
                      key={navItem.name}
                      href={navItem.href}
                      className={`${navItem.href === currentPath ? "bg-indigo-600 text-white hover:bg-indigo-500 hover:text-white" : "text-gray-900 hover:text-indigo-600"} block rounded-md px-3 py-2 text-base font-medium`}
                    >
                      {navItem.name}
                    </a>
                  ))
                ) : (
                  <a
                    href="/"
                    className={`${"/" === currentPath ? "bg-indigo-600 text-white hover:bg-indigo-500 hover:text-white" : "text-gray-900 hover:text-indigo-600"} block rounded-md px-3 py-2 text-base font-medium`}
                  >
                    Start
                  </a>
                )}
                {loggedIn ? (
                  <span
                    onClick={submitLogout}
                    className="cursor-pointer text-gray-900 hover:text-indigo-600 block rounded-md px-3 py-2 text-base font-medium"
                  >
                    Logout
                  </span>
                ) : (
                  loginNavigation.map((navItem) => (
                    <a
                      key={navItem.name}
                      href={navItem.href}
                      className={`${navItem.href === currentPath ? "bg-indigo-600 text-white hover:bg-indigo-500 hover:text-white" : "text-gray-900 hover:text-indigo-600"} block rounded-md px-3 py-2 text-base font-medium`}
                    >
                      {navItem.name}
                    </a>
                  ))
                )}
              </div>
            </div>
          )}
        </nav>
        <main className="flex flex-col bg-white p-4 mx-auto max-w-7xl md:p-10 lg:p-8 mt-16 md:mt-0">
          {children}
        </main>
      </body>
    </html>
  );
}
