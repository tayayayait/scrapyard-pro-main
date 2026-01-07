import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { DataProvider } from "@/contexts/DataProvider";

import Dashboard from "./pages/Dashboard";
import BiddingPage from "./pages/BiddingPage";
import FieldPage from "./pages/FieldPage";
import OrdersPage from "./pages/OrdersPage";
import InventoryPage from "./pages/InventoryPage";
import AdminPage from "./pages/AdminPage";
import HelpPage from "./pages/HelpPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/bidding" element={<BiddingPage />} />
              <Route path="/field" element={<FieldPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/help" element={<HelpPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
