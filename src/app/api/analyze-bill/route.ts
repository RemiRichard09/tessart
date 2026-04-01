import { NextRequest, NextResponse } from "next/server";
import { parseBillText, calculateSavings } from "@/lib/hydro-quebec";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("bill") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Veuillez téléverser un fichier PDF." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Le fichier est trop volumineux (max 10 Mo)." },
        { status: 400 }
      );
    }

    // Parse the PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    // Dynamic import to avoid edge runtime issues
    const pdfParse = (await import("pdf-parse")).default;
    const pdfData = await pdfParse(buffer);

    const billData = parseBillText(pdfData.text);

    // Validate we extracted meaningful data
    if (billData.totalKwh === 0 && billData.amountAfterTax === 0) {
      return NextResponse.json(
        {
          error:
            "Impossible d'extraire les données de consommation de ce PDF. Assurez-vous qu'il s'agit bien d'une facture Hydro-Québec.",
        },
        { status: 422 }
      );
    }

    const savings = calculateSavings(billData);

    return NextResponse.json({ success: true, data: savings });
  } catch (error) {
    console.error("Error analyzing bill:", error);
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de l'analyse de votre facture. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}
