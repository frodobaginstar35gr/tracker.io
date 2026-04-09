import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const foods = await prisma.food.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(foods);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch foods" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const food = await prisma.food.create({
      data: {
        name: body.name,
        brand: body.brand,
        referenceType: body.referenceType,
        servingSize: body.servingSize,
        servingUnit: body.servingUnit,
        calories: body.calories,
        protein: body.protein,
        carbs: body.carbs,
        fat: body.fat,
      },
    });

    return NextResponse.json(food);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create food" }, { status: 500 });
  }
}
