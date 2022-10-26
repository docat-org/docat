import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Docs from "./pages/Docs";
import Help from "./pages/Help";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Upload from "./pages/Upload";

function App() {
  const router = createBrowserRouter([
    //elements without header and footer
    {
      path: "/:project",
      children: [
        {
          path: "",
          element: <Docs />,
        },
        {
          path: ":version",
          children: [
            {
              path: "",
              element: <Docs />,
            },
            {
              path: ":page",
              element: <Docs />,
            },
          ],
        },
      ],
    },
    //elements with header and footer
    {
      path: "/",
      element: (
        <>
          <Header />
          <Outlet />
          <Footer />
        </>
      ),
      children: [
        {
          path: "",
          element: <Home />,
        },
        {
          path: "upload",
          element: <Upload />,
        },
        {
          path: "help",
          element: <Help />,
        },
      ],
      errorElement: <NotFound />,
    },
  ]);

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
