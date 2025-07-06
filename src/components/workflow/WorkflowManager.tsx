
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, X, User, Bell } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  assignee: string;
  dueDate: string;
  comments?: string;
}

interface WorkflowInstance {
  id: string;
  name: string;
  type: 'tool_request' | 'maintenance' | 'purchase' | 'disposal';
  requestor: string;
  created: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  currentStep: number;
  steps: WorkflowStep[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const mockWorkflows: WorkflowInstance[] = [
  {
    id: '1',
    name: 'Solicitação de Furadeira Industrial',
    type: 'tool_request',
    requestor: 'João Silva',
    created: '2024-01-20',
    status: 'in_progress',
    currentStep: 1,
    priority: 'high',
    steps: [
      {
        id: '1',
        name: 'Aprovação do Supervisor',
        status: 'completed',
        assignee: 'Maria Santos',
        dueDate: '2024-01-21',
        comments: 'Aprovado com restrições de uso'
      },
      {
        id: '2', 
        name: 'Aprovação Orçamentária',
        status: 'in_progress',
        assignee: 'Carlos Lima',
        dueDate: '2024-01-22'
      },
      {
        id: '3',
        name: 'Processo de Compra',
        status: 'pending',
        assignee: 'Ana Costa',
        dueDate: '2024-01-25'
      }
    ]
  },
  {
    id: '2',
    name: 'Manutenção Preventiva - Serra Circular',
    type: 'maintenance',
    requestor: 'Sistema Automático',
    created: '2024-01-19',
    status: 'pending',
    currentStep: 0,
    priority: 'medium',
    steps: [
      {
        id: '1',
        name: 'Agendamento',
        status: 'pending',
        assignee: 'Pedro Alves',
        dueDate: '2024-01-23'
      },
      {
        id: '2',
        name: 'Execução',
        status: 'pending',
        assignee: 'Equipe Técnica',
        dueDate: '2024-01-24'
      },
      {
        id: '3',
        name: 'Validação',
        status: 'pending',
        assignee: 'Maria Santos',
        dueDate: '2024-01-25'
      }
    ]
  }
];

export const WorkflowManager: React.FC = () => {
  const [workflows] = useState<WorkflowInstance[]>(mockWorkflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInstance | null>(null);
  const isMobile = useMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'rejected': return <X className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const calculateProgress = (workflow: WorkflowInstance) => {
    const completedSteps = workflow.steps.filter(step => step.status === 'completed').length;
    return (completedSteps / workflow.steps.length) * 100;
  };

  const handleApprove = (workflowId: string, stepId: string) => {
    console.log(`Aprovando step ${stepId} do workflow ${workflowId}`);
    // Implementar lógica de aprovação
  };

  const handleReject = (workflowId: string, stepId: string) => {
    console.log(`Rejeitando step ${stepId} do workflow ${workflowId}`);
    // Implementar lógica de rejeição
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>Gestão de Workflows</h2>
          <p className="text-muted-foreground text-sm">
            Controle e aprovação de processos
          </p>
        </div>
        <Button size={isMobile ? "sm" : "default"}>
          <Bell className="h-4 w-4 mr-2" />
          Notificações (3)
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className={cn(
          "grid w-full",
          isMobile ? "grid-cols-2 h-8" : "grid-cols-4 h-10"
        )}>
          <TabsTrigger value="active" className={isMobile ? "text-xs" : "text-sm"}>
            Ativos ({workflows.filter(w => w.status === 'in_progress').length})
          </TabsTrigger>
          <TabsTrigger value="pending" className={isMobile ? "text-xs" : "text-sm"}>
            Pendentes ({workflows.filter(w => w.status === 'pending').length})
          </TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="completed">Concluídos</TabsTrigger>
              <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
          )}>
            {workflows
              .filter(workflow => workflow.status === 'in_progress')
              .map(workflow => (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                <CardHeader className={isMobile ? "pb-2" : "pb-4"}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className={cn(
                        "mb-2",
                        isMobile ? "text-sm" : "text-lg"
                      )}>
                        {workflow.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(workflow.status)}>
                          {workflow.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                        </Badge>
                        <Badge className={getPriorityColor(workflow.priority)}>
                          {workflow.priority === 'high' ? 'Alta' : 
                           workflow.priority === 'urgent' ? 'Urgente' :
                           workflow.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                      <p className={cn(
                        "text-muted-foreground",
                        isMobile ? "text-xs" : "text-sm"
                      )}>
                        Solicitado por: {workflow.requestor} • {workflow.created}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className={isMobile ? "pt-0" : ""}>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={cn(
                          "font-medium",
                          isMobile ? "text-xs" : "text-sm"
                        )}>
                          Progresso
                        </span>
                        <span className={cn(
                          "text-muted-foreground",
                          isMobile ? "text-xs" : "text-sm"
                        )}>
                          {Math.round(calculateProgress(workflow))}%
                        </span>
                      </div>
                      <Progress value={calculateProgress(workflow)} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      {workflow.steps.map((step, index) => (
                        <div
                          key={step.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded border",
                            index === workflow.currentStep && "bg-blue-50 border-blue-200"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(step.status)}
                            <div>
                              <p className={cn(
                                "font-medium",
                                isMobile ? "text-xs" : "text-sm"
                              )}>
                                {step.name}
                              </p>
                              <p className={cn(
                                "text-muted-foreground",
                                isMobile ? "text-xs" : "text-sm"
                              )}>
                                <User className="h-3 w-3 inline mr-1" />
                                {step.assignee}
                              </p>
                            </div>
                          </div>
                          {step.status === 'in_progress' && (
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleApprove(workflow.id, step.id)}
                                className={isMobile ? "h-6 px-2 text-xs" : ""}
                              >
                                Aprovar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleReject(workflow.id, step.id)}
                                className={isMobile ? "h-6 px-2 text-xs" : ""}
                              >
                                Rejeitar
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      size={isMobile ? "sm" : "default"}
                      onClick={() => setSelectedWorkflow(workflow)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Workflows pendentes de início aparecerão aqui</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
