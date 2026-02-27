import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Discovery from "./pages/Discovery";
import Compare from "./pages/Compare";
import Simulator from "./pages/Simulator";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Developer from "./pages/Developer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/discover" component={Discovery} />
      <Route path="/compare" component={Compare} />
      <Route path="/simulator" component={Simulator} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      {/* Hidden developer page — accessible only by direct link */}
      <Route path="/developer" component={Developer} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
