import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";

export async function POST(request) {
  try {
    const uploadedFile = await request.formData();
    const file = uploadedFile.get("file");
    const fileName = uploadedFile.get("fileName");
    console.log("backend: fileName: ", fileName);
    const uploadDirectory = `${process.cwd()}/public/uploads/MHS_${Date.now().toString()}${path.extname(
      fileName
    )}`;

    const extension = path.extname(fileName).toLowerCase();
    // console.log("extension: ", extension);
    if ([".jpg", ".png", ".gif", ".webp"].includes(extension)) {
      console.log("backend: extension matched;");
      console.log("dataLength:" + (file.length / 1000).toFixed(2) + " KB");
      const imageData = file.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(imageData, "base64");
      await writeFile(uploadDirectory, imageBuffer);
      return NextResponse.json({
        messege: `Image saved successfully!; size: ${(
          imageBuffer.length / 1000
        ).toFixed(2)} KB,  path:${uploadDirectory}`,
      });
    } else {
      //file is not image, handle it like other files
      console.log("file is a : " + extension + "file, not image");
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(uploadDirectory, buffer);
      return NextResponse.json({
        messege: `File saved successfully!; size:${(
          buffer.length / 1000
        ).toFixed(2)} KB, path:${uploadDirectory}`,
      });
    }
  } catch (error) {
    //console.log(error);
    return NextResponse.json({ messege: "backend catch" + error });
  }
}
