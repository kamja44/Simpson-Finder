import { NextRequest, NextResponse } from "next/server";

/**
 * 이미지 프록시 API Route
 * - 역할: CORS 우회를 위해 서버에서 이미지를 가져와서 클라이언트에 전달
 * - 용도: Face-API가 캐릭터 이미지를 분석할 수 있도록 함
 */
export async function GET(request: NextRequest) {
  try {
    const imageUrl = request.nextUrl.searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    const response = await fetch(imageUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: response.status }
      );
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/webp",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Proxy Error: ", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
