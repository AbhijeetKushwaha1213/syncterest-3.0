
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SettingsLayout from "@/components/settings/SettingsLayout";

const SettingsIndexPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to account settings as the default
    navigate("/settings/account", { replace: true });
  }, [navigate]);

  // Show the settings layout while redirecting
  return <SettingsLayout />;
};

export default SettingsIndexPage;
