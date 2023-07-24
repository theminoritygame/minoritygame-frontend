import { Zoom } from "@material-ui/core";
import "./faq.scss";
import FAQComponent from "./components/FAQComponent"

function FAQ() {
    // Render the game rules and states with proper styling
    const RulesHtml = (
        <div className="rules-view">
            <Zoom in={true}>
                <div className="rules-card" >
                    <div className="card-title">Frequenty Asked Questions </div>
                    <FAQComponent></FAQComponent>
                </div>
            </Zoom>
        </div>
    )
    return RulesHtml;
}

export default FAQ;