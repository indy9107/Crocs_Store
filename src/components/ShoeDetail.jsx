import React from "react";

// รับ props จาก App.jsx:
// shoe = ข้อมูลรองเท้าคู่ที่ถูกคลิก
// onBack = ฟังก์ชันกดกลับหน้าหลัก
// onDelete = ฟังก์ชันกดลบสินค้า
function ShoeDetail({ shoe, onBack, onDelete }) {
  // กันเหนียว เผื่อหาข้อมูลรองเท้าไม่เจอ
  if (!shoe) return <p>ไม่พบข้อมูลรองเท้า</p>;

  return (
    <div id="detail-view">
      <button className="btn-back" onClick={onBack}>
        ← กลับหน้ารายการ
      </button>

      <div>
        <div className="detail-info">
          <div>
            <h2>
              รุ่น: {shoe.model} (ID: {shoe.id})
            </h2>
            <p>
              <b>ไซส์:</b> {shoe.size} | <b>สี:</b> {shoe.color}
            </p>
            <p>
              <b>ราคา:</b> ฿{shoe.price} | <b>วันที่ลงสต๊อก:</b> {shoe.date}
            </p>
          </div>
          <button className="btn-danger" onClick={() => onDelete(shoe.id)}>
            ขายแล้ว (ลบออกจากสต๊อก)
          </button>
        </div>

        <h3>รูปภาพรายละเอียด:</h3>
        <div className="grid-4">
          {shoe.detailImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`detail-${index}`}
              style={{
                width: "100%",
                borderRadius: "8px",
                objectFit: "cover",
                height: "300px",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ShoeDetail;
