import React from "react";

// รับ props:
// - shoe: ข้อมูลรองเท้าแต่ละคู่
// - onClick: ฟังก์ชันที่จะทำงานเมื่อคลิกที่การ์ด
function ShoeCard({ shoe, onClick }) {
  return (
    <div className="card" onClick={() => onClick(shoe.id)}>
      <img style={{ width: "200px" }} src={shoe.image_url} alt={shoe.model} />
      <div className="card-info">
        <h3>{shoe.model}</h3>
        <p>
          <b>ID:</b> {shoe.id} | <b>Size:</b> {shoe.size}
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
