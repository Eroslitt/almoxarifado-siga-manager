
import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Printer, Download, FileText } from 'lucide-react';
import { Tool } from '@/types/database';
import QRCode from 'qrcode';

interface LabelPrinterProps {
  tools: Tool[];
}

interface LabelTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  description: string;
}

const labelTemplates: LabelTemplate[] = [
  {
    id: 'small',
    name: 'Pequena (30x20mm)',
    width: 113,
    height: 76,
    description: 'Para ferramentas pequenas'
  },
  {
    id: 'medium',
    name: 'Média (50x30mm)',
    width: 189,
    height: 113,
    description: 'Para ferramentas médias'
  },
  {
    id: 'large',
    name: 'Grande (70x50mm)',
    width: 264,
    height: 189,
    description: 'Para ferramentas grandes'
  }
];

export const LabelPrinter = ({ tools }: LabelPrinterProps) => {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('medium');
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const toggleToolSelection = (toolId: string) => {
    setSelectedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const selectAllTools = () => {
    setSelectedTools(tools.map(tool => tool.id));
  };

  const clearSelection = () => {
    setSelectedTools([]);
  };

  const generateQRCodeForTool = async (tool: Tool): Promise<string> => {
    const qrPayload = JSON.stringify({
      toolId: tool.id,
      type: 'TOOL',
      timestamp: new Date().toISOString()
    });

    return await QRCode.toDataURL(qrPayload, {
      width: 100,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
  };

  const generatePDF = async () => {
    if (selectedTools.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma ferramenta",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const template = labelTemplates.find(t => t.id === selectedTemplate)!;
      const pdf = new jsPDF({
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = 595;
      const pageHeight = 842;
      const marginX = 40;
      const marginY = 40;
      
      // Calcular quantas etiquetas cabem por linha e coluna
      const labelsPerRow = Math.floor((pageWidth - 2 * marginX) / template.width);
      const labelsPerCol = Math.floor((pageHeight - 2 * marginY) / template.height);

      let currentLabel = 0;
      let currentPage = 1;

      for (const toolId of selectedTools) {
        const tool = tools.find(t => t.id === toolId)!;
        const qrCodeUrl = await generateQRCodeForTool(tool);

        const row = Math.floor(currentLabel / labelsPerRow);
        const col = currentLabel % labelsPerRow;

        // Se passou do limite da página, criar nova página
        if (row >= labelsPerCol) {
          pdf.addPage();
          currentLabel = 0;
          currentPage++;
        }

        const x = marginX + col * template.width;
        const y = marginY + (currentLabel % (labelsPerRow * labelsPerCol)) * template.height / labelsPerCol;

        // Desenhar borda da etiqueta
        pdf.setDrawColor(200);
        pdf.rect(x, y, template.width, template.height);

        // Adicionar QR Code
        const qrSize = Math.min(template.width * 0.4, template.height * 0.6);
        pdf.addImage(qrCodeUrl, 'PNG', x + 5, y + 5, qrSize, qrSize);

        // Adicionar texto da ferramenta
        pdf.setFontSize(8);
        pdf.setTextColor(0);
        
        const textX = x + qrSize + 10;
        const textY = y + 15;
        const textWidth = template.width - qrSize - 20;

        // Nome da ferramenta (quebrado em linhas se necessário)
        const toolName = tool.name.length > 25 ? tool.name.substring(0, 22) + '...' : tool.name;
        pdf.text(toolName, textX, textY, { maxWidth: textWidth });

        // ID da ferramenta
        pdf.setFontSize(6);
        pdf.text(`ID: ${tool.id}`, textX, textY + 15);

        // Categoria
        pdf.text(`Cat: ${tool.category}`, textX, textY + 25);

        // Localização
        pdf.text(`Loc: ${tool.location}`, textX, textY + 35);

        currentLabel++;
      }

      // Salvar PDF
      pdf.save(`etiquetas-ferramentas-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "Sucesso",
        description: `PDF gerado com ${selectedTools.length} etiquetas`,
      });

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF das etiquetas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate_obj = labelTemplates.find(t => t.id === selectedTemplate)!;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Printer className="h-5 w-5 text-blue-600" />
            <span>Impressão de Etiquetas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de Template */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Template de Etiqueta</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {labelTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-gray-500">{template.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Controles de Seleção */}
          <div className="flex justify-between items-center">
            <div className="space-x-2">
              <Button onClick={selectAllTools} variant="outline" size="sm">
                Selecionar Todas
              </Button>
              <Button onClick={clearSelection} variant="outline" size="sm">
                Limpar Seleção
              </Button>
            </div>
            <Badge variant="outline">
              {selectedTools.length} de {tools.length} selecionadas
            </Badge>
          </div>

          {/* Lista de Ferramentas */}
          <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3">
            {tools.map(tool => (
              <div
                key={tool.id}
                onClick={() => toggleToolSelection(tool.id)}
                className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                  selectedTools.includes(tool.id)
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTools.includes(tool.id)}
                  onChange={() => toggleToolSelection(tool.id)}
                  className="rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{tool.name}</div>
                  <div className="text-xs text-gray-500">
                    ID: {tool.id} • {tool.category} • {tool.location}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Preview do Template */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-2">Preview do Template: {selectedTemplate_obj.name}</h4>
            <div
              className="border-2 border-dashed border-gray-300 bg-white mx-auto"
              style={{
                width: `${selectedTemplate_obj.width}px`,
                height: `${selectedTemplate_obj.height}px`,
                transform: 'scale(0.8)',
                transformOrigin: 'top left'
              }}
            >
              <div className="p-2 h-full flex">
                <div className="w-12 h-12 bg-gray-200 border flex items-center justify-center text-xs">
                  QR
                </div>
                <div className="flex-1 ml-2 text-xs">
                  <div className="font-medium">Nome da Ferramenta</div>
                  <div className="text-gray-600">ID: FER-XXXX</div>
                  <div className="text-gray-600">Cat: Categoria</div>
                  <div className="text-gray-600">Loc: A-01-01</div>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Gerar PDF */}
          <Button
            onClick={generatePDF}
            disabled={loading || selectedTools.length === 0}
            className="w-full"
          >
            {loading ? (
              <FileText className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Gerar PDF das Etiquetas ({selectedTools.length} selecionadas)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
