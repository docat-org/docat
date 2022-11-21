import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ConfigDataProvider } from "./data-providers/ConfigDataProvider";
import { ProjectDataProvider } from "./data-providers/ProjectDataProvider";
import Claim from "./pages/Claim";
import Delete from "./pages/Delete";
import Docs from "./pages/Docs";
import Help from "./pages/Help";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Upload from "./pages/Upload";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
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
          path: "claim",
          element: <Claim />,
        },
        {
          path: "delete",
          element: <Delete />,
        },
        {
          path: "help",
          element: <Help />,
        },
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
      ],
      errorElement: <NotFound />,
    },
  ]);

  return (
    <div className="App">
      <ConfigDataProvider>
        <ProjectDataProvider>
          <RouterProvider router={router} />
        </ProjectDataProvider>
      </ConfigDataProvider>
    </div>
  );
}

export default App;
