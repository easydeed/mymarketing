import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const flyers = await prisma.flyer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subcategory: {
          include: {
            category: true,
          },
        },
        _count: { select: { views: true, requests: true } },
      },
    });

    return NextResponse.json({ flyers });
  } catch (error) {
    console.error("Get admin flyers error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, imageUrl, subcategoryId } = await request.json();

    if (!title || !imageUrl || !subcategoryId) {
      return NextResponse.json(
        { error: "Title, image, and subcategory are required" },
        { status: 400 }
      );
    }

    // Get or create settings and generate code
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: "settings" },
      });
    }

    const code = `PROMO-${String(settings.nextFlyerNumber).padStart(4, "0")}`;

    // Create flyer and update settings in a transaction
    const [flyer] = await prisma.$transaction([
      prisma.flyer.create({
        data: {
          code,
          title,
          description: description || null,
          imageUrl,
          subcategoryId,
        },
      }),
      prisma.settings.update({
        where: { id: "settings" },
        data: { nextFlyerNumber: settings.nextFlyerNumber + 1 },
      }),
    ]);

    return NextResponse.json({ flyer });
  } catch (error) {
    console.error("Create flyer error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
