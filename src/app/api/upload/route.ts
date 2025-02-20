import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';
import { preparedoc } from "@/scripts/pinecone-prepare-pdf";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
 
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // const uploadDir = path.join(process.cwd(), 'test', 'data');
    const docsDir = '/tmp';
    // const docsDir=path.join(process.cwd(), 'tmp');
    // Create directory if it doesn't exist
    // if (!fs.existsSync(uploadDir)) {
    //   fs.mkdirSync(uploadDir, { recursive: true });
    // }
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // const destinationPath = path.join(uploadDir, '05-versions-space.pdf');
    const docstargetPath= path.join(docsDir,'target-docs.pdf')
    // await writeFile(destinationPath, buffer);
    await writeFile(docstargetPath, buffer);
    
    await preparedoc()



    return NextResponse.json(
      { message: 'File uploaded successfully & deployed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };