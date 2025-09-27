import React from "react";
import BottomNav from "./BottomNav";

const PrivateLayout = ({ children }) => {
  return (
    <>
      <main>{children}</main>
      <BottomNav />
    </>
  );
};

export default PrivateLayout;