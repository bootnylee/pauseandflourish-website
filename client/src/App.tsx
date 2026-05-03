import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ProductReview from "./pages/ProductReview";
import ComparisonPage from "./pages/ComparisonPage";
import AllReviews from "./pages/AllReviews";
import AllComparisons from "./pages/AllComparisons";
import About from "./pages/About";
import MenopauseStagePage from "./pages/MenopauseStagePage";
import MenopauseQuiz from "./pages/MenopauseQuiz";
import NewsAndArticles from "./pages/NewsAndArticles";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/reviews" component={AllReviews} />
      <Route path="/comparisons" component={AllComparisons} />
      <Route path="/about" component={About} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/review/:slug" component={ProductReview} />
      <Route path="/comparison/:slug" component={ComparisonPage} />
      <Route path="/stage/:slug" component={MenopauseStagePage} />
      <Route path="/quiz" component={MenopauseQuiz} />
      <Route path="/news-and-articles" component={NewsAndArticles} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
