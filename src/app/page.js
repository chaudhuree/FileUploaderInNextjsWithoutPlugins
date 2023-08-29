"use client";
import { useState } from "react";
import { imageResizer } from "./helpers/imageResizer";

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  //function to get file extension name
  const getExtension = (name) => {
    return name.split(".").pop();
  };

  //handleUpload function
  const handleUpload = async () => {
    setLoading(true);
    try {
      if (!selected) {
        alert("File not selected!");
        return;
      }

      const formData = new FormData();

      //check file extension. If it is image, resize it
      if (["jpg", "png", "gif", "webp"].includes(getExtension(selected.name))) {
        const resized = await imageResizer(selected, 0.6); //0.6 means reduce image size 60%, use any value between 0-1
        alert(JSON.stringify(resized));
        formData.append("file", resized.resizedData);
        formData.append("fileName", selected.name);
        const imageData = {
          name: selected.name,
          type: selected.type,
          data: resized.resizedData,
        };
        alert("imageData: " + JSON.stringify(imageData));
        setSelected(imageData);
      } else {
        formData.append("file", selected);
        formData.append("fileName", selected.name);
      }

      const request = await fetch("/api/upload/", {
        method: "POST",
        body: formData,
      });
      const response = await request.json();
      alert(JSON.stringify(response.messege));
    } catch (error) {
      console.log("frontend catch", error);
      alert("Frontend catch" + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <br />
      <input
        type="file"
        onChange={(event) => setSelected(event.target.files[0])}
      />
      <button
        className=" p-2 bg-slate-800 text-2xl font-semibold text-white"
        onClick={handleUpload}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {selected &&
      ["jpg", "png", "gif"].includes(getExtension(selected.name)) ? (
        <img
          src={selected.data ? selected.data : null}
          style={{ width: "100vmin", margin: "10px auto" }}
        />
      ) : null}
      <br />
    </>
  );
}
