import React, { useState, useRef } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Camera, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MaterialVerification {
  id: string;
  material_name: string;
  supplier: string;
  batch_number: string;
  quantity: number;
  unit: string;
  delivery_date: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  inspector_name: string;
  inspector_signature: string;
  quality_check: any;
  notes: string;
  photos: string[];
  created_at: string;
}

export const MaterialVerificationModule = () => {
  const [verifications, setVerifications] = useState<MaterialVerification[]>([]);
  const [newVerification, setNewVerification] = useState({
    material_name: '',
    supplier: '',
    batch_number: '',
    quantity: 0,
    unit: '',
    delivery_date: '',
    inspector_name: '',
    notes: ''
  });
  const [qualityChecks, setQualityChecks] = useState({
    visual_inspection: false,
    dimensions_ok: false,
    documentation_complete: false,
    condition_good: false
  });
  const [isSignatureMode, setIsSignatureMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setNewVerification(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQualityCheck = (check: string, value: boolean) => {
    setQualityChecks(prev => ({
      ...prev,
      [check]: value
    }));
  };

  const startSignature = () => {
    setIsSignatureMode(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const signature = canvas.toDataURL();
      // Here you would save the signature
      toast({
        title: "Assinatura capturada",
        description: "Assinatura digital salva com sucesso."
      });
      setIsSignatureMode(false);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const submitVerification = async () => {
    try {
      const canvas = canvasRef.current;
      const signature = canvas?.toDataURL() || '';

      const verificationData = {
        ...newVerification,
        quality_check: qualityChecks,
        inspector_signature: signature,
        verification_status: Object.values(qualityChecks).every(Boolean) ? 'approved' : 'pending'
      };

      const { error } = await (supabase as any)
        .from('material_verifications')
        .insert([verificationData]);

      if (error) throw error;

      toast({
        title: "Verificação salva",
        description: "Ficha de verificação de material criada com sucesso."
      });

      // Reset form
      setNewVerification({
        material_name: '',
        supplier: '',
        batch_number: '',
        quantity: 0,
        unit: '',
        delivery_date: '',
        inspector_name: '',
        notes: ''
      });
      setQualityChecks({
        visual_inspection: false,
        dimensions_ok: false,
        documentation_complete: false,
        condition_good: false
      });
      clearSignature();

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar verificação.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      approved: "default",
      rejected: "destructive",
      pending: "secondary"
    };
    
    const labels = {
      approved: "Aprovado",
      rejected: "Rejeitado",
      pending: "Pendente"
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status as keyof typeof labels]}</span>
      </Badge>
    );
  };

  return (
    <PageContainer
      title="Verificação de Materiais"
      description="Sistema digital para verificação da qualidade de materiais na chegada à obra"
    >
      <Tabs defaultValue="new-verification" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new-verification">Nova Verificação</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="new-verification">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ficha de Verificação de Material
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material_name">Nome do Material</Label>
                  <Input
                    id="material_name"
                    value={newVerification.material_name}
                    onChange={(e) => handleInputChange('material_name', e.target.value)}
                    placeholder="Ex: Cimento Portland CP-II"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Fornecedor</Label>
                  <Input
                    id="supplier"
                    value={newVerification.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    placeholder="Nome do fornecedor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch_number">Número do Lote</Label>
                  <Input
                    id="batch_number"
                    value={newVerification.batch_number}
                    onChange={(e) => handleInputChange('batch_number', e.target.value)}
                    placeholder="Lote/Série do material"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_date">Data de Entrega</Label>
                  <Input
                    id="delivery_date"
                    type="date"
                    value={newVerification.delivery_date}
                    onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newVerification.quantity}
                    onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Select onValueChange={(value) => handleInputChange('unit', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                      <SelectItem value="m3">Metros cúbicos (m³)</SelectItem>
                      <SelectItem value="m2">Metros quadrados (m²)</SelectItem>
                      <SelectItem value="m">Metros (m)</SelectItem>
                      <SelectItem value="un">Unidades</SelectItem>
                      <SelectItem value="saco">Sacos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspector_name">Nome do Inspetor</Label>
                <Input
                  id="inspector_name"
                  value={newVerification.inspector_name}
                  onChange={(e) => handleInputChange('inspector_name', e.target.value)}
                  placeholder="Nome completo do responsável pela verificação"
                />
              </div>

              <div className="space-y-4">
                <Label>Verificações de Qualidade</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'visual_inspection', label: 'Inspeção Visual' },
                    { key: 'dimensions_ok', label: 'Dimensões Conformes' },
                    { key: 'documentation_complete', label: 'Documentação Completa' },
                    { key: 'condition_good', label: 'Bom Estado de Conservação' }
                  ].map((check) => (
                    <div key={check.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={check.key}
                        checked={qualityChecks[check.key as keyof typeof qualityChecks]}
                        onChange={(e) => handleQualityCheck(check.key, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={check.key}>{check.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={newVerification.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observações adicionais sobre o material"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>Assinatura Digital</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {!isSignatureMode ? (
                    <div className="text-center">
                      <Button onClick={startSignature} variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Assinar Digitalmente
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={200}
                        className="border border-gray-300 rounded w-full cursor-crosshair"
                        onMouseDown={(e) => {
                          const canvas = canvasRef.current;
                          if (canvas) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              const rect = canvas.getBoundingClientRect();
                              ctx.beginPath();
                              ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                            }
                          }
                        }}
                        onMouseMove={(e) => {
                          const canvas = canvasRef.current;
                          if (canvas && e.buttons === 1) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              const rect = canvas.getBoundingClientRect();
                              ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                              ctx.stroke();
                            }
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button onClick={saveSignature} size="sm">
                          Salvar Assinatura
                        </Button>
                        <Button onClick={clearSignature} variant="outline" size="sm">
                          Limpar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={submitVerification} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Salvar Verificação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Verificações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {verifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma verificação encontrada
                  </div>
                ) : (
                  verifications.map((verification) => (
                    <div key={verification.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{verification.material_name}</h3>
                        {getStatusBadge(verification.verification_status)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Fornecedor: {verification.supplier}</p>
                        <p>Lote: {verification.batch_number}</p>
                        <p>Quantidade: {verification.quantity} {verification.unit}</p>
                        <p>Inspetor: {verification.inspector_name}</p>
                        <p>Data: {new Date(verification.delivery_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};