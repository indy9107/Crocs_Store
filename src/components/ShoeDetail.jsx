import React from "react";

function ShoeDetail({ shoe, onBack, onDelete }) {
  if (!shoe) return <p>ไม่พบข้อมูลรองเท้า</p>;

  // --- ฟังก์ชันสำหรับกดแชร์ ---
  // --- ฟังก์ชันสำหรับกดแชร์ (เฉพาะรูปลงรายละเอียด) ---
  const handleShare = async () => {
    // เช็คก่อนว่ามีรูปลงรายละเอียดไหม
    if (!shoe.detailImages || shoe.detailImages.length === 0) {
      alert("ไม่มีรูปรายละเอียดสำหรับแชร์ครับ");
      return;
    }

    try {
      // 1. วนลูปแปลง Base64 ทุกรูปใน detailImages ให้กลายเป็น File
      const filePromises = shoe.detailImages.map(async (base64Img, index) => {
        const response = await fetch(base64Img);
        const blob = await response.blob();
        return new File([blob], `${shoe.model}-detail-${index + 1}.jpg`, {
          type: "image/jpeg",
        });
      });

      // รอให้แปลงไฟล์เสร็จครบทุกรูป
      const filesToShare = await Promise.all(filePromises);

      // 2. ตรวจสอบว่าเครื่องรองรับการแชร์ไฟล์ชุดนี้ไหม
      if (navigator.canShare && navigator.canShare({ files: filesToShare })) {
        await navigator.share({
          files: filesToShare, // ส่งไปแค่รูปล้วนๆ
        });
      } else {
        alert(
          "เบราว์เซอร์หรืออุปกรณ์นี้ ไม่รองรับการแชร์รูปภาพหลายรูปพร้อมกันครับ",
        );
      }
    } catch (error) {
      // ดักจับ Error กรณีผู้ใช้กดกากบาทปิดหน้าต่างแชร์
      if (error.name !== "AbortError") {
        alert("เกิดข้อผิดพลาดในการแชร์รูปภาพ");
        console.error(error);
      }
    }
  };

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

          <div style={{ display: "flex", gap: "10px" }}>
            {/* ปุ่มแชร์ใหม่ */}
            <button
              className="btn-primary"
              onClick={handleShare}
              style={{ backgroundColor: "#3498DB" }} // สีฟ้า Messenger
            >
              📤 แชร์ข้อมูลให้ลูกค้า
            </button>

            <button className="btn-danger" onClick={() => onDelete(shoe.id)}>
              ขายแล้ว (ลบออกจากสต๊อก)
            </button>
          </div>
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
