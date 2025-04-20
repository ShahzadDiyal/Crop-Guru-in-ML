import React, { useState, useEffect } from "react";
import axios from "axios";

// --- Type Definitions ---
type NutrientRecommendation = {
  nutrient: string;
  status: string;
  advice: string;
};

type FertilizerResult = {
  crop: string;
  status: "balanced" | "unbalanced" | string;
  message?: string;
  recommendations?: NutrientRecommendation[];
};

const FertilizerForm: React.FC = () => {
  const [crops, setCrops] = useState<string[]>([]);
  const [formData, setFormData] = useState({ crop: "", N: "", P: "", K: "" });
  const [result, setResult] = useState<FertilizerResult | null>(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/get-crops")
      .then((res) => {
        setCrops(res.data.crops);
      })
      .catch((err) => {
        console.error("Failed to fetch crops:", err);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axios.post<FertilizerResult>(
        "http://127.0.0.1:5000/fertilizer-suggestion",
        formData
      );
      setResult(res.data);
    } catch (err: any) {
      alert("Error: " + (err.response?.data?.error || "Something went wrong"));
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Fertilizer Recommendation System</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          name="crop"
          value={formData.crop}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">-- Select Crop --</option>
          {crops.map((crop, index) => (
            <option key={index} value={crop}>
              {crop}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="N"
          placeholder="Nitrogen (N)"
          onChange={handleChange}
          value={formData.N}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="P"
          placeholder="Phosphorus (P)"
          onChange={handleChange}
          value={formData.P}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="K"
          placeholder="Potassium (K)"
          onChange={handleChange}
          value={formData.K}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Get Recommendation
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">Results for {result.crop}</h3>
          {result.status === "balanced" ? (
            <p>{result.message}</p>
          ) : (
            result.recommendations?.map((rec, i) => (
              <div key={i} className="mb-3">
                <strong>
                  {rec.nutrient} ({rec.status})
                </strong>
                <p>{rec.advice}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FertilizerForm;
