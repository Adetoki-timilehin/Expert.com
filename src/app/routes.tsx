import { Navigate, createBrowserRouter } from 'react-router'
import NotFoundScreen from './NotFoundScreen'
import RouteHydrateFallback from './RouteHydrateFallback'
import RouteErrorScreen from './RouteErrorScreen'

export const router = createBrowserRouter([
  {
    path: '/',
    HydrateFallback: RouteHydrateFallback,
    errorElement: <RouteErrorScreen />,
    lazy: async () => {
      const { default: Component } = await import('../features/auth/RoleSelectionScreen')
      return { Component }
    },
  },
  {
    path: '/client',
    HydrateFallback: RouteHydrateFallback,
    errorElement: <RouteErrorScreen />,
    lazy: async () => {
      const { default: Component } = await import('../features/client/ClientDemo')
      return { Component }
    },
  },
  {
    path: '/sign-in',
    element: <Navigate to="/" replace />,
  },
  {
    path: '/expert',
    HydrateFallback: RouteHydrateFallback,
    errorElement: <RouteErrorScreen />,
    lazy: async () => {
      const { default: Component } = await import('../features/expert/ExpertHome')
      return { Component }
    },
  },
  {
    path: '/expert/apply',
    HydrateFallback: RouteHydrateFallback,
    errorElement: <RouteErrorScreen />,
    lazy: async () => {
      const { default: Component } = await import('../features/expert/ExpertApplication')
      return { Component }
    },
  },
  {
    path: '/expert/dashboard',
    HydrateFallback: RouteHydrateFallback,
    errorElement: <RouteErrorScreen />,
    lazy: async () => {
      const { default: Component } = await import('../features/expert/ExpertDashboard')
      return { Component }
    },
  },
  {
    path: '/academy',
    HydrateFallback: RouteHydrateFallback,
    errorElement: <RouteErrorScreen />,
    lazy: async () => {
      const { default: Component } = await import('../features/academy/AcademyExperience')
      return { Component }
    },
  },
  {
    path: '/testing',
    HydrateFallback: RouteHydrateFallback,
    errorElement: <RouteErrorScreen />,
    lazy: async () => {
      const { default: Component } = await import('../features/testing/TestingHub')
      return { Component }
    },
  },
  {
    path: '/faq',
    HydrateFallback: RouteHydrateFallback,
    errorElement: <RouteErrorScreen />,
    lazy: async () => {
      const { default: Component } = await import('../features/help/FaqScreen')
      return { Component }
    },
  },
  {
    path: '*',
    Component: NotFoundScreen,
  },
])
