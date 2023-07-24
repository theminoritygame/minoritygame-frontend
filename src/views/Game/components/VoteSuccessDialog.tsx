import React from 'react';
import {ActiveVoteInfo} from "../../../models/models"
import './VoteSuccessDialog.scss'
import { ReactComponent as CopyIcon } from '../../../assets/icons/copy-icon.svg';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  voteInfo: ActiveVoteInfo | undefined;
}

const VoteSuccessDialog: React.FC<DialogProps> = ({ open, onClose, voteInfo }) => {
    function copyToClipboard(txt: string) {
      navigator.clipboard.writeText(txt);
    }

    if (voteInfo == undefined || !open)
        return <div></div>;
    return (
      <div className="container">
        <div className="cookiesContent" id="cookiesPopup">
          <button className="close" onClick={onClose}>✖</button>
          <img src="https://cdn-icons-png.flaticon.com/512/1047/1047711.png" alt="cookies-img" />
          <p className='heading'>Success</p>
          <p>You've voted successfully for</p>
          <p className='heading'>{voteInfo.choiceName.length == 0? (voteInfo.choiceIndex==0? 'first option': 'second option'): voteInfo.choiceName}</p>
          <p className='heading'>No. of Vote(s): {voteInfo.cnt}</p>
          <p>Please save your voting secret, in case you want to see your choice before results are published!</p>
          
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ fontFamily: "Montserrat Bold", overflow: "auto", whiteSpace: "nowrap", width: "300px", marginTop: "20px", marginBottom: "20px" }}>{voteInfo.secret}</div>
            <button style={{ border:"none", background:"none", marginLeft: "10px" }} onClick={()=>copyToClipboard(voteInfo.secret)}>
              <CopyIcon className='copy-icon'/>
            </button>
          </div>
          <p className='heading'>{voteInfo.voteTimeStatement}</p>
          <button className="accept" onClick={onClose}>Got it!</button>
        </div>
      </div>
    );
};

export default VoteSuccessDialog;