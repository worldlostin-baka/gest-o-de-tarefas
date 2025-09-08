import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { LogOut, Calendar, MapPin, Users, Settings } from 'lucide-react'
import SalasManager from './SalasManager'
import ReservasManager from './ReservasManager'
import CalendarioReservas from './CalendarioReservas'

const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    totalSalas: 0,
    totalReservas: 0,
    reservasHoje: 0,
    salasDisponiveis: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Buscar estatísticas das salas
      const salasResponse = await fetch('/api/salas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const salasData = await salasResponse.json()
      
      // Buscar estatísticas das reservas
      const reservasResponse = await fetch('/api/reservas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const reservasData = await reservasResponse.json()
      
      // Calcular reservas de hoje
      const hoje = new Date().toISOString().split('T')[0]
      const reservasHoje = reservasData.reservas?.filter(reserva => 
        reserva.data_inicio.startsWith(hoje)
      ).length || 0
      
      setStats({
        totalSalas: salasData.total || 0,
        totalReservas: reservasData.total || 0,
        reservasHoje,
        salasDisponiveis: salasData.total || 0
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onLogout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Gestão de Reservas</h1>
              <p className="text-sm text-gray-600">
                Bem-vindo, {user.username} 
                <Badge variant="secondary" className="ml-2">
                  {user.nivel_acesso === 'admin' ? 'Administrador' : 'Usuário'}
                </Badge>
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Salas</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSalas}</div>
              <p className="text-xs text-muted-foreground">Salas cadastradas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReservas}</div>
              <p className="text-xs text-muted-foreground">Reservas ativas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas Hoje</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reservasHoje}</div>
              <p className="text-xs text-muted-foreground">Agendamentos para hoje</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salas Disponíveis</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.salasDisponiveis}</div>
              <p className="text-xs text-muted-foreground">Disponíveis agora</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="calendario" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
            <TabsTrigger value="reservas">Minhas Reservas</TabsTrigger>
            {user.nivel_acesso === 'admin' && (
              <TabsTrigger value="salas">Gestão de Salas</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="calendario">
            <CalendarioReservas user={user} onStatsUpdate={loadStats} />
          </TabsContent>
          
          <TabsContent value="reservas">
            <ReservasManager user={user} onStatsUpdate={loadStats} />
          </TabsContent>
          
          {user.nivel_acesso === 'admin' && (
            <TabsContent value="salas">
              <SalasManager onStatsUpdate={loadStats} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}

export default Dashboard

