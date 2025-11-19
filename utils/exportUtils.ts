
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
import FileSaver from "file-saver";
import { ManhuaPage } from "../types";

export const exportToWord = async (pages: ManhuaPage[]) => {
  const docChildren: any[] = [];

  pages.forEach((page, index) => {
    // Page Title (Filename)
    docChildren.push(
      new Paragraph({
        text: page.imageFile.name,
        heading: HeadingLevel.HEADING_3,
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        pageBreakBefore: index > 0
      }),
      new Paragraph({ text: "" }) // Spacer
    );

    // Translations
    page.translations.forEach((t) => {
      docChildren.push(
        new Paragraph({ 
          children: [
            new TextRun({ 
                text: t.translatedText, 
                size: 28, // 14pt
                font: "Vazirmatn" 
            })
          ],
          alignment: AlignmentType.RIGHT,
          bidirectional: true
        }),
        // Add empty line (spacer)
        new Paragraph({ text: "" })
      );
    });
  });

  // Signature Footer
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Created by ManhuaMate AI - Dev: Mr.V (github.com/MrV006)",
          size: 16, // 8pt
          color: "888888"
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 }
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  
  // Handle file-saver default export variation
  const saveAs = (FileSaver as any).saveAs || FileSaver;
  
  // Determine filename
  const filename = pages.length === 1 
    ? `Translation_${pages[0].imageFile.name.split('.')[0]}.docx`
    : `Manhua_Translations_${Date.now()}.docx`;
    
  saveAs(blob, filename);
};
