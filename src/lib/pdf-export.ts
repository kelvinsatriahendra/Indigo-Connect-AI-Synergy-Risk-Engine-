import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function exportToPdf(element: HTMLElement, filename: string) {
  try {
    // Clone the element and remove problematic elements
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      imageTimeout: 5000,
      onclone: (_document, clonedElement) => {
        // Fix SVGs for proper rendering
        const svgs = clonedElement.querySelectorAll('svg');
        svgs.forEach((svg) => {
          svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        });
        // Remove any elements that might cause CORS issues
        const externalImages = clonedElement.querySelectorAll('img[src^="http"]');
        externalImages.forEach((img) => {
          img.setAttribute('crossorigin', 'anonymous');
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
    // Fallback: use browser print
    window.print();
    return true;
  }
}
