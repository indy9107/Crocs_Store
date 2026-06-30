import React from "react";

function ShoeCard({ shoe, onClick, selectMode = false, isSelected = false }) {
  const className = `card${selectMode ? " card-select-mode" : ""}${
    isSelected ? " card-selected" : ""
  }`;

  return (
    <div className={className} onClick={() => onClick(shoe.id)}>
      {selectMode && (
        <div className="card-checkbox" aria-hidden="true">
          {isSelected ? "✓" : ""}
        </div>
      )}
      <img
        style={{ width: "200px", borderRadius: "7px" }}
        src={shoe.image_url}
        alt={shoe.model}
        loading="lazy"
        decoding="async"
      />
      <div className="card-info">
        <h3>{shoe.model}</h3>
        <p>
          <b>Size:</b> {shoe.size}
        </p>
        <p>
          <b>สี:</b> {shoe.color}
        </p>
        <p style={{ color: "#2ECC71", fontWeight: "bold" }}>฿{shoe.price}</p>
      </div>
    </div>
  );
}

export default ShoeCard;
