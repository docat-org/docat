import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ConfigDataProvider } from './data-providers/ConfigDataProvider'
import { MessageBannerProvider } from './data-providers/MessageBannerProvider'
import { ProjectDataProvider } from './data-providers/ProjectDataProvider'
import { SearchProvider } from './data-providers/SearchProvider'
import { StatsDataProvider } from './data-providers/StatsDataProvider'
import Claim from './pages/Claim'
import Delete from './pages/Delete'
import Docs from './pages/Docs'
import EscapeSlashForDocsPath from './pages/EscapeSlashForDocsPath'
import Help from './pages/Help'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Upload from './pages/Upload'

function App(): JSX.Element {
  const router = createBrowserRouter([
    {
      path: '/',
      errorElement: <NotFound />,
      children: [
        {
          path: '',
          element: <Home />
        },
        {
          path: 'upload',
          element: <Upload />
        },
        {
          path: 'claim',
          element: <Claim />
        },
        {
          path: 'delete',
          element: <Delete />
        },
        {
          path: 'help',
          element: <Help />
        },
        {
          path: ':project',
          children: [
            {
              path: '',
              element: <Docs />
            },
            {
              path: ':version',
              children: [
                {
                  path: '',
                  element: <Docs />
                },
                {
                  path: ':page',
                  children: [
                    {
                      path: '',
                      element: <Docs />
                    },
                    {
                      path: '*',
                      element: <EscapeSlashForDocsPath />
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ])

  return (
    <div className="App">
      <MessageBannerProvider>
        <ConfigDataProvider>
          <ProjectDataProvider>
            <StatsDataProvider>
              <SearchProvider>
                <RouterProvider router={router} />
              </SearchProvider>
            </StatsDataProvider>
          </ProjectDataProvider>
        </ConfigDataProvider>
      </MessageBannerProvider>
    </div>
  )
}

export default App
