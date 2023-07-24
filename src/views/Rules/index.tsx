import { Grid, InputAdornment, OutlinedInput, Zoom } from "@material-ui/core";
import "./rules.scss";
import RulesComponent from "./components/RulesComponent"
  
function Rules() {
    // Render the game rules and states with proper styling
    const RulesHtml = (
        <div className="rules-view">
            <Zoom in={true}>
                <div className="rules-card" >
                    <RulesComponent></RulesComponent>
                </div>
            </Zoom>
        </div>
    )
    return RulesHtml;
}

export default Rules;
