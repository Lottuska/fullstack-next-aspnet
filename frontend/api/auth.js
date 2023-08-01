import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessTokenCookie, getRefreshTokenCookie } from "./jwt";

const authorize = (WrappedComponent) => {
  const Wrapper = (props) => {
    const router = useRouter();
    const accessToken = getAccessTokenCookie();
    // const refreshToken = getRefreshTokenCookie();

    useEffect(() => {
      if (!accessToken) {
        router.push("/login");
      }
    }, [accessToken, router]);

    return (accessToken) ? <WrappedComponent {...props} /> : null;
  };

  return Wrapper;
};

export default authorize;
