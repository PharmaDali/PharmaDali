import { useState, useRef } from "react";
import { SettingForm } from "./SettingForm";
import "../../assets/css/settings/common.css";
import uploadImagesIcon from "../../assets/icons/settings-icons/upload-images.svg";
import infoIcon from "../../assets/icons/modal-icons/info-black.svg";

const initialData = {
    carouselImages: [],
    logoUrl: "https://via.placeholder.com/500x500?text=PharmaDali+Logo"
};

const MobileAppContent = ({ onNavigate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(initialData);
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const [dragOverItemIndex, setDragOverItemIndex] = useState(null);

    const carouselInputRef = useRef(null);
    const logoInputRef = useRef(null);

    const handleCarouselUpload = (e) => {
        if (!isEditing || !e.target.files) return;

        const files = Array.from(e.target.files);
        const currentCount = formData.carouselImages.length;
        const availableSlots = 5 - currentCount;

        if (availableSlots <= 0) {
            alert("You can only upload up to 5 images.");
            return;
        }

        const filesToAdd = files.slice(0, availableSlots);
        const newImages = filesToAdd.map((file, index) => ({
            id: Date.now() + index,
            url: URL.createObjectURL(file),
            label: file.name
        }));

        setFormData(prev => ({
            ...prev,
            carouselImages: [...prev.carouselImages, ...newImages]
        }));

        if (carouselInputRef.current) carouselInputRef.current.value = "";
    };

    const handleDragStart = (index) => {
        if (!isEditing) return;
        setDraggedItemIndex(index);
    };

    const handleDragEnter = (e, index) => {
        if (!isEditing) return;
        e.preventDefault();
        setDragOverItemIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
        setDragOverItemIndex(null);
    };

    const handleDrop = (e, targetIndex) => {
        if (!isEditing) return;
        e.preventDefault();

        if (draggedItemIndex === null || draggedItemIndex === targetIndex) {
            handleDragEnd();
            return;
        }

        const newImages = [...formData.carouselImages];
        const draggedImage = newImages[draggedItemIndex];

        newImages.splice(draggedItemIndex, 1);
        newImages.splice(targetIndex, 0, draggedImage);

        setFormData(prev => ({
            ...prev,
            carouselImages: newImages
        }));

        handleDragEnd();
    };

    const handleLogoUpload = (e) => {
        if (!isEditing || !e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const newLogoUrl = URL.createObjectURL(file);

        setFormData(prev => ({
            ...prev,
            logoUrl: newLogoUrl
        }));

        if (logoInputRef.current) logoInputRef.current.value = "";
    };

    const removeLogo = () => {
        if (!isEditing) return;
        setFormData(prev => ({
            ...prev,
            logoUrl: "https://via.placeholder.com/500x500?text=PharmaDali+Logo"
        }));
    };

    const handleSave = () => {
        setIsEditing(false);
        // Logic for save settings
    };

    const removeCarouselImage = (id) => {
        if (!isEditing) return;
        setFormData(prev => ({
            ...prev,
            carouselImages: prev.carouselImages.filter(img => img.id !== id)
        }));
    };

    return (
        <SettingForm
            title="Mobile App Content"
            description="Manage content displayed in the PharmaDali customer mobile application."
            isEditing={isEditing}
            onEditChange={setIsEditing}
            onSave={handleSave}
            breadcrumbs={[
                { label: "Settings", view: "settings" },
                { label: "Mobile App Content", view: "mobile" },
            ]}
            onNavigate={onNavigate}
            noContainer={true}
        >
            <div className="settings-flex-column" style={{ gap: "2rem" }}>
                {/* Carousel Images Section */}
                <div className="settings-card" style={{ marginBottom: 0 }}>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                        <div>
                            <h6 className="settings-section-title" style={{ fontSize: "1.1rem" }}>Upload Carousel Images</h6>
                            <p className="settings-section-helper mb-0">This images will be displayed in the homepage carousel of the PharmaDali mobile app</p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <p className="settings-section-helper mb-0">You can upload up to 5 images.</p>
                            <input
                                type="file"
                                ref={carouselInputRef}
                                style={{ display: 'none' }}
                                multiple
                                accept="image/png, image/jpeg"
                                onChange={handleCarouselUpload}
                            />
                            <button
                                className="btn btn-pd-ghost btn-sm px-4"
                                disabled={!isEditing || formData.carouselImages.length >= 5}
                                onClick={() => carouselInputRef.current?.click()}
                                style={{ borderRadius: '8px', color: '#48aad9', borderColor: '#b8e0f2', padding: '0.4rem 1rem' }}
                            >
                                <span className="me-2">+</span> Upload image/s
                            </button>
                        </div>
                    </div>

                    {formData.carouselImages.length > 0 && (
                        <div className="row g-3 mb-4">
                            {formData.carouselImages.map((img, index) => (
                                <div
                                    key={img.id}
                                    className="col-12 col-md-6 col-lg-4"
                                    style={{
                                        position: "relative",
                                        opacity: draggedItemIndex === index ? 0.5 : 1,
                                        transform: dragOverItemIndex === index ? "scale(1.02)" : "scale(1)",
                                        transition: "all 0.2s ease",
                                        cursor: isEditing ? "grab" : "default"
                                    }}
                                    draggable={isEditing}
                                    onDragStart={() => handleDragStart(index)}
                                    onDragEnter={(e) => handleDragEnter(e, index)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDragEnd={handleDragEnd}
                                    onDrop={(e) => handleDrop(e, index)}
                                >
                                    <div style={{
                                        position: "absolute",
                                        top: "10px",
                                        left: "33px",
                                        backgroundColor: "var(--pd-primary-dark)",
                                        color: "white",
                                        borderRadius: "4px",
                                        padding: "2px 8px",
                                        fontSize: "0.75rem",
                                        fontWeight: "700",
                                        zIndex: 1
                                    }}>
                                        {index + 1}
                                    </div>
                                    {isEditing && (
                                        <button
                                            onClick={() => removeCarouselImage(img.id)}
                                            style={{
                                                position: "absolute",
                                                top: "10px",
                                                right: "30px",
                                                background: "#48AAD9",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "50%",
                                                width: "22px",
                                                height: "22px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "13px",
                                                cursor: "pointer",
                                                zIndex: 2
                                            }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                    <img
                                        src={img.url}
                                        alt={img.label}
                                        style={{ width: "500px", height: "260px", objectFit: "cover", borderRadius: "8px" }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{
                        border: "1px solid #b8e0f2",
                        borderRadius: "8px",
                        padding: formData.carouselImages.length > 0 ? "1.5rem" : "2.5rem 1.5rem",
                        backgroundColor: "#fff"
                    }}>
                        <div className="text-center" style={{ cursor: formData.carouselImages.length === 0 && isEditing ? "pointer" : "default" }} onClick={() => formData.carouselImages.length === 0 && isEditing && carouselInputRef.current?.click()}>
                            {formData.carouselImages.length === 0 ? (
                                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                                    <img src={uploadImagesIcon} alt="Upload" style={{ width: "24px", height: "24px" }} />
                                    <span style={{ color: "#888", fontWeight: "500", fontSize: "0.9rem" }}>Upload Images</span>
                                </div>
                            ) : (
                                <p className="settings-section-helper mb-2" style={{ fontSize: "0.85rem", color: "#888", fontWeight: "500" }}>Drag and Drop to reorder images</p>
                            )}
                            <p className="settings-section-helper mb-0" style={{ fontSize: "0.75rem", opacity: 0.7 }}>Recommended size: 1080 x 400px (Landscape) | Format: JPG, PNG</p>
                        </div>
                    </div>
                </div>

                {/* Logo Section */}
                <div className="settings-card" style={{ marginBottom: 0 }}>
                    <h6 className="settings-section-title">Upload Pharmacy Logo</h6>
                    <p className="settings-section-helper mb-4">This logo will be displayed in the PharmaDali mobile app and printed in receipts.</p>

                    <div className="row g-4 align-items-center">
                        <div className="col-md-4">
                            <div style={{ position: "relative" }}>
                                <span style={{
                                    position: "absolute",
                                    top: "10px",
                                    left: "10px",
                                    background: "var(--pd-primary-dark)",
                                    color: "white",
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    fontSize: "0.7rem",
                                    fontWeight: "600",
                                    zIndex: 1
                                }}>Current logo</span>
                                <div className="settings-logo-placeholder" style={{ height: "180px" }}>
                                    <img src={formData.logoUrl} alt="Pharmacy Logo" className="settings-logo-image" />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-5">
                            <div style={{
                                border: "1px solid #e1f0f7",
                                borderRadius: "15px",
                                padding: "1.5rem",
                                backgroundColor: "#f9fcfe"
                            }}>
                                <h6 style={{ fontSize: "0.9rem", color: "#48aad9", fontWeight: "700", marginBottom: "1rem" }}>Logo Requirements</h6>
                                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                    <li className="settings-section-helper mb-2 d-flex align-items-center gap-2">
                                        <span style={{ color: "#48aad9", fontWeight: "800" }}>✓</span> Recommended size: 500 x 500px (Square)
                                    </li>
                                    <li className="settings-section-helper mb-2 d-flex align-items-center gap-2">
                                        <span style={{ color: "#48aad9", fontWeight: "800" }}>✓</span> Format: PNG (Transparent background preferred)
                                    </li>
                                    <li className="settings-section-helper d-flex align-items-center gap-2">
                                        <span style={{ color: "#48aad9", fontWeight: "800" }}>✓</span> File size: Max 2MB
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="d-flex flex-column gap-2">
                                <input
                                    type="file"
                                    ref={logoInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/png, image/jpeg"
                                    onChange={handleLogoUpload}
                                />
                                <button
                                    className="btn btn-pd-ghost btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                                    disabled={!isEditing}
                                    onClick={() => logoInputRef.current?.click()}
                                >
                                    <span style={{ fontSize: "1.1rem" }}>☁</span> Replace Logo
                                </button>
                                <button
                                    className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                                    style={{ borderRadius: "10px", color: "#ff6b6b", borderColor: "#ffb3b3" }}
                                    disabled={!isEditing}
                                    onClick={removeLogo}
                                >
                                    <span style={{ fontSize: "1rem" }}>🗑</span> Remove logo
                                </button>
                                <button className="btn btn-pd-ghost btn-sm w-100 d-flex align-items-center justify-content-center gap-2" disabled={!isEditing}>
                                    <span style={{ fontSize: "1.1rem" }}>👁</span> Preview logo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-2">
                    <p className="settings-section-helper">
                        <img src={infoIcon} alt="Info" style={{ width: "16px", height: "16px", marginRight: "6px", verticalAlign: "middle", position: "relative", top: "-1px" }} />
                        Changes will be reflected in the mobile app after you save.
                    </p>
                </div>
            </div>
        </SettingForm>
    );
};

export default MobileAppContent;
