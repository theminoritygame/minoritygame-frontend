import React, { useState } from "react";
import "./GameDialog.scss";

interface GameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: JSX.Element;
  isConfirmActionAllowed: boolean;
  confirmButtonText?: string;
  dismissButtonText?: string;
}

const GameDialog: React.FC<GameDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isConfirmActionAllowed,
  confirmButtonText = "OK",
  dismissButtonText = "Cancel",
}) => {

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <>
      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{title}</h3>
              <span className="close" onClick={handleClose}>
                &times;
              </span>
            </div>
            <div className="modal-body">
              <p className="modal-message">{message}</p>
            </div>
            <div className="modal-footer">
              <button className="dismiss-button" onClick={handleClose}>
                {dismissButtonText}
              </button>
              {isConfirmActionAllowed &&
              (<button className="confirm-button" onClick={handleConfirm}>
                {confirmButtonText}
              </button>)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameDialog;