import { createHashRouter, RouterProvider } from 'react-router-dom'
import React from 'react'
import { ConfigDataProvider } from './data-providers/ConfigDataProvider'
import { ProjectDataProvider } from './data-providers/ProjectDataProvider'
import Claim from './pages/Claim'
import Delete from './pages/Delete'
import Docs from './pages/Docs'
import Help from './pages/Help'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Upload from './pages/Upload'
import Search from './pages/Search'
import EscapeSlashForDocsPath from './pages/EscapeSlashForDocsPath'

function App (): JSX.Element {
  const router = createHashRouter([
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
          path: 'search',
          element: <Search />
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
      <ConfigDataProvider>
        <ProjectDataProvider>
          <RouterProvider router={router} />
        </ProjectDataProvider>
      </ConfigDataProvider>
    </div>
  )
}

export default App
