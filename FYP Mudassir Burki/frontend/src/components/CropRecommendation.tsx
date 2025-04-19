import React, { useState } from 'react';

const FarmDetailsForm = () => {
    const BaseUrl = 'http://127.0.0.1:5000';

    const [formData, setFormData] = useState({
        N: '',
        P: '',
        K: '',
        temperature: '',
        humidity: '',
        ph: '',
        rainfall: '',
        district: ''
    });

    const districts = [
        "Attock", "Bahawalnagar", "Bahawalpur", "Bhakkar", "Chakwal",
        "Chiniot", "Dera Ghazi Khan", "Faisalabad", "Gujranwala", "Gujrat",
        "Hafizabad", "Jhang", "Jhelum", "Kasur", "Khanewal", "Khushab",
        "Lahore", "Layyah", "Lodhran", "Mandi Bahauddin", "Mianwali",
        "Multan", "Muzaffargarh", "Narowal", "Nankana Sahib", "Okara",
        "Pakpattan", "Rahim Yar Khan", "Rajanpur", "Rawalpindi", "Sahiwal",
        "Sargodha", "Sheikhupura", "Sialkot", "Toba Tek Singh", "Vehari"
    ];

    const [recommendation, setRecommendation] = useState(''); // State for storing the recommendation message

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Corrected the event type to FormEvent<HTMLFormElement>
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch(`${BaseUrl}/predict-CropRecommendation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),  // Ensure you're sending the data as JSON
            });

            if (response.ok) {
                const result = await response.json();
                setRecommendation(result.message);  // Handle response data
            } else {
                console.error("Error submitting form:", response.statusText);
                setRecommendation("Error: Unable to get recommendation.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setRecommendation("Error: Failed to submit the form.");
        }
    };

    return (
        <div className="container my-5">
            <section className="form-section">
                <h2 className="text-center mb-4">Enter Your Farm's Details</h2>
                <form onSubmit={handleSubmit} className="input-form">
                    <div className="row">
                        <div className="mb-3 col-md-6">
                            <label htmlFor="N" className="form-label">Nitrogen (N):</label>
                            <input
                                type="number"
                                step="any"
                                id="N"
                                name="N"
                                placeholder="e.g., 107"
                                value={formData.N}
                                className="form-control"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3 col-md-6">
                            <label htmlFor="P" className="form-label">Phosphorus (P):</label>
                            <input
                                type="number"
                                step="any"
                                id="P"
                                name="P"
                                placeholder="e.g., 58"
                                value={formData.P}
                                className="form-control"
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="mb-3 col-md-6">
                            <label htmlFor="K" className="form-label">Potassium (K):</label>
                            <input
                                type="number"
                                step="any"
                                id="K"
                                name="K"
                                placeholder="e.g., 15"
                                value={formData.K}
                                className="form-control"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3 col-md-6">
                            <label htmlFor="temperature" className="form-label">Temperature (°C):</label>
                            <input
                                type="number"
                                step="any"
                                id="temperature"
                                name="temperature"
                                placeholder="e.g., 24"
                                value={formData.temperature}
                                className="form-control"
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="mb-3 col-md-6">
                            <label htmlFor="humidity" className="form-label">Humidity (%):</label>
                            <input
                                type="number"
                                step="any"
                                id="humidity"
                                name="humidity"
                                placeholder="e.g., 75"
                                value={formData.humidity}
                                className="form-control"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3 col-md-6">
                            <label htmlFor="ph" className="form-label">pH Level:</label>
                            <input
                                type="number"
                                step="any"
                                id="ph"
                                name="ph"
                                placeholder="e.g., 8"
                                value={formData.ph}
                                className="form-control"
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="mb-3 col-md-6">
                            <label htmlFor="rainfall" className="form-label">Rainfall (mm):</label>
                            <input
                                type="number"
                                step="any"
                                id="rainfall"
                                name="rainfall"
                                placeholder="e.g., 76.6"
                                value={formData.rainfall}
                                className="form-control"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3 col-md-6">
                            <label htmlFor="district" className="form-label">District:</label>
                            <select
                                id="district"
                                name="district"
                                value={formData.district}
                                className="form-control"
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select District</option>
                                {districts.map((district, index) => (
                                    <option key={index} value={district}>
                                        {district}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Get Recommendation</button>
                </form>


                {/* Display the result */}
                {recommendation && (
                    <div className="recommendation-message mt-4 p-3 border border-success rounded">
                        <h3 className="text-success">Recommendation</h3>
                        <p>{recommendation}</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default FarmDetailsForm;
