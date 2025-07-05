import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  error: Error;
  resetError: () => void;
}

export const ErrorBoundary = ({ error, resetError }: ErrorBoundaryProps) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Algo deu errado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs font-mono text-muted-foreground">
              {error.message}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={resetError} size="sm">
              Tentar novamente
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Recarregar página
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};