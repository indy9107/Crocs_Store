import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { insertShoe } from "../../utils/api";
import { uploadImage } from "../../utils/storage";
import { compressImage, compressImages } from "../../utils/imageCompression";
import AddShoeBasicFields from "./AddShoeBasicFields";
import AddShoeImageFields from "./AddShoeImageFields";

// คุมขนาดสูงสุด: หน้าปกใช้แค่โชว์ในกริด, รายละเอียดเผื่อซูม
const COVER_OPTS = { maxWidth: 1200, maxHeight: 1200, quality: 0.82 };
const DETAIL_OPTS = { maxWidth: 1600, maxHeight: 1600, quality: 0.85 };

function AddShoe() {
  const navigate = useNavigate();

  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  const [mainImage, setMainImage] = useState(null);
  const [detailImages, setDetailImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      setProgressText("กำลังบีบอัดรูป...");
      const [compressedCover, compressedDetails] = await Promise.all([
        compressImage(mainImage, COVER_OPTS),
        compressImages(detailImages, DETAIL_OPTS),
      ]);

      setProgressText("กำลังอัปโหลดรูปหน้าปก...");
      const mainImageUrl = await uploadImage(compressedCover, "main");

      const detailImageUrls = [];
      for (let i = 0; i < compressedDetails.length; i++) {
        setProgressText(
          `กำลังอัปโหลดรูปรายละเอียด ${i + 1}/${compressedDetails.length}...`,
        );
        const url = await uploadImage(compressedDetails[i], "detail");
        detailImageUrls.push(url);
      }

      setProgressText("กำลังบันทึกข้อมูล...");
      await insertShoe({
        model,
        price: parseFloat(price),
        size,
        color,
        image_url: mainImageUrl,
        detail_images: detailImageUrls,
      });

      alert("บันทึกข้อมูลและอัปโหลดรูปทั้งหมดสำเร็จแล้ว! 🇰🇷");
      navigate("/");
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setUploading(false);
      setProgressText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-shoe-form">
      <div style={{ marginBottom: "16px" }}>
        <button
          type="button"
          className="btn-back-outline"
          onClick={() => navigate("/")}
        >
          &larr; กลับหน้ารายการ
        </button>
      </div>

      <h2 className="add-shoe-title">👟 เพิ่มรองเท้าใหม่</h2>

      <AddShoeBasicFields
        model={model}
        setModel={setModel}
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        price={price}
        setPrice={setPrice}
      />

      <hr className="form-divider" />

      <AddShoeImageFields
        setMainImage={setMainImage}
        setDetailImages={setDetailImages}
      />

      <button type="submit" disabled={uploading} className="btn-submit">
        {uploading
          ? `⏳ ${progressText || "กำลังบันทึก..."}`
          : "💾 บันทึกลงระบบ"}
      </button>
    </form>
  );
}

export default AddShoe;
