import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        subcategories: {
          orderBy: { sortOrder: "asc" },
          include: {
            _count: { select: { flyers: true } },
          },
        },
        _count: { select: { subcategories: true } },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Get admin categories error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);

    // Get max sort order
    const maxOrder = await prisma.category.aggregate({
      _max: { sortOrder: true },
    });

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    console.error("Create category error:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

