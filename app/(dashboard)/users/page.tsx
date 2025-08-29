import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Award,
  Clock,
  TrendingUp,
  UserPlus,
  Shield,
  Eye,
  Edit
} from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function UsersPage() {
  // Admin users only - simplified user management 
  const users = [
    {
      id: 1,
      name: "Admin Principal",
      email: "admin@way-english.com",
      avatar: "/api/placeholder/40/40",
      role: "Administrador",
      status: "active",
      joinDate: "2023-05-12",
      lastActive: "Online agora",
      location: "Brasília, DF",
      phone: "+55 61 96666-3456",
      permissions: ["Gerenciar Cursos", "Gerenciar Conteúdo", "Configurações do Sistema"],
      lastUnit: "Unit 5: Business Presentations"
    },
    {
      id: 2,
      name: "Carlos Santos",
      email: "carlos.santos@way-english.com",
      avatar: "/api/placeholder/40/40",
      role: "Administrador",
      status: "active",
      joinDate: "2023-08-20",
      lastActive: "30 minutos atrás",
      location: "Rio de Janeiro, RJ",
      phone: "+55 21 98888-5678",
      permissions: ["Gerenciar Cursos", "Gerenciar Conteúdo"],
      lastUnit: "Unit 2: Past Continuous vs Simple Past"
    },
    {
      id: 3,
      name: "Ana Silva",
      email: "ana.silva@way-english.com",
      avatar: "/api/placeholder/40/40",
      role: "Administrador",
      status: "active",
      joinDate: "2024-01-15",
      lastActive: "2 horas atrás",
      location: "São Paulo, SP",
      phone: "+55 11 99999-1234",
      permissions: ["Gerenciar Conteúdo"],
      lastUnit: "Unit 8: Medical Vocabulary"
    }
  ]


  const getRoleColor = (role: string) => {
    return 'default'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'pending': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'inactive': return 'Inativo'
      case 'pending': return 'Pendente'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administradores</h1>
          <p className="text-muted-foreground">
            Gerencie administradores e permissões de acesso ao sistema
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />
          Novo Administrador
        </Button>
      </div>


      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Encontre administradores específicos usando os filtros abaixo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por nome ou email..." 
                  className="pl-10" 
                />
              </div>
            </div>
            
            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Permissões" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="full">Acesso Total</SelectItem>
                <SelectItem value="courses">Gerenciar Cursos</SelectItem>
                <SelectItem value="content">Gerenciar Conteúdo</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>


            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Administradores</CardTitle>
          <CardDescription>
            {users.length} administradores encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Lista completa de administradores da plataforma</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Última Unidade</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      {user.email}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Badge variant={getStatusColor(user.status)}>
                      {getStatusText(user.status)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="text-sm">
                      {user.lastUnit}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}