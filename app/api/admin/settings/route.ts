import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: "settings" },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { galleryPassword } = await request.json();

    if (!galleryPassword) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.upsert({
      where: { id: "settings" },
      update: { galleryPassword },
      create: { id: "settings", galleryPassword },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

