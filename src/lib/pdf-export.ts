import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function exportToPdf(element: HTMLElement, filename: string) {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: true,
      backgroundColor: "#ffffff",
      onclone: (document, clonedElement) => {
        const svgs = clonedElement.querySelectorAll('svg');
        svgs.forEach((svg) => {
          svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        });
      }
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF("p", "mm", "a4");
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= 297;

    while (heightLeft > 0) {
      position -= 297;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("PDF Export Error:", error);
    alert("Gagal membuat PDF. Cek console log browser.");
    throw error;
  }
}
