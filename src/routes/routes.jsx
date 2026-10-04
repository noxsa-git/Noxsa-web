import { createBrowserRouter } from "react-router";
import Main from "../MainLayout/Main/Main";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main></Main>,
  },
]);

export default router;