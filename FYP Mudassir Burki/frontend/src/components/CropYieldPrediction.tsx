import React, { useState } from 'react';

const CropYieldPredictionForm = () => {
    const [formData, setFormData] = useState({
        Year: '',
        average_rain_fall_mm_per_year: '',
        pesticides_tonnes: '',
        avg_temp: '',
        Area: '',
        Item: ''
    });

    const [prediction, setPrediction] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const years = Array.from({ length: 2025 - 2000 + 1 }, (_, i) => (2000 + i).toString());
    const districts = [
        "Attock", "Bahawalnagar", "Bahawalpur", "Bhakkar", "Chakwal",
        "Chiniot", "Dera Ghazi Khan", "Faisalabad", "Gujranwala", "Gujrat",
        "Hafizabad", "Jhang", "Jhelum", "Kasur", "Khanewal", "Khushab",
        "Lahore", "Layyah", "Lodhran", "Mandi Bahauddin", "Mianwali",
        "Multan", "Muzaffargarh", "Narowal", "Nankana Sahib", "Okara",
        "Pakpattan", "Rahim Yar Khan", "Rajanpur", "Rawalpindi", "Sahiwal",
        "Sargodha", "Sheikhupura", "Sialkot", "Toba Tek Singh", "Vehari"
    ] // Add more as needed
    const items = [ "Maize", "Potatoes", "Rice, paddy", "Sorghum", "Soybeans", "Wheat","Cassava","Sweet potatoes","Plantains and others"
    ]; // Add more as needed

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setPrediction(null);

        try {
            const response = await fetch('http://127.0.0.1:5000/crop-yield-predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.prediction) {
                setPrediction(data.prediction[0][0]);
            } else {
                setPrediction('Prediction failed.');
            }
        } catch (err) {
            console.error('Prediction error:', err);
            setPrediction('Error predicting crop yield.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
            <h2>🌾 Crop Yield Prediction 🌾</h2>
            <form onSubmit={handleSubmit} style={formStyle}>
                <label>Select Year:</label>
                <select name="Year" value={formData.Year} onChange={handleChange} required>
                    <option value="">-- Select Year --</option>
                    {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                <label>Average Rainfall (mm/year):</label>
                <input
                    type="number"
                    step="0.1"
                    name="average_rain_fall_mm_per_year"
                    value={formData.average_rain_fall_mm_per_year}
                    onChange={handleChange}
                    required
                />

                <label>Pesticides (Tonnes):</label>
                <input
                    type="number"
                    step="0.1"
                    name="pesticides_tonnes"
                    value={formData.pesticides_tonnes}
                    onChange={handleChange}
                    required
                />

                <label>Average Temperature (°C):</label>
                <input
                    type="number"
                    step="0.1"
                    name="avg_temp"
                    value={formData.avg_temp}
                    onChange={handleChange}
                    required
                />

                <label>Select District:</label>
                <select name="Area" value={formData.Area} onChange={handleChange} required>
                    <option value="">-- Select District --</option>
                    {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>

                <label>Select Crop:</label>
                <select name="Item" value={formData.Item} onChange={handleChange} required>
                    <option value="">-- Select Crop --</option>
                    {items.map((item) => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>

                <button type="submit" disabled={loading}>
                    {loading ? '🌱 Predicting...' : '🌱 Predict Crop Yield'}
                </button>
            </form>

            {prediction !== null && (
                <p style={resultStyle}>📢 Predicted Crop Yield: {prediction} tons</p>
            )}
        </div>
    );
};

// Inline styles
const formStyle: React.CSSProperties = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0px 0px 10px gray',
    display: 'inline-block',
    textAlign: 'left',
    width: '320px',
    marginTop: '20px'
};

const resultStyle: React.CSSProperties = {
    marginTop: '20px',
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'darkgreen'
};

export default CropYieldPredictionForm;
