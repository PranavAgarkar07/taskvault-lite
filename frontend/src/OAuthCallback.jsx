import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access");
    const refresh = params.get("refresh");

    if (access && refresh) {
      localStorage.setItem("token", access);
      localStorage.setItem("refresh", refresh);
      navigate("/");
    } else {
      console.error("No tokens found in URL");
      navigate("/");
    }
  }, [navigate]);

  return <h2>Authenticating...</h2>;
}
