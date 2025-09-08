import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User } from 'lucide-react'

const CalendarioReservas = ({ user, onStatsUpdate }) => {
  const [reservas, setReservas] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadReservas()
  }, [currentDate])

  const loadReservas = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Calcular início e fim do mês atual
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const params = new URLSearchParams({
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString()
      })

      const response = await fetch(`/api/reservas?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setReservas(data.reservas || [])
        if (onStatsUpdate) onStatsUpdate()
      } else {
        setError('Erro ao carregar reservas')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Adicionar dias vazios do início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Adicionar dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getReservasForDay = (date) => {
    if (!date) return []
    
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)
    
    return reservas.filter(reserva => {
      const reservaStart = new Date(reserva.data_inicio)
      const reservaEnd = new Date(reserva.data_fim)
      
      return (reservaStart <= dayEnd && reservaEnd >= dayStart)
    })
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      'confirmada': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800',
      'pendente': 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const days = getDaysInMonth(currentDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Calendário de Reservas</CardTitle>
              <CardDescription>
                Visualize todas as reservas do mês
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold min-w-[150px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center font-semibold text-gray-600 text-sm">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayReservas = getReservasForDay(day)
              const isToday = day && day.getTime() === today.getTime()
              const isPastDay = day && day < today
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border rounded-lg ${
                    day ? 'bg-white' : 'bg-gray-50'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-semibold mb-1 ${
                        isToday ? 'text-blue-600' : isPastDay ? 'text-gray-400' : 'text-gray-900'
                      }`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayReservas.slice(0, 3).map((reserva) => (
                          <div
                            key={reserva.id}
                            className={`text-xs p-1 rounded truncate ${getStatusColor(reserva.status)}`}
                            title={`${reserva.titulo} - ${reserva.sala?.nome} (${formatTime(reserva.data_inicio)} - ${formatTime(reserva.data_fim)})`}
                          >
                            <div className="font-medium truncate">{reserva.titulo}</div>
                            <div className="truncate">{formatTime(reserva.data_inicio)}</div>
                          </div>
                        ))}
                        {dayReservas.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayReservas.length - 3} mais
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de reservas do dia selecionado */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas de Hoje</CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const todayReservas = getReservasForDay(new Date())
            
            if (todayReservas.length === 0) {
              return (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma reserva para hoje
                </p>
              )
            }
            
            return (
              <div className="space-y-3">
                {todayReservas.map((reserva) => (
                  <div key={reserva.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{reserva.titulo}</h4>
                        <Badge variant={reserva.status === 'confirmada' ? 'default' : 'secondary'}>
                          {reserva.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatTime(reserva.data_inicio)} - {formatTime(reserva.data_fim)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {reserva.sala?.nome}
                        </div>
                        {user.nivel_acesso === 'admin' && reserva.usuario && (
                          <div className="flex items-center">
                            <User className="mr-1 h-3 w-3" />
                            {reserva.usuario.username}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </CardContent>
      </Card>
    </div>
  )
}

export default CalendarioReservas

