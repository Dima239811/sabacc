import React, { useState } from "react";
import "./TokenModal.scss";

export type TokenType = "NO_TAX" | "TAKE_TWO_CHIPS" | "OTHER_PLAYERS_PAY_ONE";

interface TokenModalProps {
  open: boolean;
  availableTokens: TokenType[];
  maxSelection: number;
  onClose: () => void;
  onSelect: (tokens: TokenType[]) => void;
}

const tokenLabels: Record<TokenType, string> = {
  NO_TAX: "Без налога",
  TAKE_TWO_CHIPS: "Вернуть 2 фишки",
  OTHER_PLAYERS_PAY_ONE: "Противник платит 1",
};

export const TokenModal: React.FC<TokenModalProps> = ({
  open,
  availableTokens,
  maxSelection,
  onClose,
  onSelect,
}) => {
  const [selected, setSelected] = useState<TokenType[]>([]);

  if (!open) return null;

  const toggleSelect = (token: TokenType) => {
    if (selected.includes(token)) {
      setSelected(selected.filter((t) => t !== token));
    } else if (selected.length < maxSelection) {
      setSelected([...selected, token]);
    }
  };

  return (
    <div className="token-modal__overlay">
      <div className="token-modal__content">
        <h2 className="token-modal__title">
          Выберите {maxSelection} жетона
        </h2>

        <div className="token-modal__tokens">
          {availableTokens.map((token) => (
            <button
              key={token}
              onClick={() => toggleSelect(token)}
              className={`token-modal__token-btn ${
                selected.includes(token) ? "active" : ""
              }`}
            >
              {tokenLabels[token]}
            </button>
          ))}
        </div>

        <div className="token-modal__actions">
          <button className="cancel" onClick={onClose}>
            Отмена
          </button>
          <button
            className="confirm"
            disabled={selected.length !== maxSelection}
            onClick={() => onSelect(selected)}
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
};
