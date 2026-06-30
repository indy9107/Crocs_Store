import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getShoe, updateShoe, deleteShoes } from "../../utils/api";
import {
  fetchImageBlob,
  getStoragePathFromPublicUrl,
  removeImagesByPaths,
  uploadImage,
} from "../../utils/storage";
import { compressImage, compressImages } from "../../utils/imageCompression";
import ShoeInfoDisplay from "./ShoeInfoDisplay";
import ShoeEditForm from "./ShoeEditForm";
import ShoeGallery from "./ShoeGallery";

const COVER_OPTS = { maxWidth: 1200, maxHeight: 1200, quality: 0.82 };
const DETAIL_OPTS = { maxWidth: 1600, maxHeight: 1600, quality: 0.85 };

function ShoeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shoe, setShoe] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editModel, setEditModel] = useState("");
  const [editSize, setEditSize] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [newCoverFile, setNewCoverFile] = useState(null);
  const [newDetailFiles, setNewDetailFiles] = useState([]);

  useEffect(() => {
    fetchShoe();
  }, [id]);

  const fetchShoe = async () => {
    setIsLoaded(false);
    try {
      const data = await getShoe(id);
      setShoe(data);
    } catch (error) {
      console.error("ดึงข้อมูลรองเท้าไม่สำเร็จ:", error);
      setShoe(null);
    } finally {
      setIsLoaded(true);
    }
  };

  const handleDelete = async (shoeId) => {
    if (
      !window.confirm("ยืนยันว่ารองเท้าคู่นี้ขายแล้ว และต้องการลบออกจากสต๊อก?")
    ) {
      return;
    }
    try {
      const pathsToRemove = [
        getStoragePathFromPublicUrl(shoe.image_url),
        ...(shoe.detail_images || []).map(getStoragePathFromPublicUrl),
      ];
      await removeImagesByPaths(pathsToRemove);

      await deleteShoes([shoeId]);
      navigate("/");
    } catch (error) {
      console.error("ลบข้อมูลไม่สำเร็จ:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูลครับ");
    }
  };

  const handleUpdateShoe = async (
    shoeId,
    updatedData,
    coverFile,
    detailFiles,
  ) => {
    setIsSaving(true);
    try {
      let finalImageUrl = shoe.image_url;
      let finalDetailImages = shoe.detail_images || [];

      if (coverFile) {
        const compressed = await compressImage(coverFile, COVER_OPTS);
        const oldPath = getStoragePathFromPublicUrl(shoe.image_url);
        if (oldPath) await removeImagesByPaths([oldPath]);
        finalImageUrl = await uploadImage(compressed, "cover");
      }

      if (detailFiles && detailFiles.length > 0) {
        const oldPaths = (shoe.detail_images || []).map(
          getStoragePathFromPublicUrl,
        );
        await removeImagesByPaths(oldPaths);

        const compressed = await compressImages(detailFiles, DETAIL_OPTS);
        const urls = [];
        for (const file of compressed) {
          urls.push(await uploadImage(file, `detail_${shoeId}`));
        }
        finalDetailImages = urls;
      }

      await updateShoe(shoeId, {
        ...updatedData,
        image_url: finalImageUrl,
        detail_images: finalDetailImages,
      });

      alert("อัปเดตข้อมูลและรูปภาพเรียบร้อยแล้ว! 🎉");
      setIsEditingMode(false);
      setNewCoverFile(null);
      setNewDetailFiles([]);
      await fetchShoe();
    } catch (error) {
      console.error("Error updating shoe:", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูลครับ ดูรายละเอียดใน Console");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <p className="text-center-mt50" style={{ color: "white" }}>
        กำลังโหลดข้อมูล... ⏳
      </p>
    );
  }

  if (!shoe) {
    return (
      <div className="shoe-detail-container">
        <button
          style={{ color: "black" }}
          className="btn-back-outline"
          onClick={() => navigate("/")}
        >
          &larr; กลับหน้ารายการ
        </button>
        <p className="text-center-mt50">ไม่พบข้อมูลรองเท้า</p>
      </div>
    );
  }

  const handleShare = async () => {
    if (!shoe.detail_images || shoe.detail_images.length === 0) {
      alert("ไม่มีรูปรายละเอียดสำหรับแชร์ครับ");
      return;
    }
    try {
      // ดึงรูปผ่าน Worker backend เพื่อหลีกเลี่ยง CORS จาก R2 public URL
      const blobs = await Promise.all(shoe.detail_images.map(fetchImageBlob));
      const filesToShare = blobs.map((blob, index) => {
        const ext = blob.type === "image/png" ? "png" : "jpg";
        return new File([blob], `${shoe.model}-detail-${index + 1}.${ext}`, {
          type: blob.type || "image/jpeg",
        });
      });
      if (navigator.canShare && navigator.canShare({ files: filesToShare })) {
        await navigator.share({ files: filesToShare });
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

  const toggleEditMode = () => {
    if (!isEditingMode) {
      setEditModel(shoe.model);
      setEditSize(shoe.size);
      setEditColor(shoe.color);
      setEditPrice(shoe.price);
    } else {
      setNewCoverFile(null);
      setNewDetailFiles([]);
    }
    setIsEditingMode(!isEditingMode);
  };

  const handleCoverChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewCoverFile(e.target.files[0]);
    }
  };

  const handleDetailChange = (e) => {
    if (e.target.files) {
      setNewDetailFiles(Array.from(e.target.files));
    }
  };

  const handleSaveChanges = () => {
    if (!editModel || !editSize || !editColor || !editPrice) {
      alert("กรุณากรอกข้อมูลตัวหนังสือให้ครบทุกช่องครับ");
      return;
    }
    handleUpdateShoe(
      shoe.id,
      {
        model: editModel,
        size: editSize,
        color: editColor,
        price: parseFloat(editPrice),
      },
      newCoverFile,
      newDetailFiles,
    );
  };

  return (
    <div className="shoe-detail-container">
      <button
        style={{ color: "black" }}
        className="btn-back-outline"
        onClick={() => navigate("/")}
      >
        &larr; กลับหน้ารายการ
      </button>

      <div className="shoe-detail-content">
        {!isEditingMode ? (
          <ShoeInfoDisplay
            shoe={shoe}
            onShare={handleShare}
            onDelete={handleDelete}
            onToggleEdit={toggleEditMode}
          />
        ) : (
          <ShoeEditForm
            editModel={editModel}
            setEditModel={setEditModel}
            editSize={editSize}
            setEditSize={setEditSize}
            editColor={editColor}
            setEditColor={setEditColor}
            editPrice={editPrice}
            setEditPrice={setEditPrice}
            onCoverChange={handleCoverChange}
            onDetailChange={handleDetailChange}
            onSave={handleSaveChanges}
            onCancel={toggleEditMode}
            isSaving={isSaving}
          />
        )}
      </div>

      {!isEditingMode && <ShoeGallery images={shoe.detail_images} />}
    </div>
  );
}

export default ShoeDetail;
