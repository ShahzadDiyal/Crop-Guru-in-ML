import React, { useState } from 'react';

const WeatherBasedCropAdvisory = () => {
  const [district, setDistrict] = useState('');
  const [crop, setCrop] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const districts = [
    "Attock", "Bahawalnagar", "Bahawalpur", "Bhakkar", "Chakwal",
    "Chiniot", "Dera Ghazi Khan", "Faisalabad", "Gujranwala", "Gujrat",
    "Hafizabad", "Jhang", "Jhelum", "Kasur", "Khanewal", "Khushab",
    "Lahore", "Layyah", "Lodhran", "Mandi Bahauddin", "Mianwali",
    "Multan", "Muzaffargarh", "Narowal", "Nankana Sahib", "Okara",
    "Pakpattan", "Rahim Yar Khan", "Rajanpur", "Rawalpindi", "Sahiwal",
    "Sargodha", "Sheikhupura", "Sialkot", "Toba Tek Singh", "Vehari"
]

  const crops = [
    'wheat', 'rice', 'cotton', 'maize', 'sugarcane', 'barley', 'sunflower', 'millet',
    'gram', 'mustard', 'soybean', 'peanuts', 'banana', 'orange', 'apple', 'mango', 'guava',
    'papaya', 'watermelon', 'tomato', 'potato', 'onion', 'garlic', 'carrot', 'spinach', 'cabbage',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://127.0.0.1:5000/weather-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ district, crop }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(data);
      setError(null);
    } catch (err: any) {
      setResult(null);
      setError(err.message);
    }
  };

  return (
    <div className="weather-body">
      <div className="weather-container">
        <h2>🌾 Weather-Based Crop Advisory 🌦️</h2>
        <form onSubmit={handleSubmit}>
          <label><strong>Select District:</strong></label><br />
          <select
            className="weather-input"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            required
          >
            <option value="">Select District</option>
            {districts.map((d, idx) => (
              <option key={idx} value={d}>{d}</option>
            ))}
          </select>
          <br />

          <label><strong>Select Crop:</strong></label><br />
          <select
            className="weather-input"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            required
          >
            <option value="">Select Crop</option>
            {crops.map((c, idx) => (
              <option key={idx} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <br />
          <button type="submit" className="weather-button">🌱 Get Advisory</button>
        </form>

        {error && <p className="error-msg">❌ {error}</p>}

        {result && (
          <div className="weather-result">
            <h3>📍 Weather for <strong>{result.district}</strong></h3>
            <p><strong>🌡 Temperature:</strong> {result.temperature}°C</p>
            <p><strong>💧 Humidity:</strong> {result.humidity}%</p>
            <p><strong>☁ Weather:</strong> {result.weather}</p>
            <p className={result.recommendation.toLowerCase().includes('not suitable') ? 'not-suitable' : 'suitable'}>
              <strong>🌾 Crop Suitability:</strong> {result.recommendation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherBasedCropAdvisory;
