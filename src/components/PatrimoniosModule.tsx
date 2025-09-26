import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, QrCode, Edit3, Trash2, Package, Tag, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import QRCode from 'qrcode';

interface Patrimonio {
  id: string;
  codigo_patrimonio: string;
  nome: string;
  descricao?: string;
  categoria: string;
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  valor_aquisicao?: number;
  data_aquisicao?: string;
  fornecedor?: string;
  localizacao?: string;
  responsavel?: string;
  estado_conservacao: string;
  status: string;
  observacoes?: string;
  foto_url?: string;
  etiqueta_data?: any;
  created_at: string;
  updated_at: string;
}

const PatrimoniosModule = () => {
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatrimonio, setEditingPatrimonio] = useState<Patrimonio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    valor_aquisicao: '',
    data_aquisicao: '',
    fornecedor: '',
    localizacao: '',
    responsavel: '',
    estado_conservacao: 'bom',
    observacoes: ''
  });

  const categorias = [
    'Equipamentos de Informática',
    'Móveis e Utensílios',
    'Ferramentas',
    'Veículos',
    'Equipamentos Médicos',
    'Eletrônicos',
    'Outros'
  ];

  const estadosConservacao = [
    { value: 'otimo', label: 'Ótimo' },
    { value: 'bom', label: 'Bom' },
    { value: 'regular', label: 'Regular' },
    { value: 'ruim', label: 'Ruim' }
  ];

  const statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' },
    { value: 'manutencao', label: 'Em Manutenção' },
    { value: 'baixado', label: 'Baixado' }
  ];

  useEffect(() => {
    fetchPatrimonios();
  }, []);

  const fetchPatrimonios = async () => {
    try {
      const { data, error } = await supabase
        .from('patrimonios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatrimonios(data || []);
    } catch (error) {
      console.error('Erro ao carregar patrimônios:', error);
      toast.error('Erro ao carregar patrimônios');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePatrimonioCode = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_patrimonio_code');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      return `PAT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      let codigo_patrimonio = '';
      if (editingPatrimonio) {
        codigo_patrimonio = editingPatrimonio.codigo_patrimonio;
      } else {
        codigo_patrimonio = await generatePatrimonioCode();
      }

      const patrimonioData = {
        ...formData,
        codigo_patrimonio,
        user_id: user.id,
        valor_aquisicao: formData.valor_aquisicao ? parseFloat(formData.valor_aquisicao) : null,
      };

      if (editingPatrimonio) {
        const { error } = await supabase
          .from('patrimonios')
          .update(patrimonioData)
          .eq('id', editingPatrimonio.id);

        if (error) throw error;
        toast.success('Patrimônio atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('patrimonios')
          .insert([patrimonioData]);

        if (error) throw error;
        toast.success('Patrimônio cadastrado com sucesso!');
      }

      setIsDialogOpen(false);
      setEditingPatrimonio(null);
      resetForm();
      fetchPatrimonios();
    } catch (error) {
      console.error('Erro ao salvar patrimônio:', error);
      toast.error('Erro ao salvar patrimônio');
    }
  };

  const handleEdit = (patrimonio: Patrimonio) => {
    setEditingPatrimonio(patrimonio);
    setFormData({
      nome: patrimonio.nome,
      descricao: patrimonio.descricao || '',
      categoria: patrimonio.categoria,
      marca: patrimonio.marca || '',
      modelo: patrimonio.modelo || '',
      numero_serie: patrimonio.numero_serie || '',
      valor_aquisicao: patrimonio.valor_aquisicao?.toString() || '',
      data_aquisicao: patrimonio.data_aquisicao || '',
      fornecedor: patrimonio.fornecedor || '',
      localizacao: patrimonio.localizacao || '',
      responsavel: patrimonio.responsavel || '',
      estado_conservacao: patrimonio.estado_conservacao,
      observacoes: patrimonio.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este patrimônio?')) return;

    try {
      const { error } = await supabase
        .from('patrimonios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Patrimônio excluído com sucesso!');
      fetchPatrimonios();
    } catch (error) {
      console.error('Erro ao excluir patrimônio:', error);
      toast.error('Erro ao excluir patrimônio');
    }
  };

  const generateQRCode = async (patrimonio: Patrimonio) => {
    try {
      const qrData = JSON.stringify({
        codigo: patrimonio.codigo_patrimonio,
        nome: patrimonio.nome,
        categoria: patrimonio.categoria,
        localizacao: patrimonio.localizacao
      });
      
      const qrCodeUrl = await QRCode.toDataURL(qrData);
      
      // Create a new window to print the label
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Etiqueta - ${patrimonio.codigo_patrimonio}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  margin: 20px;
                  background: white;
                }
                .label {
                  border: 2px solid #000;
                  padding: 15px;
                  max-width: 300px;
                  margin: 0 auto;
                  background: white;
                }
                .qr-code { margin: 10px 0; }
                .info { font-size: 12px; margin: 5px 0; }
                .code { font-weight: bold; font-size: 14px; }
                @media print {
                  body { margin: 0; }
                  .label { border: 1px solid #000; }
                }
              </style>
            </head>
            <body>
              <div class="label">
                <div class="code">${patrimonio.codigo_patrimonio}</div>
                <div class="qr-code">
                  <img src="${qrCodeUrl}" alt="QR Code" width="100" height="100" />
                </div>
                <div class="info"><strong>${patrimonio.nome}</strong></div>
                <div class="info">${patrimonio.categoria}</div>
                ${patrimonio.localizacao ? `<div class="info">Local: ${patrimonio.localizacao}</div>` : ''}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
      
      toast.success('Etiqueta gerada! Janela de impressão aberta.');
    } catch (error) {
      console.error('Erro ao gerar etiqueta:', error);
      toast.error('Erro ao gerar etiqueta');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      categoria: '',
      marca: '',
      modelo: '',
      numero_serie: '',
      valor_aquisicao: '',
      data_aquisicao: '',
      fornecedor: '',
      localizacao: '',
      responsavel: '',
      estado_conservacao: 'bom',
      observacoes: ''
    });
  };

  const filteredPatrimonios = patrimonios.filter(patrimonio =>
    patrimonio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patrimonio.codigo_patrimonio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patrimonio.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'inativo': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'manutencao': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConservacaoColor = (estado: string) => {
    switch (estado) {
      case 'otimo': return 'bg-green-100 text-green-800 border-green-200';
      case 'bom': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'regular': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ruim': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Patrimônios</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setEditingPatrimonio(null);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Patrimônio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPatrimonio ? 'Editar Patrimônio' : 'Novo Patrimônio'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Item *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    placeholder="Ex: Notebook Dell"
                  />
                </div>
                
                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="marca">Marca</Label>
                  <Input
                    id="marca"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    placeholder="Ex: Dell, HP, Samsung"
                  />
                </div>
                
                <div>
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    placeholder="Ex: Inspiron 15 3000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="numero_serie">Número de Série</Label>
                  <Input
                    id="numero_serie"
                    value={formData.numero_serie}
                    onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                    placeholder="Número de série do equipamento"
                  />
                </div>
                
                <div>
                  <Label htmlFor="valor_aquisicao">Valor de Aquisição</Label>
                  <Input
                    id="valor_aquisicao"
                    type="number"
                    step="0.01"
                    value={formData.valor_aquisicao}
                    onChange={(e) => setFormData({ ...formData, valor_aquisicao: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="data_aquisicao">Data de Aquisição</Label>
                  <Input
                    id="data_aquisicao"
                    type="date"
                    value={formData.data_aquisicao}
                    onChange={(e) => setFormData({ ...formData, data_aquisicao: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="fornecedor">Fornecedor</Label>
                  <Input
                    id="fornecedor"
                    value={formData.fornecedor}
                    onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                    placeholder="Nome do fornecedor"
                  />
                </div>
                
                <div>
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    value={formData.localizacao}
                    onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                    placeholder="Ex: Sala 101, Depósito A"
                  />
                </div>
                
                <div>
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    placeholder="Nome do responsável"
                  />
                </div>
                
                <div>
                  <Label htmlFor="estado_conservacao">Estado de Conservação</Label>
                  <Select value={formData.estado_conservacao} onValueChange={(value) => setFormData({ ...formData, estado_conservacao: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosConservacao.map((estado) => (
                        <SelectItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição detalhada do item"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais"
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPatrimonio ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, código ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4">
            {filteredPatrimonios.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'Nenhum patrimônio encontrado' : 'Nenhum patrimônio cadastrado'}
                </p>
              </div>
            ) : (
              filteredPatrimonios.map((patrimonio) => (
                <Card key={patrimonio.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {patrimonio.codigo_patrimonio}
                          </span>
                          <Badge className={getStatusColor(patrimonio.status)}>
                            {statusOptions.find(s => s.value === patrimonio.status)?.label}
                          </Badge>
                          <Badge className={getConservacaoColor(patrimonio.estado_conservacao)}>
                            {estadosConservacao.find(e => e.value === patrimonio.estado_conservacao)?.label}
                          </Badge>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-lg">{patrimonio.nome}</h3>
                          <p className="text-sm text-gray-600">{patrimonio.categoria}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                          {patrimonio.marca && (
                            <span><strong>Marca:</strong> {patrimonio.marca}</span>
                          )}
                          {patrimonio.modelo && (
                            <span><strong>Modelo:</strong> {patrimonio.modelo}</span>
                          )}
                          {patrimonio.localizacao && (
                            <span><strong>Local:</strong> {patrimonio.localizacao}</span>
                          )}
                          {patrimonio.responsavel && (
                            <span><strong>Responsável:</strong> {patrimonio.responsavel}</span>
                          )}
                          {patrimonio.valor_aquisicao && (
                            <span><strong>Valor:</strong> R$ {patrimonio.valor_aquisicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          )}
                          {patrimonio.data_aquisicao && (
                            <span><strong>Aquisição:</strong> {new Date(patrimonio.data_aquisicao).toLocaleDateString('pt-BR')}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateQRCode(patrimonio)}
                          className="flex items-center gap-1"
                        >
                          <Tag className="h-3 w-3" />
                          Etiqueta
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(patrimonio)}
                          className="flex items-center gap-1"
                        >
                          <Edit3 className="h-3 w-3" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(patrimonio.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatrimoniosModule;