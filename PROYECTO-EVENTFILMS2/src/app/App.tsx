"use client";

import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppDataProvider } from './context/AppDataContext';

import { Toaster } from 'sonner';

export default function App() {
  return (
    <AppDataProvider>
      <Toaster position="top-right" richColors />
      <RouterProvider router={router} />
    </AppDataProvider>
  );
}
