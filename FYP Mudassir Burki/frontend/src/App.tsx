import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/home';
import CropRecommendation from './pages/cropRecommendation';
import DiseasePredictions from './pages/diseasePredictions';
import CropYieldPredictionForm from './pages/cropYieldPrediction';
import WheatherBasedAdvisor from './pages/wheatherbasedadvisor';
import FertilizerSuggestions from './pages/fertilizerSuggestion';

function App() {
  return (
    // Wrap the Routes with Router (BrowserRouter)
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cropRecommender" element={<CropRecommendation />} />
        <Route path="/diseasePredictor" element={<DiseasePredictions />} />
        <Route path="/cropyieldprediction" element={<CropYieldPredictionForm />} />
        <Route path="/wheatherbasedadvisor" element={<WheatherBasedAdvisor />} />
        <Route path="/fertilizersuggestion" element={<FertilizerSuggestions />} />
      </Routes>
    </Router>
  );
}

export default App;
