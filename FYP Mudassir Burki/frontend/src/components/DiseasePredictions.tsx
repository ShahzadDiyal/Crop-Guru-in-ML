import React, { useState } from 'react';

const DiseasePredictions = () => {
    const [image, setImage] = useState<File | null>(null);
    const [prediction, setPrediction] = useState<any>(null);  // Updated to handle object
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!image) {
            setError('Please upload an image');
            return;
        }

        const formData = new FormData();
        formData.append('file', image);

        setLoading(true);
        setError(null); // Reset the error

        try {
            const response = await fetch('http://127.0.0.1:5000/predict-disease', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to fetch');
            }

            const data = await response.json();

            // Check if data contains the fields and set state
            if (data.crop && data.disease && data.cause && data.cure) {
                setPrediction(data);  // Store prediction as an object
            } else {
                setError('No prediction available');
            }

            setLoading(false);
        } catch (err) {
            setError('Error: Failed to fetch the prediction');
            console.error('Error:', err);
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Disease Prediction</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : 'Submit'}
                </button>
            </form>

            {error && <div style={{ color: 'red' }}>{error}</div>}

            {/* Display prediction if available */}
            {prediction && (
                <div>
                    <h2>Prediction:</h2>
                    <div><strong>Crop:</strong> {prediction.crop}</div>
                    <div><strong>Disease:</strong> {prediction.disease}</div>
                    <div><strong>Cause:</strong> {prediction.cause}</div>
                    <div><strong>Cure:</strong> {prediction.cure}</div>
                </div>
            )}
        </div>
    );
};

export default DiseasePredictions;
