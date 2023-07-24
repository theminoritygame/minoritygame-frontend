import React from 'react';
import './RulesComponent.scss';
import Ballot from "src/assets/images/ballot.jpg";
import Clock from "src/assets/images/clock.jpg";
import Coins from "src/assets/images/coins2.jpg";
import TimeBackImage from "src/assets/images/time-back.png";


const rulesText = [
  "NEW GAME EVERYDAY!",
  "Predict which of the two options will be chosen the least (minority)",
  "VOTE for any choice, any number of times till the voting ends (24 hrs)",
  "Each vote costs a mining fee in BNB.",
  "Your vote is ENCRYPTED using a secret key and COMMITTED ON-CHAIN",
  "Wait for up to 6 hrs for the votes to be counted, PUBLISHED and VALIDATED onChain",
  "Verification: Correctness is ensured by starting a CHALLENGE phase, where results can be challenged by running onChain computation to win rewards. Read more in FAQs.",
  // "Challenge Phase: If you think the results are inaccurate, you can challenge them by running the computation on-chain. Read more in FAQs.",
  "The winning votes can be burned to CLAIM the PRIZE in BNB immediately after Results get Locked.",
  "PAYOUT is at least 2X your investment and more."
]

const CARDS = [
  {
    title: "Voting Phase",
    textList: [
      "Minority Choice will win",
    ],
    img: Ballot,
  },
  {
    title: "Vote Counting",
    textList: ["Lasts upto 6 hours"],
    img: Clock,
  },
  {
    title: "Claim Prize",
    textList: ["Minimum 2X payout"],
    img: Coins,
  }]

const rules = [
  <React.Fragment>
    <div style={{fontWeight: 'bold', color: '#c3d9d8', display:'none'}}>{rulesText[0]}</div>
    <br></br>
  </React.Fragment>,
  <React.Fragment>
    <div style={{fontWeight: 'bold', color: '#c3d9d8'}}>{rulesText[1]}</div>
  </React.Fragment>,
  <React.Fragment>
    <div className="list-item-left" key={0}>
      <img className="item-bg" src={TimeBackImage} alt="" />
      <div className="item-content">
        <h2 className="item-title">{CARDS[0].title}</h2>
        <div className="item-img">
          <img className="item-icon" src={CARDS[0].img} alt="time" />
        </div>
        {CARDS[0].textList.map((text, index) => (
          <p className="item-desc" key={index}>
            {text}
          </p>
        ))}
      </div>
    </div>
    <p className='left-text'>
      {rulesText[2]}
      <br></br>
      {rulesText[3]}
      <br></br><br></br>
      {rulesText[4]}
    </p>
  </React.Fragment>,
  <React.Fragment>
    <p className='right-text'>
      {rulesText[5]}
      <br></br><br></br>
      {rulesText[6]}
      {/* <Tooltip title={<h3 style={{}}>{"hello"}</h3>} placement="right-end">
      <IconButton>
        <HelpSharp style={{ color: "rgba(225, 255, 255, 0.6)", width: "20px", height: "20px" }} />
      </IconButton>
    </Tooltip> */}
    </p>
    <div className="list-item-right" key={1}>
      <img className="item-bg" src={TimeBackImage} alt="" />
      <div className="item-content">
        <h2 className="item-title">{CARDS[1].title}</h2>
        <div className="item-img">
          <img className="item-icon" src={CARDS[1].img} alt="time" />
        </div>
        {CARDS[1].textList.map((text, index) => (
          <p className="item-desc" key={index}>
            {text}
          </p>
        ))}
      </div>
    </div>
  </React.Fragment>,

  <React.Fragment>
    <div className="list-item-left" key={2}>
      <img className="item-bg" src={TimeBackImage} alt="" />
      <div className="item-content">
        <h2 className="item-title">{CARDS[2].title}</h2>
        <div className="item-img">
          <img className="item-icon" src={CARDS[2].img} alt="time" />
        </div>
        {CARDS[2].textList.map((text, index) => (
          <p className="item-desc" key={index}>
            {text}
          </p>
        ))}
      </div>
    </div>
    <p className='left-text'>
      {rulesText[7]}
      <br></br><br></br>
      {rulesText[8]}
    </p>
  </React.Fragment>
];

const RulesComponent: React.FC = () => {
  return (
    <div className="rules-container">
      <ul className="rules-list">
        <li className="rules-subheading">{rules[0]}</li>
        <li className="rules-subheading">{rules[1]}</li>
        <li className="rule">{rules[2]}</li>
        <li className="rule">{rules[3]}</li>
        <li className="rule">{rules[4]}</li>
        <li className="rule">{rules[5]}</li>
      </ul>
    </div>
  );
};

export default RulesComponent;