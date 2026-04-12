import { useState } from "react";
import { supabase } from "../../supabaseClient";
import AddShoeBasicFields from "./AddShoeBasicFields"; // ✨ Import ไฟล์ลูกที่ 1
import AddShoeImageFields from "./AddShoeImageFields"; // ✨ Import ไฟล์ลูกที่ 2

function AddShoe() {
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  const [mainImage, setMainImage] = useState(null);
  const [detailImages, setDetailImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // 1. อัปโหลดรูปภาพหลัก (Main Image)
      const mainFile = mainImage;
      const mainExt = mainFile.name.split(".").pop();
      const mainPath = `main_${Math.random()}.${mainExt}`;
      const safeMainFile = new File([mainFile], mainPath, {
        type: mainFile.type,
      });

      let { error: mainUploadError } = await supabase.storage
        .from("crocs_images")
        .upload(mainPath, safeMainFile);
      if (mainUploadError) throw mainUploadError;

      const { data: mainUrlData } = supabase.storage
        .from("crocs_images")
        .getPublicUrl(mainPath);
      const mainImageUrl = mainUrlData.publicUrl;

      // 2. อัปโหลดกลุ่มรูปภาพรายละเอียด (Detail Images)
      let detailImageUrls = [];
      for (const file of detailImages) {
        const fileExt = file.name.split(".").pop();
        const filePath = `detail_${Math.random()}.${fileExt}`;
        const safeDetailFile = new File([file], filePath, { type: file.type });

        let { error: detailUploadError } = await supabase.storage
          .from("crocs_images")
          .upload(filePath, safeDetailFile);
        if (detailUploadError) throw detailUploadError;

        const { data: detailUrlData } = supabase.storage
          .from("crocs_images")
          .getPublicUrl(filePath);
        detailImageUrls.push(detailUrlData.publicUrl);
      }

      // 3. บันทึกข้อมูลทั้งหมดลงตาราง shoes
      const { error: insertError } = await supabase.from("shoes").insert([
        {
          model: model,
          price: parseFloat(price),
          size: size,
          color: color,
          image_url: mainImageUrl,
          detail_images: detailImageUrls,
        },
      ]);
      if (insertError) throw insertError;

      alert("บันทึกข้อมูลและอัปโหลดรูปทั้งหมดสำเร็จแล้ว! 🇰🇷");

      // ล้างค่าฟอร์ม
      setModel("");
      setPrice("");
      setSize("");
      setColor("");
      setMainImage(null);
      setDetailImages([]);
      document.getElementById("detail-image-input").value = "";
      document.getElementById("main-image-input").value = "";
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-shoe-form">
      <h2 className="add-shoe-title">👟 เพิ่มรองเท้าใหม่</h2>

      {/* 🎯 เรียกใช้ Component ลูกที่ 1 (ส่ง State และ Setter ไปให้) */}
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

      {/* 🎯 เรียกใช้ Component ลูกที่ 2 (ส่งเฉพาะ Setter ไปให้เก็บไฟล์) */}
      <AddShoeImageFields
        setMainImage={setMainImage}
        setDetailImages={setDetailImages}
      />

      <button type="submit" disabled={uploading} className="btn-submit">
        {uploading ? "⏳ กำลังอัปโหลดรูปและบันทึก..." : "💾 บันทึกลงระบบ"}
      </button>
    </form>
  );
}

export default AddShoe;
