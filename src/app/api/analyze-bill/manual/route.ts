import { NextRequest, NextResponse } from "next/server";
import { calculateSavings, BillData } from "@/lib/hydro-quebec";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { totalKwh, amountAfterTax, days } = body;

    if (!totalKwh || totalKwh <= 0) {
      return NextResponse.json(
        { error: "Veuillez entrer une consommation valide en kWh." },
        { status: 400 }
      );
    }

    const billData: BillData = {
      periodStart: "",
      periodEnd: "",
      days: days || 30,
      totalKwh: parseFloat(totalKwh),
      amountBeforeTax: amountAfterTax
        ? parseFloat(amountAfterTax) / 1.14975
        : 0,
      amountAfterTax: amountAfterTax ? parseFloat(amountAfterTax) : 0,
      avgDailyKwh: parseFloat(totalKwh) / (days || 30),
      rateType: "D",
    };

    const savings = calculateSavings(billData);

    return NextResponse.json({ success: true, data: savings });
  } catch (error) {
    console.error("Error calculating savings:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
