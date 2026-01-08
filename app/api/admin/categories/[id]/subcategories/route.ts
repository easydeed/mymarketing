import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);

    // Get max sort order for this category
    const maxOrder = await prisma.subcategory.aggregate({
      where: { categoryId },
      _max: { sortOrder: true },
    });

    const subcategory = await prisma.subcategory.create({
      data: {
        name,
        slug,
        categoryId,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    });

    return NextResponse.json({ subcategory });
  } catch (error: any) {
    console.error("Create subcategory error:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A subcategory with this name already exists in this category" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

