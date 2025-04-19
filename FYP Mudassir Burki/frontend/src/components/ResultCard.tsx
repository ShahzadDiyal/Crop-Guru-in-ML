import React from "react";

interface ResultCardProps {
  crop: string;
  disease: string;
  cause: string;
  cure: string;
  imageUrl: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ crop, disease, cause, cure, imageUrl }) => {
  return (
    <div
      className="container"
      style={{
        marginTop: 50,
        padding: 30,
        backgroundColor: "#fff",
        borderRadius: 10,
        maxWidth: 700,
        margin: "50px auto",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h1>Prediction Result</h1>
      <img src={imageUrl} alt="Result" style={{ maxWidth: "100%", borderRadius: 10 }} />
      <div className="result-box" style={{ textAlign: "left", marginTop: 30 }}>
        <p>
          <strong>Crop:</strong> {crop}
        </p>
        {disease === "Healthy" ? (
          <p>
            <strong>Status:</strong> No disease detected.
          </p>
        ) : (
          <>
            <p>
              <strong>Disease:</strong> {disease}
            </p>
            <p>
              <strong>Cause:</strong> {cause}
            </p>
            <p>
              <strong>How to Cure:</strong> {cure}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
