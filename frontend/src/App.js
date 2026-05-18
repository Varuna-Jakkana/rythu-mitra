import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import soilImg from "./assets/imm.jpeg";

function App() {
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  // BACKEND CONNECTION
  const handleDetect = async () => {
    setError("");
    if (!image) {
      alert("Please upload image");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "📶 Please turn on internet / mobile data");
        return;
      }
      setError("");
      setResult({
        soil: data.soil,
        crops: data.crops.map((c) => ({
          name: c.crop,
          
        })),
      });

    } catch (error) {
      console.error(error);
      setError("📶 No internet connection. Please turn on mobile data");
    }
  };

  return (
    <div className="bg-[#f5f3ef] text-gray-900 min-h-screen">
      
      {/* NAVBAR */}
      <div className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold">🌾 {t("titleApp")}</h1>

        <div className="flex gap-6 text-sm">
  <span
    className="cursor-pointer hover:text-green-700"
    onClick={() =>
      document.getElementById("howSection")?.scrollIntoView({ behavior: "smooth" })
    }
  >
    {t("how")}
  </span>
  <span
    className="cursor-pointer hover:text-green-700"
    onClick={() =>
      document.getElementById("uploadSection")?.scrollIntoView({ behavior: "smooth" })
    }
  >
    {t("analyze")}
  </span>
  
  <span
    className="cursor-pointer hover:text-green-700"
    onClick={() =>
      document.getElementById("featuresSection")?.scrollIntoView({ behavior: "smooth" })
    }
  >
    {t("features")}
  </span>

  

</div>

        {/* LANGUAGE */}
        <select
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="en">EN</option>
          <option value="te">తెలుగు</option>
          <option value="hi">हिंदी</option>
          <option value="ta">தமிழ்</option>
          <option value="mr">मराठी</option>
          <option value="pa">ਪੰਜਾਬੀ</option>
        </select>
      </div>

      {/* ================= HERO ================= */}
      <div className="relative h-[90vh] flex items-center justify-center text-center">

        <img
          src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae"
          alt="farm"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 text-white px-6">

          <h1 className="text-6xl md:text-7xl font-bold mb-4">
            {t("titleApp")} <span className="text-green-400">AI</span>
          </h1>

          <p className="text-xl md:text-2xl mb-4">
            {t("title")}
          </p>

          <p className="text-gray-200 mb-8">
            {t("subtitle")}
          </p>

         <div className="flex justify-center gap-4 flex-wrap">

  {/* Upload Button */}
  <button
    onClick={() => {
      document
        .getElementById("uploadSection")
        ?.scrollIntoView({ behavior: "smooth" });
    }}
    className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-full text-lg"
  >
    {t("upload")}
  </button>
</div>

        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="howSection" className="px-8 py-20 bg-[#f6f4ef]">

        <div className="text-center mb-16">
          <p className="text-sm tracking-widest text-gray-700 mb-2">
            {t("how")}
          </p>
          <h2 className="text-4xl font-bold">
            {t("howTitle")}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-white/80 backdrop-blur rounded-3xl p-8 relative shadow-md hover:shadow-lg transition">
            <div className="absolute -top-4 left-6 bg-black text-white text-xs px-4 py-1 rounded-full">
              STEP 01
            </div>
            <h3 className="text-xl font-bold mb-2">{t("step1Title")}</h3>
            <p className="text-gray-600">{t("step1Desc")}</p>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-3xl p-8 relative shadow-md hover:shadow-lg transition">
            <div className="absolute -top-4 left-6 bg-black text-white text-xs px-4 py-1 rounded-full">
              STEP 02
            </div>
            <h3 className="text-xl font-bold mb-2">{t("step2Title")}</h3>
            <p className="text-gray-600">{t("step2Desc")}</p>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-3xl p-8 relative shadow-md hover:shadow-lg transition">
            <div className="absolute -top-4 left-6 bg-black text-white text-xs px-4 py-1 rounded-full">
              STEP 03
            </div>
            <h3 className="text-xl font-bold mb-2">{t("step3Title")}</h3>
            <p className="text-gray-600">{t("step3Desc")}</p>
          </div>

        </div>
      </div>

      {/* ================= UPLOAD ================= */}
      <div
        id="uploadSection"
        className="bg-white mx-8 p-8 rounded-2xl shadow-lg"
      >
        <h2 className="text-3xl font-bold text-center mb-6">
          {t("analyzeSoil")}
        </h2>
        {error && (
          <p className="text-red-600 text-center mb-4 font-semibold">
            {error}
            </p>
          )}
        <div
          className="border-2 border-dashed border-green-600 p-10 text-center rounded-xl cursor-pointer hover:bg-green-50 transition"
          onClick={() => document.getElementById("fileInput").click()}
        >
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImage(file);
                setPreview(URL.createObjectURL(file));
              }
            }}
          />

          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="mx-auto rounded-xl max-h-60"
            />
          ) : (
            <p className="text-gray-600">{t("drag")}</p>
          )}
        </div>

        <button
          onClick={handleDetect}
          className="w-full mt-6 bg-green-700 text-white py-4 rounded-xl text-lg hover:bg-green-800 transition"
        >
          {t("detect")}
        </button>
      </div>

      {/* RESULTS */}
      {result && (
        <div className="px-8 py-12">

          <h2 className="text-4xl font-bold text-center mb-8">
            {t("report")}
          </h2>

          <div className="max-w-md mx-auto mb-10">
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h3>{t("soil")}</h3>
              <p className="text-2xl font-bold">{t(result.soil.toLowerCase(), result.soil)}</p>
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-6 text-center">
            🌾 {t("crops")}
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {result.crops.map((c, i) => (
              <div
                key={i}
                className="bg-[#e9e3d9] rounded-2xl p-6 shadow-sm relative hover:shadow-md transition"
              >
                

                <h3 className="text-xl font-bold mb-2">
                  {t(c.name.toLowerCase().replace(" ", "_"), c.name)}
                  <p>{t("cropDesc")}</p>
                </h3>

                

                

                

              </div>
            ))}
          </div>

        </div>
      )}

       {/* FEATURES SECTION (AFTER REPORT) */}
<div id="featuresSection" className="px-8 py-20 bg-[#f6f4ef]">

  {/* TITLE */}
  <div className="text-center mb-12">
    <p className="text-xs tracking-widest text-gray-500 mb-2">
      {t("features")}
    </p>

    <h2 className="text-4xl font-bold mb-4">
      {t("whyTitle")}
    </h2>

    <p className="text-gray-600 max-w-2xl mx-auto">
      {t("whySubtitle")}
    </p>
  </div>

  {/* GRID */}
  <div className="grid md:grid-cols-2 gap-8 items-center">

    {/* LEFT IMAGE */}
    <div className="relative">
      <img
        src={soilImg}
        alt="soil"
        className="rounded-3xl shadow-lg"
      />

      <div className="absolute bottom-6 left-6 text-white">
        <p className="text-xs opacity-80">{t("trusted")}</p>
        <p className="text-2xl font-bold">
          {t("tagline")}
        </p>
      </div>
    </div>

    {/* RIGHT CARDS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

      {/* CARD 1 */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <div className="bg-green-100 w-10 h-10 flex items-center justify-center rounded-xl mb-4">
          🧠
        </div>
        <h3 className="font-bold text-lg">{t("feature1Title")}</h3>
        <p className="text-gray-600 text-sm mt-2">
 {t("feature1Desc")}        </p>
      </div>

      {/* CARD 2 */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <div className="bg-green-100 w-10 h-10 flex items-center justify-center rounded-xl mb-4">
          🌱
        </div>
        <h3 className="font-bold text-lg">{t("feature2Title")}</h3>
        <p className="text-gray-600 text-sm mt-2">
          {t("feature2Desc")}
        </p>
      </div>

      {/* CARD 3 */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <div className="bg-green-100 w-10 h-10 flex items-center justify-center rounded-xl mb-4">
          📈
        </div>
        <h3 className="font-bold text-lg">{t("feature3Title")}</h3>
        <p className="text-gray-600 text-sm mt-2">
          {t("feature3Desc")}
        </p>
      </div>

      {/* CARD 4 */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <div className="bg-green-100 w-10 h-10 flex items-center justify-center rounded-xl mb-4">
          📱
        </div>
        <h3 className="font-bold text-lg">{t("feature4Title")}</h3>
        <p className="text-gray-600 text-sm mt-2">
          {t("feature4Desc")}
        </p>
      </div>

    </div>

  </div>
</div>

    </div>
  );
}

export default App;