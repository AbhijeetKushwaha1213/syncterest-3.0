
import { Navigate } from "react-router-dom";

const SettingsPage = () => {
  // Redirect to account settings by default
  return <Navigate to="/settings/account" replace />;
};

export default SettingsPage;
