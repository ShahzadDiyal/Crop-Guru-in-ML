import { Link } from "react-router-dom"

const home = () => {
  return (
    <div className="row">
      <div className="col-md-6" style={{border:"1px solid",borderRadius:"25px",padding:"20px"}}>
        <h3>Crop Recommendation</h3>
        <Link to="/cropRecommender" className="btn btn-primary">
          Crop Recommender
        </Link>
      </div>
      <div className="col-md-6" style={{border:"1px solid",borderRadius:"25px",padding:"20px"}}>
        <h3> Disease prediction</h3>
        <Link to="/diseasePredictor" className="btn btn-primary">
        Disease predictor
        </Link>
      </div>
      <div className="col-md-6" style={{border:"1px solid",borderRadius:"25px",padding:"20px"}}>
        <h3> Crop yield prediction</h3>
        <Link to="/cropyieldprediction" className="btn btn-primary">
        Crop yield predictor
        </Link>
      </div>
      <div className="col-md-6" style={{border:"1px solid",borderRadius:"25px",padding:"20px"}}>
        <h3> Wheather based advisory</h3>
        <Link to="/wheatherbasedadvisor" className="btn btn-primary">
        Wheather based advisor
        </Link>
      </div>
      <div className="col-md-6" style={{border:"1px solid",borderRadius:"25px",padding:"20px"}}>
        <h3> Fertilizer Suggestions</h3>
        <Link to="/fertilizersuggestion" className="btn btn-primary">
        Fertilizer suggestion
        </Link>
      </div>
     
    </div>
  )
}

export default home