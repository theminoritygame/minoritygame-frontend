import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import "./FAQComponent.scss";

const faqData = [
  {
    id: 1,
    question: "What is the objective of the game?",
    answer:
    "The objective of the game is to vote for the minority choice among the two options presented. Outsmart the crowd and become part of the smaller group to win the game."
    },
    {
    id: 2,
    question: "How do I participate in the game?",
    answer:
    "To participate, you just need to cast vote for your preferred option by paying mint fee for the vote  through a blockchain transaction on Binance Smart Chain (BSC)."
    },
    {
    id: 3,
    question: "How long does the Voting Phase last?",
    answer:
    "Voting for each game is open for 24 hours. A new game starts each day."
    },
    {
    id: 4,
    question: "When are the results published?",
    answer:
    "Once the voting phase ends, the results will be published within a maximum of 3 hours."
    },
    {
    id: 5,
    question: "When can I claim my winnings?",
    answer:
    "Once the results are verified and confirmed via the challenge phase (3 hours after the results are published), you can claim your prize immediately through the game's interface. So, it may take a max of 6 hours after voting ends."
    },
    {
    id: 6,
    question: "Can I cast votes for both choices?",
    answer:
    "You can surely cast votes for both choices. At the end of the game, you will win twice the amount you invested in the choice that lies in the minority."
    },
    {
    id: 7,
    question: "How are winners determined?",
    answer:
    "At the end of the voting period, the option with the fewer votes is considered the winning minority choice. Players who voted for the minority choice will be declared as winners."
    },
    {
    id: 8,
    question: "What is the payout for winners?",
    answer:
    "Winners will receive a payout of at least 2X (2 times) the amount they invested in the winning minority choice. In addition, there is often an incentive pool declared at the start of the game that is shared by winners in proportion to their winning vote counts. Losing votes get nothing."
    },
    {
    id: 9,
    question: "Is there a time limit for voting?",
    answer:
    "Yes, each voting round will have a specific time limit during which players can cast their votes. Once the voting period is over, no more votes will be accepted."
    },
    {
    id: 10,
    question: "Can I change my vote after submitting it?",
    answer:
    "No, once you have cast your vote, it is final and cannot be changed. Make sure to consider your choice carefully before submitting."
    },
    {
    id: 11,
    question: "How can I trust the fairness of the game?",
    answer:
    "The game is built on a blockchain, which ensures transparency and immutability. Your vote will be encrypted using elliptic curve cryptography to ensure security and anonymity. The voting process and results are publicly recorded on the blockchain, making it verifiable and tamper-proof."
    },
    {
    id: 12,
    question: "Is there a minimum or maximum amount I can invest?",
    answer:
    " You can cast any count of votes to an option, minimum being one. So, minimum amount will be the mint fee for one vote. Max vote count limit is around 10,000 votes."
    },
    {
    id: 13,
    question: "Can I see the voting results in real-time?",
    answer:
    "No, the voting results will only be displayed once the voting phase has ended, to ensure fair gameplay. Your votes are encypted using a secret known only to players, so it is not possible for others to track game progress to see which choice is leading."
    },
    {
    id: 14,
    question: "Are there any fees for participating in the game?",
    answer:
    "There is no additional fees (on top of mint fee) for participation as such, but there will be some very small transaction gas fees associated with voting and receiving payouts. These fees are necessary for processing transactions on the blockchain."
    },
    {
    id: 15,
    question: "What happens if there's a tie between the two choices?",
    answer:
    "There is no winner or loser in case the game ties, i.e., both choices receive an equal number of votes. Each vote is worth the vote mint Price and can be burned to claim back the investment. The Shared Incentive Pool (if any) is not distributed in this case."
    },
    {
    id: 16,
    question: "Can I create multiple accounts to increase my chances of winning?",
    answer:
    "You can create as many accounts as you like. All accounts will be considered separate, and game rules will apply accordingly."
    },
    {
    id: 17,
    question: "How can I contact support if I have a question or encounter an issue?",
    answer:
    "You can reach out to the game's customer support through our official Twitter channel or Discord group. Links for both can be found on the website."
    },
    {
    id: 18,
    question: "Is the game audited for security and fairness?",
    answer:
    "The game is built on a blockchain, which ensures transparency and immutability. Your vote will be encrypted using elliptic curve cryptography to ensure security and anonymity. The voting process and results are publicly recorded on the blockchain, making it verifiable and tamper-proof."
    },
    {
    id: 19,
    question: "I am not satisfied with the game results. What do I do?",
    answer:
    "While we are highly confident in the accuracy of our game results, we understand the importance of addressing any potential doubts. To offer reassurance, we have a 3-hour challenge phase after the results are published. During this period, you can participate in on-chain challenges via simple one-click interfaces in the 'Challenge' section of that game (read more in the whitepaper). Should you successfully identify any incorrect computations, all the players will have the opportunity to claim back their invested amounts. Your trust and satisfaction remain our top priorities."
    },
  {
    id: 20,
    question: "What are the Game Stages?",
    answer: 
    <>
      Every Game goes through the following stages:<br></br>
      1. &nbsp;&nbsp;Inital&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&nbsp;&nbsp; A new game is hosted.<br></br>
      2. &nbsp;&nbsp;Voting Started&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&nbsp;&nbsp;  Voting is open for the game.<br></br>
      3. &nbsp;&nbsp;Voting Ended&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&nbsp;&nbsp;  Voting period ends. The game host computes the results using the securely kept game private key<br></br>
      4. &nbsp;&nbsp;Result Published&nbsp; -&nbsp;&nbsp;  The results are published by the game host. Challenge phase begins. Published results can be challenged by anyone for correctness by triggerring onchain computation.<br></br>
      5. &nbsp;&nbsp;Result Locked&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&nbsp;&nbsp;  After challenge phase ends, results are locked and players can burn their votes to claim the rewards in BNB.<br></br>

      <br></br>Read more in the whitepaper.
    </>
  }
];

const Faq: React.FC = () => {
  const [active, setActive] = useState<number | null>(null);

  const handleClick = (id: number) => {
    if (active === id) {
      setActive(null);
    } else {
      setActive(id);
    }
  };

  return (
    <div className="faq">
      {faqData.map((faq) => (
        <div className="faq-item" key={faq.id}>
          <div className="faq-question" onClick={() => handleClick(faq.id)}>
            <div className="faq-question-text">{faq.question}</div>
            <FontAwesomeIcon
              icon={active === faq.id ? faChevronUp : faChevronDown}
              className="faq-icon"
            />
          </div>
          {active === faq.id && <div className="faq-answer">{faq.answer}</div>}
        </div>
      ))}
    </div>
  );
};

export default Faq;