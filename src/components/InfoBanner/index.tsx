import { FC, useCallback, useState } from "react";
import "./liquidity-banner.scss";
import { ReactComponent as xIcon } from "../../assets/icons/x.svg";
import { SvgIcon } from "@material-ui/core";


interface Props {
    msg: string;
}

const LiquidityBanner: FC<Props> = ({ msg }) => {
    const [showBanner, setShowBanner] = useState(true);

    const handleClose = useCallback(() => setShowBanner(false), []);

    if (!showBanner) {
        return null;
    }
    return (
        <div className="liquidity-banner-root">
            <div className="liquidity-banner-text-conteiner">
                <p className="liquidity-banner-text">{msg}</p>
            </div>
            <div className="liquidity-banner-close-wrap" onClick={handleClose}>
                <SvgIcon color="primary" component={xIcon} />
            </div>
        </div>
    );
}

export default LiquidityBanner;
