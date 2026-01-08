import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const subcategoryId = searchParams.get("subcategoryId");

    const whereClause: any = { active: true };

    if (subcategoryId) {
      whereClause.subcategoryId = subcategoryId;
    } else if (categoryId) {
      whereClause.subcategory = {
        categoryId: categoryId,
      };
    }

    const flyers = await prisma.flyer.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        subcategory: {
          include: {
            category: true,
          },
        },
        _count: {
          select: { views: true, requests: true },
        },
      },
    });

    return NextResponse.json({ flyers });
  } catch (error) {
    console.error("Get flyers error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
