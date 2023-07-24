import { useCallback, useState } from "react";
import "./liquidity-banner.scss";
import CircleIcon from "../../assets/icons/circle.svg";

function LiquidityBanner() {
    const [showBanner, setShowBanner] = useState(true);

    const handleClose = useCallback(() => setShowBanner(false), []);

    if (!showBanner) {
        return null;
    }

    return (
        <div className="liquidity-banner-root">
            <div className="liquidity-banner-text-conteiner"   >
                <p className="liquidity-banner-text">
                    🥂🎉 You Won this game!!! 🎉🥂
                </p>
                <p className="liquidity-banner-text upper">
                    claim prize
                </p>
            </div>
            <div className="liquidity-banner-left-circle">
                <img alt="" src={CircleIcon} />
            </div>
            <div className="liquidity-banner-right-circle">
                <img alt="" src={CircleIcon} />
            </div>
        </div>
    );
}

export default LiquidityBanner;
