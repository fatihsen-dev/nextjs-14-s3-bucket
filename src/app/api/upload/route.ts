import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

const url = new URL(
   `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com`
);

const s3Client = new S3Client({
   region: process.env.AWS_S3_REGION ?? "",
   credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY ?? "",
   },
});

export async function POST(request: NextRequest) {
   const formData = await request.formData();
   const file = formData.get("file");

   if (file instanceof File) {
      if (file.size > 5 * 1024 * 1024) {
         return NextResponse.json(
            { message: "File size must be less than 5MB" },
            { status: 400 }
         );
      }
      if (!file.type.includes("image")) {
         return NextResponse.json({ message: "File must be an image" }, { status: 400 });
      }

      const fileName = `${file.name}-${Date.now()}`;
      const uploadedFileName = await fileUpload(file, fileName);

      return NextResponse.json({ fileName: `${url}${uploadedFileName}` });
   } else {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
   }
}

const fileUpload = async (file: File, fileName: string) => {
   const buffer = Buffer.from(await file.arrayBuffer());

   const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${fileName}`,
      Body: buffer,
      ContentType: "image/jpg",
   };

   const command = new PutObjectCommand(params);
   await s3Client.send(command);
   return fileName;
};
