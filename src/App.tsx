import React, { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";

const Index = lazy(() => import("./pages/Index"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Suspense fallback={<div />}> 
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/*" 
            element={
              <AuthProvider>
                <Index />
              </AuthProvider>
            } 
          />
          <Route 
            path="/subscription" 
            element={
              <AuthProvider>
                <Subscription />
              </AuthProvider>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;