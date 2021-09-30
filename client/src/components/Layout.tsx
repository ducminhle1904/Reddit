import { ReactNode } from "react";
import NavBar from "./NavBar";
import Wrapper from "./Wrapper";

interface ILayoutProps {
  children: ReactNode;
}
function Layout({ children }: ILayoutProps) {
  return (
    <>
      <NavBar />
      <Wrapper>{children}</Wrapper>
    </>
  );
}

export default Layout;
