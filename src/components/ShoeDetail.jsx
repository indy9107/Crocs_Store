import React from "react";

function ShoeDetail({ shoe, onBack, onDelete }) {
  console.log("ข้อมูลที่ส่งมาหน้า Detail:", shoe);

  if (!shoe) return <p>ไม่พบข้อมูลรองเท้า</p>;

  const handleShare = async () => {
    // แก้จุดที่ 1: เปลี่ยน detailImages เป็น detail_images
    if (!shoe.detail_images || shoe.detail_images.length === 0) {
      alert("ไม่มีรูปรายละเอียดสำหรับแชร์ครับ");
      return;
    }

    try {
      // แก้จุดที่ 2: เปลี่ยน detailImages เป็น detail_images
      // (และเปลี่ยนชื่อตัวแปรรับค่าจาก base64 เป็น imgUrl ให้ตรงกับความจริง)
      const filePromises = shoe.detail_images.map(async (imgUrl, index) => {
        const response = await fetch(imgUrl);
        const blob = await response.blob();
        return new File([blob], `${shoe.model}-detail-${index + 1}.jpg`, {
          type: "image/jpeg",
        });
      });

      const filesToShare = await Promise.all(filePromises);

      if (navigator.canShare && navigator.canShare({ files: filesToShare })) {
        await navigator.share({
          files: filesToShare,
        });
      } else {
        alert(
          "เบราว์เซอร์หรืออุปกรณ์นี้ ไม่รองรับการแชร์รูปภาพหลายรูปพร้อมกันครับ",
        );
      }
    } catch (error) {
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
              {/* Note: ถ้าวันที่ไม่ขึ้น ให้แก้จาก shoe.date เป็น shoe.created_at แทนนะครับ */}
              <b>ราคา:</b> ฿{shoe.price} | <b>วันที่ลงสต๊อก:</b>{" "}
              {shoe.date || shoe.created_at}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn-primary"
              onClick={handleShare}
              style={{ backgroundColor: "#3498DB" }}
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
          {/* แก้จุดที่ 3: เปลี่ยน detailImages เป็น detail_images (และเพิ่มการเช็คว่ามีข้อมูลก่อนแมป) */}
          {shoe.detail_images &&
            shoe.detail_images.map((img, index) => (
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
