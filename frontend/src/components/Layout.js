import React from "react";
import BottomNavBar from "./BottomNavBar";

const Layout = ({ children }) => {
  return (
    <div style={{ paddingBottom: "60px" /* to prevent content behind navbar */ }}>
      {children}
      <BottomNavBar />
    </div>
  );
};

export default Layout;
