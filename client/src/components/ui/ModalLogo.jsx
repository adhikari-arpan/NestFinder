import { useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import whiteLogo from "../../assets/White_NestFinderLogo.png";
import darkLogo from "../../assets/Dark_NestFinderLogo.png";

// Small NestFinder wordmark centered at the top of confirmation/profile
// dialogs (logout, delete picture, edit profile, update picture) so they
// read as part of the app rather than a generic browser-style popup.
export const ModalLogo = () => {
  const { theme } = useContext(AppContext);
  const logo = theme === "dark" ? darkLogo : whiteLogo;

  return (
    <img
      src={logo}
      alt="NestFinder"
      style={{
        display: "block",
        height: "36px",
        width: "auto",
        margin: "0 auto 1.25rem",
      }}
    />
  );
};
