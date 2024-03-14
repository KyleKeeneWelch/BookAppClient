import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    // Nav and footer would typically exist here but we use two versions of the footer as well as omit in unprotected routes and so is easier to include in child components
    <main className="App">
      <Outlet />
    </main>
  );
};

export default Layout;
