import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  try {
    const { subId } = await params;
    const body = await request.json();

    const subcategory = await prisma.subcategory.update({
      where: { id: subId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    return NextResponse.json({ subcategory });
  } catch (error) {
    console.error("Update subcategory error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  try {
    const { subId } = await params;

    await prisma.subcategory.delete({
      where: { id: subId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete subcategory error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

